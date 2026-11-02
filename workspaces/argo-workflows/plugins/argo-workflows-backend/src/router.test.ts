/*
 * Copyright 2026 The Backstage Authors
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

import type { AddressInfo } from 'net';
import http, { type Server } from 'http';
import express from 'express';
import { ConfigReader } from '@backstage/config';
import type { JsonObject } from '@backstage/types';
import { createRouter } from './router';

/**
 * Issues a GET request using Node's `http` module directly, rather than the
 * global `fetch`, since the service under test also calls global `fetch`
 * (to reach the mocked upstream Argo server) and mocking it would otherwise
 * intercept this request to our own local test server too.
 */
function httpGet(url: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    http
      .get(url, res => {
        let body = '';
        res.on('data', chunk => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({ status: res.statusCode ?? 0, body });
        });
      })
      .on('error', reject);
  });
}

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  child: jest.fn().mockReturnThis(),
};

const mockHttpAuth = {
  credentials: jest.fn().mockResolvedValue({ principal: { type: 'user' } }),
  issueUserCookie: jest.fn(),
};

/** Starts the router on an ephemeral port and returns the base URL + server. */
async function startTestServer(
  data: JsonObject,
): Promise<{ baseUrl: string; server: Server }> {
  const router = await createRouter({
    config: new ConfigReader(data),
    httpAuth: mockHttpAuth as any,
    logger: mockLogger,
  });

  const app = express().use(router);

  return new Promise(resolve => {
    const server = app.listen(0, () => {
      const { port } = server.address() as AddressInfo;
      resolve({ baseUrl: `http://localhost:${port}`, server });
    });
  });
}

describe('router', () => {
  const argoServerConfig = {
    argoWorkflows: {
      defaultInstance: 'default',
      instances: [
        {
          name: 'default',
          baseUrl: 'http://argo.example.com',
          token: 'test-token',
        },
        {
          name: 'other',
          baseUrl: 'http://argo-other.example.com',
          token: 'test-token',
        },
      ],
    },
  };

  let server: Server;
  let baseUrl: string;

  afterEach(() => {
    jest.restoreAllMocks();
    server?.close();
  });

  describe('GET /workflows/:namespace/:name', () => {
    it('treats a repeated instanceName query param as absent and falls back to the default instance', async () => {
      ({ baseUrl, server } = await startTestServer(argoServerConfig));

      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify({
            metadata: {
              name: 'wf-1',
              namespace: 'default',
              uid: 'uid-1',
              creationTimestamp: '2024-01-01T00:00:00Z',
            },
            status: { phase: 'Succeeded' },
          }),
          { status: 200 },
        ),
      );

      // ?instanceName=default&instanceName=other — Express parses this as
      // a string[], which must not be forwarded to the service as-is.
      const response = await httpGet(
        `${baseUrl}/workflows/default/wf-1?instanceName=default&instanceName=other`,
      );

      expect(response.status).toBe(200);
      // Falls back to the default instance ('default'), not 'other'.
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('http://argo.example.com'),
        expect.anything(),
      );
    });

    it('uses the requested instance when instanceName is a single value', async () => {
      ({ baseUrl, server } = await startTestServer(argoServerConfig));

      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify({
            metadata: {
              name: 'wf-1',
              namespace: 'default',
              uid: 'uid-1',
              creationTimestamp: '2024-01-01T00:00:00Z',
            },
            status: { phase: 'Succeeded' },
          }),
          { status: 200 },
        ),
      );

      const response = await httpGet(
        `${baseUrl}/workflows/default/wf-1?instanceName=other`,
      );

      expect(response.status).toBe(200);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('http://argo-other.example.com'),
        expect.anything(),
      );
    });
  });

  describe('GET /workflows', () => {
    it('treats a repeated instanceName query param as absent and falls back to the default instance', async () => {
      ({ baseUrl, server } = await startTestServer(argoServerConfig));

      const fetchSpy = jest
        .spyOn(global, 'fetch')
        .mockResolvedValue(
          new Response(JSON.stringify({ items: [] }), { status: 200 }),
        );

      const response = await httpGet(
        `${baseUrl}/workflows?labelSelector=app%3Dtest&instanceName=default&instanceName=other`,
      );

      expect(response.status).toBe(200);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('http://argo.example.com'),
        expect.anything(),
      );
    });
  });
});
