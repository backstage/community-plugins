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
import { Content, Link, Page, WarningPanel } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { useLocation } from 'react-router-dom';
import { rootRouteRef } from '../../routes';

export const KialiNoPath = () => {
  const location = useLocation().pathname;
  const link = useRouteRef(rootRouteRef);
  return (
    <Page themeId="tool">
      <Content>
        <WarningPanel
          severity="error"
          title={`Could not find path ${location}`}
        >
          Path {location} not exist in Kiali Plugin.{' '}
          <Link to={link()}>Go to Kiali Plugin</Link>
        </WarningPanel>
      </Content>
    </Page>
  );
};
