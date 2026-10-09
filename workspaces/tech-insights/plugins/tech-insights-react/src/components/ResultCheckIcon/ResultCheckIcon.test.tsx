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
import { PropsWithChildren } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { Entity } from '@backstage/catalog-model';
import { CheckResult } from '@backstage-community/plugin-tech-insights-common';
import { TechInsightsApi, techInsightsApiRef } from '../../api';
import { jsonRulesEngineCheckResultRenderer } from '../CheckResultRenderer';
import {
  ResultCheckIcon,
  ResultCheckIconBaseComponentProps,
} from './ResultCheckIcon';

const entity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: { name: 'my-service', namespace: 'default' },
};

const result: CheckResult = {
  facts: {},
  check: {
    id: 'has-readme',
    type: 'json-rules-engine',
    name: 'Has README',
    description: 'Repository has a README',
    factIds: [],
  },
  result: true,
};

const links = [
  { title: 'Docs', url: 'https://example.com/docs' },
  { title: 'Internal guide', url: '/docs/default/component/guide' },
];

const createApi = (entityLinks = links) =>
  ({
    getCheckResultRenderers: () => [jsonRulesEngineCheckResultRenderer],
    getLinksForEntity: jest.fn(() => entityLinks),
  } as unknown as TechInsightsApi);

const renderIcon = (
  api: TechInsightsApi,
  props: Partial<Parameters<typeof ResultCheckIcon>[0]> = {},
) =>
  renderInTestApp(
    <TestApiProvider apis={[[techInsightsApiRef, api]]}>
      <ResultCheckIcon result={result} entity={entity} {...props} />
    </TestApiProvider>,
  );

describe('ResultCheckIcon', () => {
  it('opens a keyboard-navigable menu with the check links and closes it on Escape', async () => {
    const api = createApi();
    await renderIcon(api);

    expect(screen.queryByText('Docs')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'icon' }));

    expect(await screen.findByRole('menu')).toBeVisible();
    const external = screen.getByRole('menuitem', { name: 'Docs' });
    expect(external).toHaveAttribute('href', 'https://example.com/docs');
    expect(external).toHaveAttribute('target', '_blank');
    const internal = screen.getByRole('menuitem', { name: 'Internal guide' });
    expect(internal).toHaveAttribute('href', '/docs/default/component/guide');
    expect(internal).not.toHaveAttribute('target');
    expect(api.getLinksForEntity).toHaveBeenCalledWith(result, entity, {
      includeStaticLinks: true,
    });

    // Opening focuses the first item; arrow keys move between items
    expect(external).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(internal).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('renders only the icon when there are no links or the menu is disabled', async () => {
    const { unmount } = await renderIcon(createApi([]));
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    unmount();

    await renderIcon(createApi(), { disableLinksMenu: true });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('opens the popup from a custom wrapping component and closes it on link click', async () => {
    const wrapperClick = jest.fn();
    const Wrapper = ({
      children,
      onClick,
    }: PropsWithChildren<ResultCheckIconBaseComponentProps>) => (
      // Stands in for an adopter's wrapper; the inner button stays focusable
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div
        onClick={e => {
          wrapperClick();
          onClick?.(e);
        }}
      >
        {children}
      </div>
    );
    await renderIcon(createApi(), { component: Wrapper });

    await userEvent.click(screen.getByRole('button', { name: 'icon' }));

    // The inner button must let the click bubble to the wrapper
    expect(wrapperClick).toHaveBeenCalledTimes(1);
    const link = await screen.findByRole('menuitem', { name: 'Docs' });
    expect(link).toBeVisible();

    await userEvent.click(link);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
