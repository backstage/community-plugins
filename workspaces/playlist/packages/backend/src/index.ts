import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

backend.add(import('@backstage/plugin-app-backend/alpha'));

backend.add(import('@backstage/plugin-auth-backend'));
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));

backend.add(import('@backstage/plugin-catalog-backend/alpha'));

backend.add(import('@backstage/plugin-permission-backend/alpha'));
backend.add(import('./permissionPolicyModule'));

backend.add(import('@backstage-community/plugin-playlist-backend'));

backend.add(import('@backstage/plugin-search-backend/alpha'));
backend.add(import('@backstage/plugin-search-backend-module-catalog/alpha'));

backend.start();
