import {
  createPlugin,
  createComponentExtension,
} from '@backstage/core-plugin-api';

export const acsPlugin = createPlugin({
  id: 'acs',
});

export const EntityACSContent = acsPlugin.provide(
  createComponentExtension({
    name: 'EntityACSContent',
    component: {
      lazy: () => import('./components/ACSComponent').then(m => m.ACSComponent),
    },
  }),
);
