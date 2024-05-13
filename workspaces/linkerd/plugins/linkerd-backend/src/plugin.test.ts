import { startTestBackend } from '@backstage/backend-test-utils';
import request from 'supertest';
import { linkerdPlugin } from './plugin';

describe('linkerd plugin', () => {
  describe('GET /health', () => {
    it('returns ok', async () => {
      const { server } = await startTestBackend({
        features: [linkerdPlugin()],
      });
      const response = await request(server).get('/api/linkerd/health');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});
