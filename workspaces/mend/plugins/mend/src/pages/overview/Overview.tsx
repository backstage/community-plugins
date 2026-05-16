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
import { Page, Content } from '@backstage/core-components';
import { useApi, fetchApiRef } from '@backstage/core-plugin-api';
import { mendApiRef } from '../../api';
import { Header } from '../../components';
import { ProjectTable } from './components';
import { useProjectData } from '../../queries';

export const Overview = () => {
  const connectBackendApi = useApi(mendApiRef);
  const { fetch } = useApi(fetchApiRef);
  const data = useProjectData({
    connectApi: connectBackendApi,
    fetchApi: fetch,
  });

  return (
    <Page themeId="tool">
      <Header />
      <Content>
        <ProjectTable {...data} />
      </Content>
    </Page>
  );
};
