/**
 * scaffolderAction.ts — aws:assumeRole
 *
 * Custom Scaffolder action that issues a short-lived OIDC JWT and exchanges it
 * for AWS credentials via STS AssumeRoleWithWebIdentity.
 *
 * Role ARN resolution (in priority order):
 *   1. input.roleArn  — explicit ARN passed in the template step
  *   2. input.entityRef + annotation aws.backstage.io/assume-role-arn
 *      — reads the ARN from the Component entity in the catalog
 *
 * Output (available to subsequent steps via ${{ steps['...'].output.* }}):
 *   accessKeyId, secretAccessKey, sessionToken, expiration
 *
 * Example usage in a template:
 *
 *   - id: assume-role
 *     action: aws:assumeRole
 *     input:
 *       roleArn: ${{ parameters.deployRoleArn }}
 *       # --- or ---
 *       entityRef: component:default/${{ parameters.name }}
 *       subject: scaffolder:my-template       # optional, defaults to template name
 *       sessionName: backstage-${{ parameters.name }}
 *       durationSeconds: 900
 *
 *   - id: deploy
 *     action: aws:someDeployAction
 *     input:
 *       accessKeyId: ${{ steps['assume-role'].output.accessKeyId }}
 *       secretAccessKey: ${{ steps['assume-role'].output.secretAccessKey }}
 *       sessionToken: ${{ steps['assume-role'].output.sessionToken }}
 */

import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { stringifyEntityRef } from '@backstage/catalog-model';
import type { CatalogService } from '@backstage/plugin-catalog-node';
import { KmsService, JwtClaims } from './kmsService';
import { StsService } from './stsService';
import { fromIni } from '@aws-sdk/credential-providers';

/** Annotation key on Component entities that stores the IAM role ARN to assume */
export const DEPLOY_ROLE_ANNOTATION = 'aws.backstage.io/assume-role-arn';

export interface ScaffolderActionOptions {
  kmsService: KmsService;
  stsService: StsService;
  catalogService: CatalogService;
  /** Full issuer URL from config — embedded in every JWT as the iss claim */
  issuer: string;
}

