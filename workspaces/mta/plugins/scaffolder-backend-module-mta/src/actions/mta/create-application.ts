import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { Issuer } from 'openid-client';

/**
 * Creates an action that creates an application in MTA.
 */

/** @public */
export function createMTAApplicationAction(opts: any) {
  const { config, logger } = opts;

  return createTemplateAction({
    id: 'mta:createApplication',
    description: 'Create application in MTA',
    supportsDryRun: false,
    async handler(ctx) {
      const { name, url, branch, rootPath } = ctx.input as {
        name: string;
        url: string;
        branch: string;
        rootPath: string;
      };

      const baseUrl = config.getString('mta.url');
      const baseURLHub = `${baseUrl}/hub`;
      const realm = config.getString('mta.providerAuth.realm');
      const clientID = config.getString('mta.providerAuth.clientID');
      const secret = config.getString('mta.providerAuth.secret');
      const baseURLAuth = `${baseUrl}/auth/realms/${realm}`;

      try {
        const mtaAuthIssuer = await Issuer.discover(baseURLAuth);
        const authClient = new mtaAuthIssuer.Client({
          client_id: clientID,
          client_secret: secret,
          response_types: ['code'],
        });

        const tokenSet = await authClient.grant({
          grant_type: 'client_credentials',
        });

        if (!tokenSet.access_token) {
          logger.error('Failed to obtain access token from auth server.');
          throw new Error(
            'Unable to access hub due to authentication failure.',
          );
        }

        const repository = {
          kind: 'git',
          url: String(url).trim(),
          branch: String(branch).trim(),
          path: String(rootPath).trim(),
        };
        const body = JSON.stringify({ name, repository });

        const response = await fetch(`${baseURLHub}/applications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenSet.access_token}`,
          },
          body,
        });

        if (!response.ok) {
          const responseText = await response.text();
          logger.error(`HTTP Error ${response.status}: ${responseText}`);
          throw new Error(
            `Failed to create application. Server responded with status: ${response.status}`,
          );
        }

        const responseData = await response.json();
        logger.info(
          `Application created successfully: ${JSON.stringify(responseData)}`,
        );

        // Set outputs for use in subsequent steps
        ctx.output('applicationId', responseData.id);
        ctx.output('applicationName', responseData.name);
      } catch (error: any) {
        logger.error(
          `Error in creating application: ${error?.message as string}`,
        );
        throw error;
      }
    },
  });
}
