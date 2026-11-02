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

/**
 * New Frontend System dev app for the JFrog Artifactory plugin.
 */

import '@backstage/cli/asset-types';
// eslint-disable-next-line @backstage/no-ui-css-imports-in-non-frontend
import '@backstage/ui/css/styles.css';

import { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Entity } from '@backstage/catalog-model';
import { InMemoryCatalogClient } from '@backstage/catalog-client/testUtils';
import { SignInPageProps } from '@backstage/core-plugin-api';
import { createApp } from '@backstage/frontend-defaults';
import {
  ApiBlueprint,
  appLanguageApiRef,
  createFrontendModule,
  pluginHeaderActionsApiRef,
} from '@backstage/frontend-plugin-api';
import { SignInPageBlueprint } from '@backstage/plugin-app-react';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { mockApis } from '@backstage/test-utils';

import { jfrogArtifactoryApiRef, JfrogArtifactoryApiV1 } from '../src/api';
import jfrogArtifactoryPlugin from '../src';
import jfrogArtifactoryTranslationsModule from '../src/translations';
import { mockTags } from '../src/__fixtures__/mockTags';
import { TagsResponse } from '../src/types';
import { createDevAppLanguageApi, devSidebarContent } from './shared';

const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage',
    description: 'backstage.io',
    annotations: {
      'jfrog-artifactory/image-name': 'backstage',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};

class MockJfrogArtifactoryApi implements JfrogArtifactoryApiV1 {
  async getTags(_repo: string): Promise<TagsResponse> {
    return Promise.resolve(mockTags as TagsResponse);
  }
}
const mockJfrogArtifactoryApi = new MockJfrogArtifactoryApi();

const jfrogArtifactoryDevModule = createFrontendModule({
  pluginId: 'jfrog-artifactory',
  extensions: [
    ApiBlueprint.make({
      name: 'jfrog-artifactory',
      params: defineParams =>
        defineParams({
          api: jfrogArtifactoryApiRef,
          deps: {},
          factory: () => mockJfrogArtifactoryApi,
        }),
    }),
  ],
});

const catalogPluginOverrides = catalogPlugin.withOverrides({
  extensions: [
    catalogPlugin.getExtension('api:catalog').override({
      params: defineParams =>
        defineParams({
          api: catalogApiRef,
          deps: {},
          factory: () => new InMemoryCatalogClient({ entities: [mockEntity] }),
        }),
    }),
  ],
});

function AutoSignIn({ onSignInSuccess }: SignInPageProps) {
  useEffect(() => {
    onSignInSuccess(mockApis.identity());
  }, [onSignInSuccess]);
  return null;
}

const signInPage = SignInPageBlueprint.make({
  params: {
    loader: async () => AutoSignIn,
  },
});

const appDevModule = createFrontendModule({
  pluginId: 'app',
  extensions: [
    signInPage,
    ApiBlueprint.make({
      name: 'app-language',
      params: defineParams =>
        defineParams({
          api: appLanguageApiRef,
          deps: {},
          factory: () => createDevAppLanguageApi(),
        }),
    }),
    ApiBlueprint.make({
      name: 'plugin-header-actions',
      params: defineParams =>
        defineParams({
          api: pluginHeaderActionsApiRef,
          deps: {},
          factory: () => ({
            getPluginHeaderActions: () => [],
          }),
        }),
    }),
  ],
});

const devNavModule = createFrontendModule({
  pluginId: 'app',
  extensions: [devSidebarContent],
});

const app = createApp({
  features: [
    catalogPluginOverrides,
    jfrogArtifactoryPlugin,
    jfrogArtifactoryDevModule,
    jfrogArtifactoryTranslationsModule,
    devNavModule,
    appDevModule,
  ],
});

if (window.location.pathname === '/') {
  window.location.replace('/catalog');
}

const root = app.createRoot();

ReactDOM.createRoot(document.getElementById('root')!).render(root);
