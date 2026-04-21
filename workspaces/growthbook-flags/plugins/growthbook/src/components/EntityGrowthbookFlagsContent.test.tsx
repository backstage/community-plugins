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
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import {
  EntityGrowthbookFlagsContent,
  isGrowthbookAvailable,
} from './EntityGrowthbookFlagsContent';
import { growthbookFlagsApiRef, GrowthbookFlagsApi } from '../api';

const mockEntity = {
  apiVersion: 'backstage.io/v1alpha1' as const,
  kind: 'Component',
  metadata: {
    name: 'test-service',
    annotations: {
      'growthbook.io/enabled': 'true',
      'growthbook.io/env': 'prod',
    },
  },
  spec: { type: 'service', lifecycle: 'production', owner: 'team-a' },
};

const mockFlags = [
  { key: 'alpha-feature', type: 'boolean' as const, valuePreview: 'true' },
  { key: 'beta-feature', type: 'string' as const, valuePreview: '"v2"' },
  {
    key: 'complex-flag',
    type: 'json' as const,
    valuePreview: '{"key":"val"}',
    valuePretty: '{\n  "key": "val"\n}',
  },
];

describe('isGrowthbookAvailable', () => {
  it('returns true when annotation is "true"', () => {
    expect(
      isGrowthbookAvailable({
        metadata: {
          annotations: { 'growthbook.io/enabled': 'true' },
        },
      }),
    ).toBe(true);
  });

  it('returns false when annotation is missing', () => {
    expect(isGrowthbookAvailable({ metadata: {} })).toBe(false);
  });

  it('returns false when annotation is "false"', () => {
    expect(
      isGrowthbookAvailable({
        metadata: {
          annotations: { 'growthbook.io/enabled': 'false' },
        },
      }),
    ).toBe(false);
  });
});

describe('EntityGrowthbookFlagsContent', () => {
  const mockApi: jest.Mocked<GrowthbookFlagsApi> = {
    getFlags: jest.fn(),
    getProjects: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    mockApi.getProjects.mockResolvedValue(['Project A', 'Project B']);
  });

  const renderComponent = (entity = mockEntity) =>
    renderInTestApp(
      <TestApiProvider apis={[[growthbookFlagsApiRef, mockApi]]}>
        <EntityProvider entity={entity}>
          <EntityGrowthbookFlagsContent />
        </EntityProvider>
      </TestApiProvider>,
    );

  it('renders feature flags returned by the API', async () => {
    mockApi.getFlags.mockResolvedValue(mockFlags);

    const { findByText } = await renderComponent();

    expect(await findByText('alpha-feature')).toBeInTheDocument();
    expect(await findByText('beta-feature')).toBeInTheDocument();
  });

  it('renders flags in alphabetical order', async () => {
    mockApi.getFlags.mockResolvedValue([
      { key: 'z-flag', type: 'boolean' as const, valuePreview: 'true' },
      { key: 'a-flag', type: 'boolean' as const, valuePreview: 'false' },
      { key: 'm-flag', type: 'string' as const, valuePreview: '"x"' },
    ]);

    const { findAllByRole } = await renderComponent();

    const rows = await findAllByRole('row');
    const keys = rows
      .slice(1)
      .map(r => r.querySelector('td')?.textContent ?? '');
    expect(keys).toEqual(['a-flag', 'm-flag', 'z-flag']);
  });

  it('renders empty state when no flags are returned', async () => {
    mockApi.getFlags.mockResolvedValue([]);

    const { findByText } = await renderComponent();

    expect(await findByText(/No feature flags found/)).toBeInTheDocument();
  });

  it('renders project filter buttons', async () => {
    mockApi.getFlags.mockResolvedValue(mockFlags);

    const { findByText } = await renderComponent();

    expect(await findByText('All')).toBeInTheDocument();
    expect(await findByText('Project A')).toBeInTheDocument();
    expect(await findByText('Project B')).toBeInTheDocument();
  });

  it('renders error panel when API call fails', async () => {
    mockApi.getFlags.mockRejectedValue(new Error('Network error'));

    const { findAllByText } = await renderComponent();

    const matches = await findAllByText(/Network error/);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('uses env annotation from entity', async () => {
    mockApi.getFlags.mockResolvedValue([]);

    const entityWithCustomEnv = {
      ...mockEntity,
      metadata: {
        ...mockEntity.metadata,
        annotations: {
          'growthbook.io/enabled': 'true',
          'growthbook.io/env': 'staging',
        },
      },
    };

    await renderComponent(entityWithCustomEnv);

    expect(mockApi.getFlags).toHaveBeenCalledWith('staging', undefined);
  });

  it('displays flag count', async () => {
    mockApi.getFlags.mockResolvedValue(mockFlags);

    const { findByText } = await renderComponent();

    expect(await findByText('3 flags')).toBeInTheDocument();
  });
});
