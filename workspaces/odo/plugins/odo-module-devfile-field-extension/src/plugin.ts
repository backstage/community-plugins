import { createPlugin } from '@backstage/core-plugin-api';

import { scaffolderPlugin } from '@backstage/plugin-scaffolder';
import { createScaffolderFieldExtension } from '@backstage/plugin-scaffolder-react';

import { DevfileSelectorExtension } from './components/DevfileSelectorExtension';
import { DevfileSelectorExtensionWithOptionsSchema } from './components/schema';

export const devfileSelectorExtensionPlugin = createPlugin({
  id: 'devfile-selector-extension',
});

export const DevfileSelectorFieldExtension = scaffolderPlugin.provide(
  createScaffolderFieldExtension({
    name: 'DevfileSelectorExtension',
    component: DevfileSelectorExtension,
    schema: DevfileSelectorExtensionWithOptionsSchema,
  }),
);
