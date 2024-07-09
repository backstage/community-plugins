import { createPlugin } from '@backstage/core-plugin-api';

import { scaffolderPlugin } from '@backstage/plugin-scaffolder';
import { createScaffolderFieldExtension } from '@backstage/plugin-scaffolder-react';

import { DevfileSelectorExtension, DevfileSelectorExtensionWithOptionsSchema } from './components/DevfileSelectorExtension';

export const devfileSelectorExtensionPlugin = createPlugin({
  id: 'devfile-selector-extension'
})

export const DevfileSelectorFieldExtension = scaffolderPlugin.provide(
  createScaffolderFieldExtension({
      name: 'DevfileSelectorExtension',
      component: DevfileSelectorExtension,
      schema: DevfileSelectorExtensionWithOptionsSchema,
  }),
);
