import type { Router } from 'express';
import type { RouterOptions } from '../service/router';
import { getToken } from '../controllers/token';

export const registerTokenRoutes = (router: Router, options: RouterOptions) => {
  router.get('/token', getToken(options));
};
