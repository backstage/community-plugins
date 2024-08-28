import { createPlugin } from '@backstage/core-plugin-api';

/**
 * The Backstage plugin that holds Confluence specific components
 *
 * @public
 */
export const confluencePlugin = createPlugin({
  id: 'confluence',
});
