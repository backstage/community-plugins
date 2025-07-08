/*
 * Copyright 2025 The Backstage Authors
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

import { servicenowPlugin } from './plugin';
import {
  coreServices,
  createServiceFactory,
} from '@backstage/backend-plugin-api';
import { startTestBackend, mockServices } from '@backstage/backend-test-utils';
import { createRouter } from './service/router';
import { readServiceNowConfig } from './config';

jest.mock('./service/router');
jest.mock('./config');

describe('servicenowPlugin', () => {
  const mockRouter = jest.fn();
  const mockConfig = {
    data: {
      servicenow: {
        instanceUrl: 'https://dev12345.service-now.com',
      },
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
    (createRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should be initialized with a valid configuration', async () => {
    (readServiceNowConfig as jest.Mock).mockReturnValue(
      mockConfig.data.servicenow,
    );

    const httpRouter = mockServices.httpRouter.mock();

    await startTestBackend({
      features: [
        servicenowPlugin,
        mockServices.logger.factory(),
        mockServices.rootConfig.factory({ data: mockConfig.data }),
        createServiceFactory({
          service: coreServices.httpRouter,
          deps: {},
          factory: () => httpRouter,
        }),
        mockServices.httpAuth.factory(),
      ],
    });

    expect(readServiceNowConfig).toHaveBeenCalled();
    expect(createRouter).toHaveBeenCalledWith(
      expect.objectContaining({
        servicenowConfig: mockConfig.data.servicenow,
        logger: expect.anything(),
        httpAuth: expect.anything(),
      }),
    );
    expect(httpRouter.use).toHaveBeenCalledWith(mockRouter);
  });

  it('should not initialize if configuration is missing', async () => {
    (readServiceNowConfig as jest.Mock).mockReturnValue(undefined);

    const httpRouter = mockServices.httpRouter.mock();

    await startTestBackend({
      features: [
        servicenowPlugin,
        mockServices.logger.factory(),
        mockServices.rootConfig.factory({ data: {} }),
        createServiceFactory({
          service: coreServices.httpRouter,
          deps: {},
          factory: () => httpRouter,
        }),
        mockServices.httpAuth.factory(),
      ],
    });

    expect(readServiceNowConfig).toHaveBeenCalled();
    expect(createRouter).not.toHaveBeenCalled();
    expect(httpRouter.use).not.toHaveBeenCalled();
  });
});
