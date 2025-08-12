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
import { PropsWithChildren, ReactElement } from 'react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { Entity, RELATION_HAS_PART } from '@backstage/catalog-model';
import { catalogApiRef, EntityProvider } from '@backstage/plugin-catalog-react';
import {
  sonarQubeApiRef,
  SONARQUBE_PROJECT_KEY_ANNOTATION,
} from '@backstage-community/plugin-sonarqube-react';
import { SonarQubeRelatedEntitiesOverview } from './SonarQubeRelatedEntitiesOverview.tsx';

const sonarQubeApi = {
  getFindingSummaries: jest.fn(),
};

const catalogApi = {
  getEntitiesByRefs: jest.fn(),
};

const Providers = ({ children }: PropsWithChildren<any>): ReactElement => (
  <TestApiProvider
    apis={[
      [catalogApiRef, catalogApi],
      [sonarQubeApiRef, sonarQubeApi],
    ]}
  >
    <EntityProvider
      entity={{
        metadata: {
          name: 'parent',
          namespace: 'default',
        },
        relations: [
          {
            type: RELATION_HAS_PART,
            targetRef: 'component:default/mock',
          },
        ],
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'system',
      }}
    >
      {children}
    </EntityProvider>
  </TestApiProvider>
);

jest.mock('@backstage/plugin-catalog-react', () => ({
  ...jest.requireActual('@backstage/plugin-catalog-react'),
  EntityRefLink: jest.fn(() => <div>Mocked EntityRefLink</div>),
}));

function createMockEntity(
  annotationName: string,
  value: string = 'foo.bar',
): Entity {
  return {
    metadata: {
      name: 'mock',
      namespace: 'default',
      annotations: {
        [annotationName]: value,
      },
    },
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'component',
  };
}

describe('<SonarQubeRelatedEntitiesOverview />', () => {
  afterEach(() => jest.resetAllMocks());

  it('renders empty SonarQubeTable', async () => {
    const rendered = await renderInTestApp(
      <Providers>
        <SonarQubeRelatedEntitiesOverview
          relationType={RELATION_HAS_PART}
          entityKind="system"
        />
      </Providers>,
    );
    expect(rendered.getByText('(0)', { exact: false })).toBeInTheDocument();
    expect(rendered.getByText('No records to display')).toBeInTheDocument();
    expect(rendered.queryAllByText('Gate passed')).toHaveLength(0);
  }, 15000);

  it('renders properly if sonar annotation is missing', async () => {
    const mockEntity: Entity = createMockEntity('some-other-annotation');
    catalogApi.getEntitiesByRefs.mockResolvedValue({ items: [mockEntity] });

    const rendered = await renderInTestApp(
      <Providers>
        <SonarQubeRelatedEntitiesOverview
          relationType={RELATION_HAS_PART}
          entityKind="component"
        />
      </Providers>,
    );
    expect(rendered.getByText('(1)', { exact: false })).toBeInTheDocument();
    expect(
      rendered.getByText('annotation', { exact: false }), // no DX-Hub annotation for SonarQube / No SonarQube annotation found
    ).toBeInTheDocument();
    expect(rendered.queryAllByText('Gate passed')).toHaveLength(0);
  }, 15000);

  it('renders properly if no metrics are returned by sonar', async () => {
    const mockEntity: Entity = createMockEntity(
      SONARQUBE_PROJECT_KEY_ANNOTATION,
    );
    catalogApi.getEntitiesByRefs.mockResolvedValue({ items: [mockEntity] });

    const rendered = await renderInTestApp(
      <Providers>
        <SonarQubeRelatedEntitiesOverview
          relationType={RELATION_HAS_PART}
          entityKind="component"
        />
      </Providers>,
    );
    expect(rendered.getByText('(1)', { exact: false })).toBeInTheDocument();
    expect(
      rendered.getByText('SonarQube project', { exact: false }), // Unable to access SonarQube project / There is no SonarQube project
    ).toBeInTheDocument();
    expect(rendered.queryAllByText('Gate passed')).toHaveLength(0);
  }, 15000);

  it('renders properly if sonar returns metrics', async () => {
    const mockEntity: Entity = createMockEntity(
      SONARQUBE_PROJECT_KEY_ANNOTATION,
    );
    catalogApi.getEntitiesByRefs.mockResolvedValue({ items: [mockEntity] });
    const mockMetrics = {
      getComponentMeasuresUrl: () => '',
      getIssuesUrl: () => '',
      metrics: {
        alert_status: 'OK',
      },
    };
    const mockData = new Map<string, any>([['foo.bar', mockMetrics]]);
    sonarQubeApi.getFindingSummaries.mockResolvedValue(mockData);

    const rendered = await renderInTestApp(
      <Providers>
        <SonarQubeRelatedEntitiesOverview
          relationType={RELATION_HAS_PART}
          entityKind="component"
        />
      </Providers>,
    );
    expect(rendered.getByText('(1)', { exact: false })).toBeInTheDocument();
    expect(rendered.queryAllByText('Gate passed')).toHaveLength(1);
  }, 15000);

  it('renders properly if multiple instances are present', async () => {
    const mockEntities: Entity[] = [
      createMockEntity(SONARQUBE_PROJECT_KEY_ANNOTATION, 'component-key.1'),
      createMockEntity(
        SONARQUBE_PROJECT_KEY_ANNOTATION,
        'instance-key/component-key.2',
      ),
    ];
    catalogApi.getEntitiesByRefs.mockResolvedValue({
      items: mockEntities,
    });
    const mockMetrics = {
      getComponentMeasuresUrl: () => '',
      getIssuesUrl: () => '',
      metrics: {
        alert_status: 'OK',
      },
    };
    const mockData = new Map<string, any>([
      ['component-key.1', mockMetrics],
      ['component-key.2', mockMetrics],
    ]);
    sonarQubeApi.getFindingSummaries.mockResolvedValue(mockData);

    const rendered = await renderInTestApp(
      <Providers>
        <SonarQubeRelatedEntitiesOverview
          relationType={RELATION_HAS_PART}
          entityKind="component"
        />
      </Providers>,
    );
    expect(rendered.getByText('(2)', { exact: false })).toBeInTheDocument();
    expect(rendered.queryAllByText('Gate passed')).toHaveLength(2);
  }, 15000);
});
