/*
 * Hi!
 *
 * Note that this is an EXAMPLE Backstage backend. Please check the README.
 *
 * Happy hacking!
 */

import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

backend.add(import('@backstage/plugin-app-backend/alpha'));
backend.add(import('@backstage/plugin-proxy-backend/alpha'));

// auth plugins
backend.add(import('@backstage/plugin-auth-backend'));
// See https://backstage.io/docs/backend-system/building-backends/migrating#the-auth-plugin
// use actual configured github auth to be able to test github-actions integration is working as expected
backend.add(import('./modules/auth'));

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend/alpha'));

backend.start();
