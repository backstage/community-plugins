import { createDevApp } from '@backstage/dev-utils';
import { plugin, MendPage } from '../src/plugin';

createDevApp()
  .registerPlugin(plugin)
  .addPage({
    element: <MendPage />,
    title: 'Mend Page',
    path: '/mend',
  })
  .render();
