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
import { screen } from '@testing-library/react';
import {
  createExtensionTester,
  renderInTestApp,
} from '@backstage/frontend-test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { homePageWidgetDataRef } from '@backstage/plugin-home-react/alpha';
import { mdxEntityCard, mdxHomePageWidget } from './plugin';

describe('mdxEntityCard', () => {
  it('renders the template from extension config', async () => {
    const element = createExtensionTester(mdxEntityCard, {
      config: {
        title: 'Configured card',
        template: 'Name: {props.entity.metadata.name}',
      },
    }).reactElement();

    renderInTestApp(
      <EntityProvider
        entity={{
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: { name: 'my-service' },
        }}
      >
        {element}
      </EntityProvider>,
    );

    expect(await screen.findByText('Configured card')).toBeInTheDocument();
    expect(await screen.findByText('Name: my-service')).toBeInTheDocument();
  });
});

describe('mdxHomePageWidget', () => {
  it('renders the template from extension config', async () => {
    const widget = createExtensionTester(mdxHomePageWidget, {
      config: {
        title: 'Configured widget',
        template: 'Hello {props.user.displayName}',
      },
    }).get(homePageWidgetDataRef);

    expect(widget.title).toBe('Configured widget');

    renderInTestApp(widget.component);

    expect(await screen.findByText('Configured widget')).toBeInTheDocument();
    expect(await screen.findByText(/^Hello /)).toBeInTheDocument();
  });
});