export function createAwsAssumeRoleAction(options: ScaffolderActionOptions) {
  const { kmsService, stsService, catalogService, issuer } = options;

  return createTemplateAction({
    id: 'aws:assumeRole',
    description:
      'Issues a short-lived OIDC JWT and exchanges it for AWS credentials ' +
      'via STS AssumeRoleWithWebIdentity. Role ARN is resolved from an explicit ' +
      'input or from the aws.backstage.io/assume-role-arn annotation on a catalog entity.',

    schema: {
      input: (z: any) =>
        z
          .object({
            roleArn: z
              .string()
              .optional()
              .describe(
                'IAM role ARN to assume. Takes precedence over entityRef if both are provided.',
              ),
            entityRef: z
              .string()
              .optional()
              .describe(
                'Backstage entity ref (e.g. component:default/my-service). ' +
                  'The aws.backstage.io/assume-role-arn annotation on this entity ' +
                  'will be used as the role ARN.',
              ),
            subject: z
              .string()
              .optional()
              .describe(
                'JWT sub claim. Scopes the IAM trust policy to a specific template or entity. ' +
                  'Defaults to the entity ref (if provided) or "scaffolder:unknown".',
              ),
            sessionName: z
              .string()
              .optional()
              .describe(
                'STS session name. Visible in CloudTrail. Defaults to "backstage-session". ' +
                  'Max 64 chars; only alphanumerics, hyphens, and underscores.',
              ),
            durationSeconds: z
              .number()
              .int()
              .min(900)
              .max(43200)
              .optional()
              .describe(
                'Credential lifetime in seconds. Min 900 (15 min), max 43200 (12 h). Defaults to 900.',
              ),
            profile: z
              .string()
              .optional()
              .describe(
                'AWS CLI profile name to use for credentials. If provided, the STS AssumeRoleWithWebIdentity call will be skipped and credentials will be sourced directly from the specified profile. This is intended for testing with real AWS credentials in a local development environment.',
              ),
          })
          .refine(
            (data: { roleArn?: string; entityRef?: string }) =>
              data.roleArn || data.entityRef,
            {
              message: 'Either roleArn or entityRef must be provided',
            },
          ),

      output: (z: any) =>
        z.object({
          accessKeyId: z.string(),
          secretAccessKey: z.string(),
          sessionToken: z.string(),
          expiration: z.string().describe('Expiration timestamp'),
        }),
    },

    async handler(ctx) {
      const {
        roleArn: explicitRoleArn,
        entityRef,
        subject,
        sessionName = 'backstage-session',
        durationSeconds = 900,
        profile,
      } = ctx.input;

      // 1. Resolve role ARN

      let resolvedRoleArn: string;
      let credentials: any;
      if (profile) {
        ctx.logger.info(
          `[aws:assumeRole] Profile mode enabled — skipping role ARN resolution. ` +
            'STS AssumeRoleWithWebIdentity will be skipped and credentials will be sourced directly from the specified profile.',
        );
        resolvedRoleArn = 'profile-mode';

        const profile_credentials_ini = fromIni({ profile });
        const profile_credentials = await profile_credentials_ini().then(creds => {
          if (!creds.accessKeyId || !creds.secretAccessKey) {
            throw new Error(
              `Failed to load AWS credentials from profile "${profile}". Please check your AWS CLI configuration.`,
            );
          }
          return creds;
        });
        credentials = {
          accessKeyId: profile_credentials.accessKeyId,
          secretAccessKey: profile_credentials.secretAccessKey,
          sessionToken: profile_credentials.sessionToken ?? '',
          expiration: new Date(Date.now() + durationSeconds * 1000).toISOString(),
        };
      } else if (explicitRoleArn) {
        resolvedRoleArn = explicitRoleArn;
        ctx.logger.info(
          `[aws:assumeRole] Using explicit roleArn=${resolvedRoleArn}`,
        );
      } else {
        if (!entityRef) {
          throw new Error('Either roleArn or entityRef must be provided');
        }

        ctx.logger.info(
          `[aws:assumeRole] Looking up entity ${entityRef} for deploy role annotation`,
        );

        const credentials = await ctx.getInitiatorCredentials();
        const entity = await catalogService.getEntityByRef(entityRef, {
          credentials,
        });

        if (!entity) {
          throw new Error(
            `Entity not found in catalog: ${entityRef}. ` +
              'Make sure the entity is registered before running this template step.',
          );
        }

        const annotationArn =
          entity.metadata.annotations?.[DEPLOY_ROLE_ANNOTATION];
        if (!annotationArn) {
          throw new Error(
            `Entity ${entityRef} does not have the ${DEPLOY_ROLE_ANNOTATION} annotation. ` +
              'Add it to the catalog-info.yaml for this component.',
          );
        }

        resolvedRoleArn = annotationArn;
        ctx.logger.info(
          `[aws:assumeRole] Resolved roleArn=${resolvedRoleArn} from entity ${entityRef}`,
        );
      }

      // 2. Build JWT claims

      const now = Math.floor(Date.now() / 1000);

      // Default subject: use the entity ref when available (scopes trust policy
      // to a specific component), otherwise fall back to a generic scaffolder label.
      const defaultSubject = entityRef
        ? stringifyEntityRef({
            kind: 'component',
            namespace: 'default',
            name: entityRef.split('/').pop() ?? entityRef,
          })
        : 'scaffolder:unknown';

      const claims: JwtClaims = {
        iss: issuer,
        aud: 'sts.amazonaws.com',
        sub: subject ?? defaultSubject,
        iat: now,
        // JWT lifetime capped at 1 hour — STS credential duration is separate
        exp: now + Math.min(durationSeconds, 3600),
      };

      ctx.logger.info(
        `[aws:assumeRole] Issuing JWT — sub="${claims.sub}" iss="${issuer}"`,
      );

      // 3. Sign JWT

      const jwt = await kmsService.signJwt(claims);

      // 4. AssumeRoleWithWebIdentity

      if (!credentials) {
        credentials = await stsService.assumeRole({
          roleArn: resolvedRoleArn,
          webIdentityToken: jwt,
          // Sanitise session name: max 64 chars, only alphanumeric + hyphen + underscore
          sessionName: sessionName.slice(0, 64).replace(/[^a-zA-Z0-9\-_]/g, '-'),
          durationSeconds,
        });
      }

      ctx.logger.info(
        `[aws:assumeRole] Credentials obtained — role=${resolvedRoleArn} expires=${credentials.expiration}`,
      );

      // 5. Output credentials

      ctx.output('accessKeyId', credentials.accessKeyId);
      ctx.output('secretAccessKey', credentials.secretAccessKey);
      ctx.output('sessionToken', credentials.sessionToken);
      ctx.output('expiration', credentials.expiration);
    },
  });
}
