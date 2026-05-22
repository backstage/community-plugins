/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { SonarCloudClient } from './sonarcloudClient';
import {
  SonarCloudApiError,
  SonarCloudRateLimitError,
  SonarCloudTimeoutError,
} from './errors';

describe('SonarCloudClient', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const mockResponse = (
    body: unknown,
    status = 200,
    headers?: Record<string, string>,
  ) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json', ...headers },
    });

  const mockTextResponse = (body: string, status: number) =>
    new Response(body, {
      status,
      headers: { 'Content-Type': 'text/html' },
    });

  // --------------------------------------------------------------- baseUrl

  describe('baseUrl', () => {
    it('should default to https://sonarcloud.io', async () => {
      fetchSpy.mockResolvedValueOnce(
        mockResponse({ project: { key: 'my-proj', uuid: 'uuid-123' } }),
      );
      const client = new SonarCloudClient({ token: 'tok' });

      await client.renameMainBranch({ projectKey: 'p', name: 'main' });

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toMatch(/^https:\/\/sonarcloud\.io\//);
    });

    it('should use a custom baseUrl', async () => {
      fetchSpy.mockResolvedValueOnce(
        mockResponse({ project: { key: 'my-proj', uuid: 'uuid-123' } }),
      );
      const client = new SonarCloudClient({
        token: 'tok',
        baseUrl: 'https://custom.example.com',
      });

      await client.renameMainBranch({ projectKey: 'p', name: 'main' });

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toMatch(/^https:\/\/custom\.example\.com\//);
    });

    it('should strip trailing slash from baseUrl', async () => {
      fetchSpy.mockResolvedValueOnce(
        mockResponse({ project: { key: 'my-proj', uuid: 'uuid-123' } }),
      );
      const client = new SonarCloudClient({
        token: 'tok',
        baseUrl: 'https://custom.example.com/',
      });

      await client.renameMainBranch({ projectKey: 'p', name: 'main' });

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).not.toMatch(/\/\//g.test(url) ? /example\.com\/\// : /^$/);
      expect(url).toContain('https://custom.example.com/api/');
    });
  });

  // ------------------------------------------------ authentication & headers

  describe('authentication', () => {
    it('should send Authorization: Bearer <token> header on every request', async () => {
      fetchSpy.mockResolvedValueOnce(
        mockResponse({ project: { key: 'my-proj', uuid: 'uuid-123' } }),
      );
      const client = new SonarCloudClient({ token: 'my-secret-token' });

      await client.renameMainBranch({ projectKey: 'p', name: 'main' });

      const init = fetchSpy.mock.calls[0][1] as RequestInit;
      expect((init.headers as Record<string, string>).Authorization).toBe(
        'Bearer my-secret-token',
      );
    });

    it('should send Content-Type: application/x-www-form-urlencoded for POST requests', async () => {
      fetchSpy.mockResolvedValueOnce(
        mockResponse({ project: { key: 'my-proj', uuid: 'uuid-123' } }),
      );
      const client = new SonarCloudClient({ token: 'tok' });

      await client.renameMainBranch({ projectKey: 'p', name: 'main' });

      const init = fetchSpy.mock.calls[0][1] as RequestInit;
      expect((init.headers as Record<string, string>)['Content-Type']).toBe(
        'application/x-www-form-urlencoded',
      );
    });
  });

  // ------------------------------------------------ GET query params

  describe('GET query params', () => {
    it('should append params to URL as query parameters for GET requests', async () => {
      fetchSpy.mockResolvedValueOnce(
        mockResponse({ qualitygates: [{ id: 1, name: 'G' }] }),
      );
      const client = new SonarCloudClient({ token: 'tok' });

      await client.listQualityGates('my-org');

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain('organization=my-org');
    });
  });

  // ------------------------------------------------ POST form body

  describe('POST form body', () => {
    it('should send params in request body, not in URL for POST requests', async () => {
      fetchSpy.mockResolvedValueOnce(
        mockResponse({ project: { key: 'my-proj', uuid: 'uuid-123' } }),
      );
      const client = new SonarCloudClient({ token: 'tok' });

      await client.renameMainBranch({ projectKey: 'p-key', name: 'develop' });

      const url = fetchSpy.mock.calls[0][0] as string;
      const init = fetchSpy.mock.calls[0][1] as RequestInit;
      expect(url).not.toContain('project=');
      expect(url).not.toContain('name=');
      expect(init.body).toContain('project=p-key');
      expect(init.body).toContain('name=develop');
    });
  });

  // ------------------------------------------------ retry on 429

  describe('retry on 429', () => {
    it('should retry on 429 and succeed on the 4th attempt', async () => {
      fetchSpy
        .mockResolvedValueOnce(new Response(null, { status: 429 }))
        .mockResolvedValueOnce(new Response(null, { status: 429 }))
        .mockResolvedValueOnce(new Response(null, { status: 429 }))
        .mockResolvedValueOnce(
          mockResponse({ project: { key: 'my-proj', uuid: 'uuid-123' } }),
        );

      const client = new SonarCloudClient({ token: 'tok' });
      const promise = client.renameMainBranch({
        projectKey: 'p',
        name: 'main',
      });

      // Advance through the 3 retry delays: 1s, 2s, 4s
      await jest.advanceTimersByTimeAsync(1_000);
      await jest.advanceTimersByTimeAsync(2_000);
      await jest.advanceTimersByTimeAsync(4_000);

      await promise;

      expect(fetchSpy).toHaveBeenCalledTimes(4);
    });

    it('should throw SonarCloudRateLimitError when all retries exhausted (4x 429)', async () => {
      fetchSpy
        .mockResolvedValueOnce(new Response(null, { status: 429 }))
        .mockResolvedValueOnce(new Response(null, { status: 429 }))
        .mockResolvedValueOnce(new Response(null, { status: 429 }))
        .mockResolvedValueOnce(new Response(null, { status: 429 }));

      const client = new SonarCloudClient({ token: 'tok' });

      // Attach catch handler BEFORE advancing timers to prevent unhandled rejection
      let caughtError: unknown;
      const promise = client
        .renameMainBranch({ projectKey: 'p', name: 'main' })
        .catch((e: unknown) => {
          caughtError = e;
        });

      // Advance through the 3 retry delays: 1s, 2s, 4s
      await jest.advanceTimersByTimeAsync(1_000);
      await jest.advanceTimersByTimeAsync(2_000);
      await jest.advanceTimersByTimeAsync(4_000);

      await promise;
      expect(caughtError).toBeInstanceOf(SonarCloudRateLimitError);
      expect((caughtError as SonarCloudRateLimitError).attempts).toBe(4);
    });

    it('should reconstruct body on retry (body is present on retried requests)', async () => {
      fetchSpy
        .mockResolvedValueOnce(new Response(null, { status: 429 }))
        .mockResolvedValueOnce(
          mockResponse({ project: { key: 'my-proj', uuid: 'uuid-123' } }),
        );

      const client = new SonarCloudClient({ token: 'tok' });
      const promise = client.renameMainBranch({
        projectKey: 'p',
        name: 'main',
      });

      await jest.advanceTimersByTimeAsync(1_000);
      await promise;

      // Verify both calls have a body
      const firstInit = fetchSpy.mock.calls[0][1] as RequestInit;
      const secondInit = fetchSpy.mock.calls[1][1] as RequestInit;
      expect(firstInit.body).toBeTruthy();
      expect(secondInit.body).toBeTruthy();
      expect(firstInit.body).toEqual(secondInit.body);
    });

    it('should throw SonarCloudRateLimitError when retry sequence cap would be exceeded', async () => {
      // Mock Date.now to simulate time passing close to the 60s cap
      let callCount = 0;
      jest.spyOn(Date, 'now').mockImplementation(() => {
        callCount++;
        // First call (retryStart): 0
        // Second call (elapsed check): 59_000 (so elapsed=59000, next delay=1000 => 60000 === cap, but > cap? No. Let's use 59001)
        if (callCount === 1) return 0;
        return 59_001; // elapsed=59001, next delay=1000 => 60001 > 60000 cap
      });

      fetchSpy.mockResolvedValueOnce(new Response(null, { status: 429 }));

      const client = new SonarCloudClient({ token: 'tok' });

      let caughtError: unknown;
      const promise = client
        .renameMainBranch({ projectKey: 'p', name: 'main' })
        .catch((e: unknown) => {
          caughtError = e;
        });

      await promise;
      expect(caughtError).toBeInstanceOf(SonarCloudRateLimitError);
      expect((caughtError as SonarCloudRateLimitError).attempts).toBe(1);

      jest.spyOn(Date, 'now').mockRestore();
    });

    it('should check 429 before generic non-2xx (response eval order)', async () => {
      // A 429 should trigger retry, not throw SonarCloudApiError
      fetchSpy
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ errors: [{ msg: 'Rate limited' }] }), {
            status: 429,
          }),
        )
        .mockResolvedValueOnce(
          mockResponse({ project: { key: 'my-proj', uuid: 'uuid-123' } }),
        );

      const client = new SonarCloudClient({ token: 'tok' });
      const promise = client.renameMainBranch({
        projectKey: 'p',
        name: 'main',
      });

      await jest.advanceTimersByTimeAsync(1_000);
      await promise;

      // If eval order were wrong, it would have thrown SonarCloudApiError
      // instead of retrying. The fact we succeed means 429 was checked first.
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });

  // ------------------------------------------------ timeout

  describe('timeout', () => {
    it('should pass an AbortSignal to fetch', async () => {
      fetchSpy.mockResolvedValueOnce(
        mockResponse({ project: { key: 'my-proj', uuid: 'uuid-123' } }),
      );
      const client = new SonarCloudClient({ token: 'tok' });

      await client.renameMainBranch({ projectKey: 'p', name: 'main' });

      const init = fetchSpy.mock.calls[0][1] as RequestInit;
      expect(init.signal).toBeDefined();
      expect(init.signal).toBeInstanceOf(AbortSignal);
    });

    it('should throw SonarCloudTimeoutError when request aborts', async () => {
      fetchSpy.mockImplementation(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener('abort', () => {
              const err = new DOMException(
                'The operation was aborted.',
                'AbortError',
              );
              reject(err);
            });
          }),
      );

      const client = new SonarCloudClient({ token: 'tok' });

      // Attach catch handler BEFORE advancing timers to prevent unhandled rejection
      let caughtError: unknown;
      const promise = client
        .renameMainBranch({ projectKey: 'p', name: 'main' })
        .catch((e: unknown) => {
          caughtError = e;
        });

      // Advance past the 30s timeout
      await jest.advanceTimersByTimeAsync(30_000);

      await promise;
      expect(caughtError).toBeInstanceOf(SonarCloudTimeoutError);
      expect((caughtError as SonarCloudTimeoutError).endpoint).toBe(
        '/api/project_branches/rename',
      );
    });
  });

  // ------------------------------------------------ API error parsing

  describe('API error parsing', () => {
    it('should parse valid JSON error response into SonarCloudApiError with messages', async () => {
      fetchSpy.mockResolvedValueOnce(
        mockResponse({ errors: [{ msg: 'Insufficient privileges' }] }, 401),
      );
      const client = new SonarCloudClient({ token: 'tok' });

      const err = await client
        .renameMainBranch({ projectKey: 'p', name: 'main' })
        .catch((e: unknown) => e);

      expect(err).toBeInstanceOf(SonarCloudApiError);
      expect((err as SonarCloudApiError).status).toBe(401);
      expect((err as SonarCloudApiError).messages).toEqual([
        'Insufficient privileges',
      ]);
    });

    it('should handle non-JSON error body with fallback message', async () => {
      fetchSpy.mockResolvedValueOnce(
        mockTextResponse('<html>Bad Gateway</html>', 502),
      );
      const client = new SonarCloudClient({ token: 'tok' });

      const err = await client
        .renameMainBranch({ projectKey: 'p', name: 'main' })
        .catch((e: unknown) => e);

      expect(err).toBeInstanceOf(SonarCloudApiError);
      expect((err as SonarCloudApiError).status).toBe(502);
      expect((err as SonarCloudApiError).messages[0]).toContain('502');
    });
  });

  // ------------------------------------------------ network error wrapping

  describe('network error wrapping', () => {
    it('should wrap fetch rejection in Error with context and cause', async () => {
      const networkErr = new TypeError('fetch failed');
      fetchSpy.mockRejectedValueOnce(networkErr);
      const client = new SonarCloudClient({ token: 'tok' });

      const err = await client
        .renameMainBranch({ projectKey: 'p', name: 'main' })
        .then(() => undefined)
        .catch((e: unknown) => e);

      expect(err).toBeInstanceOf(Error);
      expect((err as Error).message).toContain(
        'SonarCloud request to /api/project_branches/rename failed',
      );
      expect((err as Error).cause).toBe(networkErr);
    });
  });

  // ------------------------------------------------ createProject

  describe('createProject', () => {
    it('should create a project and return key and URL', async () => {
      fetchSpy.mockResolvedValueOnce(
        mockResponse({ project: { key: 'my-proj', uuid: 'uuid-123' } }),
      );
      const client = new SonarCloudClient({ token: 'tok' });

      const result = await client.createProject({
        organization: 'org',
        name: 'My Project',
        key: 'my-proj',
      });

      expect(result).toEqual({
        projectKey: 'my-proj',
        projectId: 'uuid-123',
        projectUrl: 'https://sonarcloud.io/project/overview?id=my-proj',
      });

      const init = fetchSpy.mock.calls[0][1] as RequestInit;
      const body = new URLSearchParams(init.body as string);
      expect(body.get('name')).toBe('My Project');
      expect(body.get('organization')).toBe('org');
      expect(body.get('project')).toBe('my-proj');
    });
  });

  // ------------------------------------------------ bindProject

  describe('bindProject', () => {
    it('should POST JSON to v2 API for binding', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'b1' }), { status: 201 }),
      );
      const client = new SonarCloudClient({ token: 'tok' });

      await client.bindProject({
        projectId: 'uuid-123',
        repositoryId: 'Cibahealth/my-service',
      });

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toBe(
        'https://api.sonarcloud.io/dop-translation/project-bindings',
      );

      const init = fetchSpy.mock.calls[0][1] as RequestInit;
      expect(init.method).toBe('POST');
      const body = JSON.parse(init.body as string);
      expect(body.projectId).toBe('uuid-123');
      expect(body.repositoryId).toBe('Cibahealth/my-service');
    });
  });

  // ------------------------------------------------ renameMainBranch

  describe('renameMainBranch', () => {
    it('should send correct params to rename endpoint', async () => {
      fetchSpy.mockResolvedValueOnce(
        mockResponse({ project: { key: 'my-proj', uuid: 'uuid-123' } }),
      );
      const client = new SonarCloudClient({ token: 'tok' });

      await client.renameMainBranch({ projectKey: 'p', name: 'develop' });

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain('/api/project_branches/rename');

      const init = fetchSpy.mock.calls[0][1] as RequestInit;
      const body = new URLSearchParams(init.body as string);
      expect(body.get('project')).toBe('p');
      expect(body.get('name')).toBe('develop');
    });
  });

  // ------------------------------------------------ listQualityGates

  describe('listQualityGates', () => {
    it('should return quality gates from valid response', async () => {
      fetchSpy.mockResolvedValueOnce(
        mockResponse({
          qualitygates: [
            { id: 1, name: 'Sonar way', isDefault: true },
            { id: 2, name: 'Custom' },
          ],
        }),
      );
      const client = new SonarCloudClient({ token: 'tok' });

      const gates = await client.listQualityGates('org');

      expect(gates).toEqual([
        { id: 1, name: 'Sonar way' },
        { id: 2, name: 'Custom' },
      ]);
    });

    it('should throw when response is missing qualitygates array', async () => {
      fetchSpy.mockResolvedValueOnce(mockResponse({ something: 'else' }));
      const client = new SonarCloudClient({ token: 'tok' });

      const err = await client.listQualityGates('org').catch((e: unknown) => e);

      expect(err).toBeInstanceOf(SonarCloudApiError);
      expect((err as Error).message).toMatch(/missing qualitygates array/);
    });

    it('should throw when a gate id is not a number', async () => {
      fetchSpy.mockResolvedValueOnce(
        mockResponse({
          qualitygates: [{ id: 'not-a-number', name: 'Bad Gate' }],
        }),
      );
      const client = new SonarCloudClient({ token: 'tok' });

      const err = await client.listQualityGates('org').catch((e: unknown) => e);

      expect(err).toBeInstanceOf(SonarCloudApiError);
      expect((err as Error).message).toMatch(/not a number/);
    });
  });

  // ------------------------------------------------ selectQualityGate

  describe('selectQualityGate', () => {
    it('should send correct params', async () => {
      fetchSpy.mockResolvedValueOnce(
        mockResponse({ project: { key: 'my-proj', uuid: 'uuid-123' } }),
      );
      const client = new SonarCloudClient({ token: 'tok' });

      await client.selectQualityGate({
        projectKey: 'p',
        gateId: 42,
        organization: 'org',
      });

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain('/api/qualitygates/select');

      const init = fetchSpy.mock.calls[0][1] as RequestInit;
      const body = new URLSearchParams(init.body as string);
      expect(body.get('projectKey')).toBe('p');
      expect(body.get('gateId')).toBe('42');
      expect(body.get('organization')).toBe('org');
    });
  });

  // ------------------------------------------------ setNewCodePeriod

  describe('setNewCodePeriod', () => {
    it('should set type and value via settings API for number_of_days', async () => {
      fetchSpy
        .mockResolvedValueOnce(
          mockResponse({ project: { key: 'my-proj', uuid: 'uuid-123' } }),
        )
        .mockResolvedValueOnce(
          mockResponse({ project: { key: 'my-proj', uuid: 'uuid-123' } }),
        );
      const client = new SonarCloudClient({ token: 'tok' });

      await client.setNewCodePeriod({
        projectKey: 'p',
        type: 'number_of_days',
        value: '30',
      });

      expect(fetchSpy).toHaveBeenCalledTimes(2);

      const typeBody = new URLSearchParams(
        (fetchSpy.mock.calls[0][1] as RequestInit).body as string,
      );
      expect(typeBody.get('key')).toBe('sonar.leak.period.type');
      expect(typeBody.get('value')).toBe('days');
      expect(typeBody.get('component')).toBe('p');

      const valBody = new URLSearchParams(
        (fetchSpy.mock.calls[1][1] as RequestInit).body as string,
      );
      expect(valBody.get('key')).toBe('sonar.leak.period');
      expect(valBody.get('value')).toBe('30');
      expect(valBody.get('component')).toBe('p');
    });

    it('should reset both keys for previous_version', async () => {
      fetchSpy.mockResolvedValueOnce(
        mockResponse({ project: { key: 'my-proj', uuid: 'uuid-123' } }),
      );
      const client = new SonarCloudClient({ token: 'tok' });

      await client.setNewCodePeriod({
        projectKey: 'p',
        type: 'previous_version',
      });

      expect(fetchSpy).toHaveBeenCalledTimes(1);

      const body = new URLSearchParams(
        (fetchSpy.mock.calls[0][1] as RequestInit).body as string,
      );
      expect(body.get('keys')).toBe('sonar.leak.period,sonar.leak.period.type');
      expect(body.get('component')).toBe('p');
    });
  });
});
