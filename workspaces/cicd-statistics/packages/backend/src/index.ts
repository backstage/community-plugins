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

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend/alpha'));

backend.start();
