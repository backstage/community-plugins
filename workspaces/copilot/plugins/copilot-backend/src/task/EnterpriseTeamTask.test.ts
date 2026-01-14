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
import { discoverEnterpriseTeamMetrics } from './EnterpriseTeamTask';
import { CopilotMetrics } from '@backstage-community/plugin-copilot-common';

describe('discoverEnterpriseTeamMetrics', () => {
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    child: jest.fn(),
  };

  const mockConfig = {
    getOptionalString: jest.fn(),
  };

  const mockDb = {
    getMostRecentDayFromMetricsV2: jest.fn(),
    batchInsertMetrics: jest.fn(),
    batchInsertIdeCompletions: jest.fn(),
    batchInsertIdeCompletionsLanguages: jest.fn(),
    batchInsertIdeCompletionsEditors: jest.fn(),
    batchInsertIdeCompletionsEditorModels: jest.fn(),
    batchInsertIdeCompletionsEditorModelLanguages: jest.fn(),
    batchInsertIdeChats: jest.fn(),
    batchInsertIdeChatEditors: jest.fn(),
    batchInsertIdeChatEditorModels: jest.fn(),
    insertSeatAnalysys: jest.fn(),
  };

  const mockApi = {
    fetchEnterpriseTeams: jest.fn(),
    fetchEnterpriseSeats: jest.fn(),
    fetchEnterpriseTeamCopilotMetrics: jest.fn(),
  };

  const mockOptions = {
    api: mockApi as any,
    logger: mockLogger as any,
    db: mockDb as any,
    config: mockConfig as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfig.getOptionalString.mockReturnValue('enterprise-name');
  });

  it('should skip when enterprise configuration is not found', async () => {
    mockConfig.getOptionalString.mockReturnValue(undefined);

    await discoverEnterpriseTeamMetrics(mockOptions);

    expect(mockLogger.info).toHaveBeenCalledWith(
      '[discoverEnterpriseTeamMetrics] Skipping: Enterprise configuration not found.',
    );
    expect(mockApi.fetchEnterpriseTeams).not.toHaveBeenCalled();
  });

  it('should log info message when team returns 404 error', async () => {
    const mockTeam = { slug: 'nonexistent-team' };
    mockApi.fetchEnterpriseTeams.mockResolvedValue([mockTeam]);
    mockApi.fetchEnterpriseSeats.mockResolvedValue([]);

    const httpError = new Error('Not Found');
    (httpError as any).name = 'HttpError';
    (httpError as any).status = 404;

    mockApi.fetchEnterpriseTeamCopilotMetrics.mockRejectedValue(httpError);

    await discoverEnterpriseTeamMetrics(mockOptions);

    expect(mockLogger.info).toHaveBeenCalledWith(
      `[discoverEnterpriseTeamMetrics] Team ${mockTeam.slug} does not exist.`,
    );
    expect(mockLogger.error).not.toHaveBeenCalledWith(
      expect.stringContaining('Failed to process metrics'),
      expect.anything(),
    );
  });

  it('should log error message for non-404 errors', async () => {
    const mockTeam = { slug: 'test-team' };
    mockApi.fetchEnterpriseTeams.mockResolvedValue([mockTeam]);
    mockApi.fetchEnterpriseSeats.mockResolvedValue([]);

    const genericError = new Error('Internal Server Error');
    mockApi.fetchEnterpriseTeamCopilotMetrics.mockRejectedValue(genericError);

    await discoverEnterpriseTeamMetrics(mockOptions);

    expect(mockLogger.error).toHaveBeenCalledWith(
      `[discoverEnterpriseTeamMetrics] Failed to process metrics for team ${mockTeam.slug}.`,
      genericError,
    );
    expect(mockLogger.info).not.toHaveBeenCalledWith(
      expect.stringContaining('does not exist'),
    );
  });

  it('should log error message for HttpError with non-404 status', async () => {
    const mockTeam = { slug: 'test-team' };
    mockApi.fetchEnterpriseTeams.mockResolvedValue([mockTeam]);
    mockApi.fetchEnterpriseSeats.mockResolvedValue([]);

    const httpError = new Error('Forbidden');
    (httpError as any).name = 'HttpError';
    (httpError as any).status = 403;

    mockApi.fetchEnterpriseTeamCopilotMetrics.mockRejectedValue(httpError);

    await discoverEnterpriseTeamMetrics(mockOptions);

    expect(mockLogger.error).toHaveBeenCalledWith(
      `[discoverEnterpriseTeamMetrics] Failed to process metrics for team ${mockTeam.slug}.`,
      httpError,
    );
    expect(mockLogger.info).not.toHaveBeenCalledWith(
      expect.stringContaining('does not exist'),
    );
  });

  it('should process team metrics successfully', async () => {
    const mockTeam = { slug: 'test-team' };
    const mockMetrics: CopilotMetrics[] = [];

    mockApi.fetchEnterpriseTeams.mockResolvedValue([mockTeam]);
    mockApi.fetchEnterpriseSeats.mockResolvedValue([]);
    mockApi.fetchEnterpriseTeamCopilotMetrics.mockResolvedValue(mockMetrics);
    mockDb.getMostRecentDayFromMetricsV2.mockResolvedValue(null);

    await discoverEnterpriseTeamMetrics(mockOptions);

    expect(mockLogger.info).toHaveBeenCalledWith(
      `[discoverEnterpriseTeamMetrics] Fetching metrics for team: ${mockTeam.slug}`,
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      `[discoverEnterpriseTeamMetrics] Found 0 new metrics to insert for team: ${mockTeam.slug}`,
    );
    expect(mockLogger.error).not.toHaveBeenCalled();
  });
});
