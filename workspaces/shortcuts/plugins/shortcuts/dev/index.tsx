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
import { createDevApp } from '@backstage/frontend-dev-utils';
import {
  createFrontendPlugin,
  createRouteRef,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import { Content } from '@backstage/core-components';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ExtensionIcon from '@material-ui/icons/Extension';
import shortcutsPlugin from '../src/alpha';

// Pages to add as shortcuts. The shortcuts plugin adds itself to the sidebar.
const examplePage = (name: string, title: string, icon: JSX.Element) =>
  PageBlueprint.make({
    name,
    params: {
      path: `/${name}`,
      title,
      icon,
      routeRef: createRouteRef(),
      loader: async () => <Content>This is the {title} page.</Content>,
    },
  });

const examplesPlugin = createFrontendPlugin({
  pluginId: 'examples',
  extensions: [
    examplePage('dashboard', 'Dashboard', <DashboardIcon fontSize="inherit" />),
    examplePage('tools', 'Tools', <ExtensionIcon fontSize="inherit" />),
  ],
});

createDevApp({ features: [shortcutsPlugin, examplesPlugin] });
