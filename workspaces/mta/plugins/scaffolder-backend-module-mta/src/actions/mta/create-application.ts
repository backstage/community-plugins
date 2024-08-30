import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { Issuer } from 'openid-client';

export function createMTAApplicationAction(opts: any) {
  const { config, logger } = opts;

  return createTemplateAction<{
    name: string;
    url: string;
    branch: string;
    rootPath: string;
  }>({
    id: 'mta:createApplication',
    description: 'Create application in MTA',
    schema: {
      input: {
        type: 'object',
        required: ['name', 'url', 'branch', 'rootPath'],
        properties: {
          name: { title: 'Name of the application', type: 'string' },
          url: { title: 'Repository URL', type: 'string' },
          branch: { title: 'Branch', type: 'string' },
          rootPath: { title: 'Root Path', type: 'string' },
        },
      },
    },
    async handler(ctx) {
      const { name, url, branch, rootPath } = ctx.input;
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
          url: url.trim(),
          branch: branch.trim(),
          path: rootPath.trim(),
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
      } catch (error: any) {
        logger.error(
          `Error in creating application: ${error?.message as string}`,
        );
        throw error;
      }
    },
  });
}
