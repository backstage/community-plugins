import type { Router } from 'express';
import type { RouterOptions } from '../service/router';
import { getHealth } from '../controllers/health';

export const registerHealthRoutes = (
  router: Router,
  options: RouterOptions,
) => {
  router.get('/health', getHealth(options));
};
