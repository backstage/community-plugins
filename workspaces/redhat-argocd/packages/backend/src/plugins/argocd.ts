import { createRouter } from '@roadiehq/backstage-plugin-argo-cd-backend';

export default async function createPlugin({
  logger,
  config,
}: {
  logger: any;
  config: any;
}) {
  return await createRouter({ logger, config });
}
