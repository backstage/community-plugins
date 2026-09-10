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

import { mockApis } from '@backstage/test-utils';
import { resolveMaturityDisplayConfig } from './maturityConfig';

describe('resolveMaturityDisplayConfig', () => {
  it('returns backwards-compatible defaults', () => {
    expect(resolveMaturityDisplayConfig(mockApis.config.mock())).toEqual({
      title: 'Maturity',
      helpUrl:
        'https://github.com/backstage/community-plugins/blob/main/workspaces/tech-insights/plugins/tech-insights-maturity/README.md',
      helpTooltip: 'Click here to learn more about Maturity!',
    });
  });

  it('uses configured display values and allows a component title override', () => {
    const configApi = mockApis.config({
      data: {
        techInsights: {
          maturity: {
            title: 'Scorecards',
            help: {
              url: 'https://example.com/scorecards',
              tooltip: 'Read the scorecard guide',
            },
          },
        },
      },
    });

    expect(resolveMaturityDisplayConfig(configApi)).toEqual({
      title: 'Scorecards',
      helpUrl: 'https://example.com/scorecards',
      helpTooltip: 'Read the scorecard guide',
    });
    expect(
      resolveMaturityDisplayConfig(configApi, { title: 'Readiness' }).title,
    ).toBe('Readiness');
  });

  it('uses a custom title in the default tooltip', () => {
    const configApi = mockApis.config({
      data: { techInsights: { maturity: { title: 'Scorecards' } } },
    });

    expect(resolveMaturityDisplayConfig(configApi).helpTooltip).toBe(
      'Click here to learn more about Scorecards!',
    );
  });
});
