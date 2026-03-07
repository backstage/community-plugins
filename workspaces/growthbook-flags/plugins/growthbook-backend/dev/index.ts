import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();
backend.add(import('../src'));
backend.start();
