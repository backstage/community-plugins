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
import { renderInTestApp } from '@backstage/test-utils';
import {
  MaturitySummary,
  Rank,
} from '@backstage-community/plugin-tech-insights-maturity-common';
import { MaturityRankInfoCard } from './MaturityRankInfoCard';

describe('<MaturityRankInfoCard />', () => {
  afterEach(() => jest.resetAllMocks());
  it('shows maturity rank infocard with rank and area', async () => {
    const summary: MaturitySummary = {
      rank: Rank.Bronze,
      maxRank: Rank.Silver,
      isMaxRank: true,
      points: 100,
      progress: {
        percentage: 100,
        totalChecks: 1,
        passedChecks: 1,
      },
      rankProgress: {
        percentage: 100,
        totalChecks: 1,
        passedChecks: 1,
      },
      areaSummaries: [
        {
          area: 'Ownership',
          progress: {
            percentage: 100,
            totalChecks: 1,
            passedChecks: 1,
          },
          rankProgress: {
            percentage: 0,
            totalChecks: 0,
            passedChecks: 0,
          },
          rank: Rank.Bronze,
          maxRank: Rank.Bronze,
          isMaxRank: true,
        },
      ],
    };

    const { getByText, getByAltText, getAllByAltText } = await renderInTestApp(
      <MaturityRankInfoCard summary={summary} />,
    );

    expect(getByText('Maturity Rank')).toBeInTheDocument(); // Title
    expect(getByText('Bronze')).toBeInTheDocument(); // current rank label

    expect(getByAltText('Stone')).toBeInTheDocument(); // rank progress avatars
    expect(getAllByAltText('Bronze')).toHaveLength(3); // rank progress avatars, Current Bronze Rank, Ownership area rank avatar
    expect(getByAltText('Silver')).toBeInTheDocument(); // rank progress
    expect(getByAltText('Gold')).toBeInTheDocument(); // rank progress avatars
    expect(
      getByText(
        'Has full Ownership, but Maintainability, Security, and Reliability are not ensured',
      ),
    ).toBeInTheDocument();
    expect(getByText('Ownership')).toBeInTheDocument(); // Area progress
  });
});
