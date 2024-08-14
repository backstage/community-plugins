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

import React from 'react';
import {
  Header,
  Page,
  Content,
  TabbedCard,
  CardTab,
} from '@backstage/core-components';
import { Metrics } from '../Metrics';
import { LanguageCards, EnterpriseCards } from '../Cards';
import { LanguageCharts, EnterpriseCharts } from '../Charts';
import { createStateContext, useObservable } from 'react-use';
import { DateTime } from 'luxon';
import { themes } from '@backstage/theme';
import { appThemeApiRef, useApi } from '@backstage/core-plugin-api';
import { ThemeProvider } from '@emotion/react';
import { styled } from '@mui/material/styles';

// Contexto para o intervalo de datas compartilhadas
export const [useSharedDateRange, SharedDateRangeProvider] = createStateContext(
  {
    startDate: DateTime.now().minus({ days: 28 }).toJSDate(),
    endDate: DateTime.now().minus({ days: 1 }).toJSDate(),
  },
);

// Estilização do conteúdo da página
const StyledContent = styled(Content)(({ theme }) => ({
  margin: theme.spacing(0),
  padding: theme.spacing(0),
  '& > div': {
    backgroundColor: theme.palette.background.default,
  },
}));

export const CopilotPage = () => {
  const appThemeApi = useApi(appThemeApiRef);
  const activeThemeId = useObservable(
    appThemeApi.activeThemeId$(),
    appThemeApi.getActiveThemeId(),
  );
  const prefersDarkMode = window.matchMedia(
    '(prefers-color-scheme: dark)',
  ).matches;
  const mode = activeThemeId ?? (prefersDarkMode ? 'dark' : 'light');
  const theme = (mode === 'dark' ? themes.dark : themes.light).getTheme('v5')!;

  return (
    <ThemeProvider theme={theme}>
      <Page themeId="tool">
        <Header
          title="Copilot Adoption"
          subtitle="Exploring the Impact and Integration of AI Assistance in Development Workflows"
        />
        <StyledContent>
          <SharedDateRangeProvider>
            <TabbedCard>
              <CardTab label="Enterprise">
                <Metrics Cards={EnterpriseCards} Charts={EnterpriseCharts} />
              </CardTab>
              <CardTab label="Languages">
                <Metrics Cards={LanguageCards} Charts={LanguageCharts} />
              </CardTab>
            </TabbedCard>
          </SharedDateRangeProvider>
        </StyledContent>
      </Page>
    </ThemeProvider>
  );
};
