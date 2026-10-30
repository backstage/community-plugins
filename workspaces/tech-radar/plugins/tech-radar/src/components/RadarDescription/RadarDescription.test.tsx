/*
 * Copyright 2020 The Backstage Authors
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

import { Props, RadarDescription } from './RadarDescription';
import {
  mockApis,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/test-utils';
import { translationApiRef } from '@backstage/core-plugin-api/alpha';
import { Ring } from '../../utils/types';

const ring: Ring = {
  id: 'example-ring',
  name: 'example-ring',
  color: 'red',
};

const minProps: Props = {
  open: true,
  title: 'example-title',
  description: 'example-description',
  timeline: [
    { date: new Date(), ring: ring, description: 'test timeline 1' },
    { date: new Date(), ring: ring, description: 'test timeline 2' },
  ],
  links: [{ url: 'https://example.com/docs', title: 'example-link' }],
  onClose: () => {},
};

describe('RadarDescription', () => {
  it('should render', async () => {
    await renderInTestApp(<RadarDescription {...minProps} />);

    const radarDescription = screen.getByTestId('radar-description');
    expect(radarDescription).toBeInTheDocument();
    expect(screen.getByText(String(minProps.description))).toBeInTheDocument();
    expect(screen.getByText(String('example-link'))).toBeInTheDocument();
  });

  it('should render the English texts by default', async () => {
    await renderInTestApp(
      <RadarDescription {...minProps} url="https://example.com/learn" />,
    );

    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Moved in direction')).toBeInTheDocument();
    expect(screen.getByText('Moved to ring')).toBeInTheDocument();
    expect(screen.getByText('Moved on date')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('LEARN MORE')).toBeInTheDocument();
  });

  it('should render translated texts', async () => {
    const french: Record<string, string> = {
      'radarTimeline.title': 'Historique',
      'radarTimeline.tableHeader.movedInDirection': 'Déplacé dans la direction',
      'radarDescription.learnMore': 'EN SAVOIR PLUS',
    };
    const base = mockApis.translation();
    const translationApi: typeof base = {
      translation$: ref => base.translation$(ref),
      getTranslation: ref => {
        const snapshot = base.getTranslation(ref);
        if (!snapshot.ready) {
          return snapshot;
        }
        return {
          ...snapshot,
          t: ((key: string, ...args: unknown[]) =>
            french[key] ??
            (snapshot.t as Function)(key, ...args)) as typeof snapshot.t,
        };
      },
    };

    await renderInTestApp(
      <TestApiProvider apis={[[translationApiRef, translationApi]]}>
        <RadarDescription {...minProps} url="https://example.com/learn" />
      </TestApiProvider>,
    );

    expect(screen.getByText('Historique')).toBeInTheDocument();
    expect(screen.getByText('Déplacé dans la direction')).toBeInTheDocument();
    expect(screen.getByText('EN SAVOIR PLUS')).toBeInTheDocument();
    expect(screen.queryByText('History')).not.toBeInTheDocument();
    expect(screen.queryByText('LEARN MORE')).not.toBeInTheDocument();
  });
});
