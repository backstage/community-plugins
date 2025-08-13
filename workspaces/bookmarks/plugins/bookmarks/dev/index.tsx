import { createDevApp } from '@backstage/dev-utils';
import { bookmarksPlugin } from '../src/plugin';
import { PluginTestPage } from '../src/components/PluginTestPage/PluginTestPage';

createDevApp()
  .registerPlugin(bookmarksPlugin)
  .addPage({
    element: <PluginTestPage />,
    title: 'Root Page',
    path: '/bookmarks',
  })
  .render();
