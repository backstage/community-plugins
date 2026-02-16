/*
 * Copyright 2022 The Backstage Authors
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
// DynatraceTab.test.tsx
import { screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderInTestApp } from '@backstage/test-utils';
import { DynatraceTab } from './DynatraceTab';

// ---- Mocks ----

// Mock the catalog-react hook to control the entity
jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: jest.fn(),
  // Render a simple marker for the empty state to assert presence
  MissingAnnotationEmptyState: ({ annotation }: { annotation: string }) => (
    <div data-testid="missing-annotation">Missing: {annotation}</div>
  ),
}));

// Mock ProblemsList and SyntheticsCard with simple components showing their props
jest.mock('../Problems/ProblemsList', () => ({
  ProblemsList: ({ dynatraceEntityId }: { dynatraceEntityId: string }) => (
    <div data-testid="problems-list">Problems for: {dynatraceEntityId}</div>
  ),
}));

jest.mock('../Synthetics/SyntheticsCard', () => ({
  SyntheticsCard: ({ syntheticsId }: { syntheticsId: string }) => (
    <div data-testid="synthetics-card">Synthetics: {syntheticsId}</div>
  ),
}));

// Mock plugin availability
jest.mock('../../plugin', () => ({
  isDynatraceAvailable: jest.fn(),
}));

// Mock constants to ensure exact annotation keys used in the component
jest.mock('../../constants', () => ({
  DYNATRACE_ID_ANNOTATION: 'dynatrace.com/entity-id',
  DYNATRACE_SYNTHETICS_ANNOTATION: 'dynatrace.com/synthetics-ids',
}));

// ---- Helpers ----
const { useEntity } = jest.requireMock('@backstage/plugin-catalog-react');
const { isDynatraceAvailable } = jest.requireMock('../../plugin');

const makeEntity = (annotations?: Record<string, string>) => ({
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'demo',
    annotations: annotations ?? {},
  },
});

// ---- Tests ----
describe('DynatraceTab', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders MissingAnnotationEmptyState when dynatrace is not available', async () => {
    (useEntity as jest.Mock).mockReturnValue({ entity: makeEntity() });
    (isDynatraceAvailable as jest.Mock).mockReturnValue(false);

    await renderInTestApp(<DynatraceTab />);

    const emptyState = screen.getByTestId('missing-annotation');
    expect(emptyState).toBeInTheDocument();
    expect(emptyState).toHaveTextContent('Missing: dynatrace.com/entity-id');

    // Ensure ProblemsList and SyntheticsCard are not rendered
    expect(screen.queryByTestId('problems-list')).not.toBeInTheDocument();
    expect(screen.queryByTestId('synthetics-card')).not.toBeInTheDocument();
  });

  it('renders ProblemsList when dynatrace is available and entity id is present', async () => {
    const annotations = {
      'dynatrace.com/entity-id': 'env:project:service-abc',
    };
    (useEntity as jest.Mock).mockReturnValue({
      entity: makeEntity(annotations),
    });
    (isDynatraceAvailable as jest.Mock).mockReturnValue(true);

    await renderInTestApp(<DynatraceTab />);

    const problemsList = screen.getByTestId('problems-list');
    expect(problemsList).toBeInTheDocument();
    expect(problemsList).toHaveTextContent(
      'Problems for: env:project:service-abc',
    );
  });

  it('renders SyntheticsCard for each synthetics id (space/comma separated)', async () => {
    const annotations = {
      'dynatrace.com/entity-id': 'env:proj:svc-xyz',
      'dynatrace.com/synthetics-ids': 'syn-1, syn-2 syn-3,   syn-4',
    };
    (useEntity as jest.Mock).mockReturnValue({
      entity: makeEntity(annotations),
    });
    (isDynatraceAvailable as jest.Mock).mockReturnValue(true);

    await renderInTestApp(<DynatraceTab />);

    // ProblemsList present
    expect(screen.getByTestId('problems-list')).toBeInTheDocument();

    // Four synthetics cards, trimmed and filtered
    const cards = screen.getAllByTestId('synthetics-card');
    const texts = cards.map(c => c.textContent?.replace(/\s+/g, ' ').trim());

    expect(cards).toHaveLength(4);
    expect(texts).toEqual([
      'Synthetics: syn-1',
      'Synthetics: syn-2',
      'Synthetics: syn-3',
      'Synthetics: syn-4',
    ]);
  });

  it('does not render SyntheticsCard when synthetics annotation is empty or whitespace', async () => {
    const annotations = {
      'dynatrace.com/entity-id': 'env:proj:svc-no-synth',
      'dynatrace.com/synthetics-ids': ' ,   ,  ',
    };
    (useEntity as jest.Mock).mockReturnValue({
      entity: makeEntity(annotations),
    });
    (isDynatraceAvailable as jest.Mock).mockReturnValue(true);

    await renderInTestApp(<DynatraceTab />);

    // ProblemsList present
    expect(screen.getByTestId('problems-list')).toBeInTheDocument();

    // No synthetics cards
    expect(screen.queryByTestId('synthetics-card')).not.toBeInTheDocument();
  });

  it('renders only ProblemsList when dynatraceEntityId exists but synthetics annotation is missing', async () => {
    const annotations = {
      'dynatrace.com/entity-id': 'env:proj:svc-only-problems',
      // synthetics missing
    };
    (useEntity as jest.Mock).mockReturnValue({
      entity: makeEntity(annotations),
    });
    (isDynatraceAvailable as jest.Mock).mockReturnValue(true);

    await renderInTestApp(<DynatraceTab />);

    expect(screen.getByTestId('problems-list')).toBeInTheDocument();
    expect(screen.queryByTestId('synthetics-card')).not.toBeInTheDocument();
  });

  it('does not render ProblemsList when dynatraceEntityId is missing, but still renders synthetics if present', async () => {
    const annotations = {
      'dynatrace.com/synthetics-ids': 'syn-A syn-B',
    };
    (useEntity as jest.Mock).mockReturnValue({
      entity: makeEntity(annotations),
    });
    (isDynatraceAvailable as jest.Mock).mockReturnValue(true);

    await renderInTestApp(<DynatraceTab />);

    // ProblemsList should not be present
    expect(screen.queryByTestId('problems-list')).not.toBeInTheDocument();

    // Synthetics cards should render
    const cards = screen.getAllByTestId('synthetics-card');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent('Synthetics: syn-A');
    expect(cards[1]).toHaveTextContent('Synthetics: syn-B');
  });
});
