import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

backend.add(import('../src'));
backend.add(import('@backstage/plugin-catalog-backend/alpha'));

backend.start();
