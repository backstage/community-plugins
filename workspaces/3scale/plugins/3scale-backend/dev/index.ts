import { createBackend } from '@backstage/backend-defaults';
import { catalogModule3ScaleEntityProvider } from '../src/module';

const backend = createBackend();

backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(catalogModule3ScaleEntityProvider);

backend.start();
