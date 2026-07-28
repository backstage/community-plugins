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

import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { mockServices } from '@backstage/backend-test-utils';
import { ConfigReader } from '@backstage/config';
import { mockConfig, mockFeedback } from '../mocks';
import { registerFeedbackActions } from './feedbackActions';

jest.mock('../database/feedbackStore', () => ({
  DatabaseFeedbackStore: {
    create: jest.fn().mockImplementation(() => {
      return {
        getFeedbackByUuid: jest.fn().mockResolvedValue(mockFeedback),
        checkFeedbackId: jest.fn().mockResolvedValue(true),
        getAllFeedbacks: jest.fn().mockResolvedValue({
          data: [mockFeedback],
          count: 1,
        }),
        storeFeedbackGetUuid: jest.fn().mockResolvedValue({
          feedbackId: mockFeedback.feedbackId,
          projectId: mockFeedback.projectId,
        }),
        updateFeedback: jest.fn().mockResolvedValue(mockFeedback),
        deleteFeedbackById: jest.fn().mockResolvedValue(1),
      };
    }),
  },
}));

describe('feedbackActions', () => {
  const mockRegister = jest.fn();
  const mockActionsRegistry: jest.Mocked<ActionsRegistryService> = {
    register: mockRegister,
  };

  const config = new ConfigReader(mockConfig);
  const discovery = mockServices.discovery();
  const auth = mockServices.auth();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register five feedback actions', async () => {
    await registerFeedbackActions({
      actionsRegistry: mockActionsRegistry,
      discovery,
      auth,
      config,
    });

    expect(mockRegister).toHaveBeenCalledTimes(5);
    const registeredNames = mockRegister.mock.calls.map(call => call[0].name);
    expect(registeredNames).toContain('list-feedbacks');
    expect(registeredNames).toContain('get-feedback');
    expect(registeredNames).toContain('create-feedback');
    expect(registeredNames).toContain('update-feedback');
    expect(registeredNames).toContain('delete-feedback');
  });
});
