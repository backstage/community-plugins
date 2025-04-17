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

import { JSX, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TabbedCard, CardTab } from '@backstage/core-components';
import { Metrics, Usage } from '../Metrics';
import { LanguageCards, DashboardCards, EngagementCards } from '../Cards';
import { LanguageCharts, DashboardCharts, EngagementCharts } from '../Charts';
import { SelectTeamFilter } from '../Filters';
import { CopilotPage } from './CopilotPage';
import { configApiRef, useApi } from '@backstage/core-plugin-api';

export const EnterprisePage = (): JSX.Element => {
  const navigate = useNavigate();
  const configApi = useApi(configApiRef);

  useEffect(() => {
    const enterpriseKey = configApi.getOptionalString('copilot.enterprise');
    if (!enterpriseKey) {
      navigate('/copilot');
    }
  }, [navigate, configApi]);

  return (
    <CopilotPage
      title="Enterprise Metrics Overview"
      subtitle="Track AI Adoption and Performance Metrics Across Your Enterprise"
      themeId="tool"
    >
      <TabbedCard>
        <CardTab label="Enterprise">
          <Metrics
            Filters={SelectTeamFilter}
            Cards={DashboardCards}
            Charts={DashboardCharts}
          />
        </CardTab>
        <CardTab label="Languages">
          <Metrics
            Filters={SelectTeamFilter}
            Cards={LanguageCards}
            Charts={LanguageCharts}
          />
        </CardTab>
        <CardTab label="Engagement">
          <Usage
            Filters={SelectTeamFilter}
            Cards={EngagementCards}
            Charts={EngagementCharts}
          />
        </CardTab>
      </TabbedCard>
    </CopilotPage>
  );
};
