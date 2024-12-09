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

import React, { PropsWithChildren } from 'react';
import { Header, Page, Content } from '@backstage/core-components';
import { SharedDateRangeProvider, SharedTeamProvider } from '../../contexts';

type CopilotPageProps = {
  title: string;
  subtitle: string;
  themeId: string;
};

export function CopilotPage({
  children,
  themeId,
  title,
  subtitle,
}: PropsWithChildren<CopilotPageProps>): React.JSX.Element {
  return (
    <Page themeId={themeId}>
      <Header title={title} subtitle={subtitle} />
      <Content>
        <SharedDateRangeProvider>
          <SharedTeamProvider>{children}</SharedTeamProvider>
        </SharedDateRangeProvider>
      </Content>
    </Page>
  );
}
