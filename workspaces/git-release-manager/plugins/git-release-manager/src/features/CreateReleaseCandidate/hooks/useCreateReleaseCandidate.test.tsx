/*
 * Copyright 2021 The Backstage Authors
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
import { renderHook, act } from '@testing-library/react';

import {
  mockCalverProject,
  mockDefaultBranch,
  mockNextGitInfoCalver,
  mockReleaseVersionCalver,
  mockUser,
} from '../../../test-helpers/test-helpers';
import { useCreateReleaseCandidate } from './useCreateReleaseCandidate';
import { mockApiClient } from '../../../test-helpers/mock-api-client';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: () => mockApiClient,
}));
jest.mock('../../../contexts/UserContext', () => ({
  useUserContext: () => ({ user: mockUser }),
}));

describe('useCreateReleaseCandidate', () => {
  beforeEach(jest.clearAllMocks);

  it('should return the expected responseSteps and progress', async () => {
    const { result } = renderHook(() =>
      useCreateReleaseCandidate({
        defaultBranch: mockDefaultBranch,
        latestRelease: mockReleaseVersionCalver,
        releaseCandidateGitInfo: mockNextGitInfoCalver,
        project: mockCalverProject,
      }),
    );

    await act(async () => {
      await result.current.run();
    });

    expect(result.current.responseSteps).toHaveLength(6);
  });

  it('should return the expected responseSteps and progress (with onSuccess)', async () => {
    const { result } = renderHook(() =>
      useCreateReleaseCandidate({
        defaultBranch: mockDefaultBranch,
        latestRelease: mockReleaseVersionCalver,
        releaseCandidateGitInfo: mockNextGitInfoCalver,
        project: mockCalverProject,
        onSuccess: jest.fn(),
      }),
    );

    await act(async () => {
      await result.current.run();
    });

    expect(result.current.responseSteps).toHaveLength(7);
    expect(result.current).toMatchInlineSnapshot(`
      {
        "progress": 100,
        "responseSteps": [
          {
            "link": "https://latestCommit.html_url",
            "message": "Fetched latest commit from "mock_defaultBranch"",
            "secondaryMessage": "with message "latestCommit.commit.message"",
          },
          {
            "message": "Created Release Branch",
            "secondaryMessage": "with ref "mock_createRef_ref"",
          },
          {
            "message": "Created Tag Object",
            "secondaryMessage": "with sha "mock_tag_object_sha"",
          },
          {
            "message": "Cut Tag Reference",
            "secondaryMessage": "with ref "mock_createRef_ref"",
          },
          {
            "link": "https://mock_compareCommits_html_url",
            "message": "Fetched commit comparison",
            "secondaryMessage": "rc/2020.01.01_1...rc/2020.01.01_1",
          },
          {
            "link": "https://mock_createRelease_html_url",
            "message": "Created Release Candidate "mock_createRelease_name"",
            "secondaryMessage": "with tag "rc-2020.01.01_1"",
          },
          {
            "icon": "success",
            "message": "Success callback successfully called 🚀",
          },
        ],
        "run": [Function],
        "runInvoked": true,
      }
    `);
  });
});
