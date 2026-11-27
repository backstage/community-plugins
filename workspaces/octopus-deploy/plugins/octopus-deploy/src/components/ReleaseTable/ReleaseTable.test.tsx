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
import { fireEvent, screen } from '@testing-library/react';
import { renderInTestApp } from '@backstage/test-utils';
import { ReleaseTable } from './ReleaseTable';
import { OctopusReleaseProgression } from '../../api';

const release = (
  id: string,
  version: string,
  states: Record<string, string>,
): OctopusReleaseProgression => ({
  Release: {
    Id: id,
    Version: version,
    Links: { Self: `/api/releases/${id}`, Web: `/releases/${id}` },
  },
  Deployments: Object.fromEntries(
    Object.entries(states).map(([env, State]) => [env, [{ State }]]),
  ),
});

describe('ReleaseTable', () => {
  it('renders releases with deployment states and filters by search', async () => {
    await renderInTestApp(
      <ReleaseTable
        loading={false}
        environments={[
          { Id: 'Environments-1', Name: 'Development' },
          { Id: 'Environments-2', Name: 'Production' },
        ]}
        releases={[
          release('Releases-1', '1.0.0', {
            'Environments-1': 'Success',
            'Environments-2': 'Failed',
          }),
          release('Releases-2', '1.1.0', { 'Environments-1': 'Executing' }),
        ]}
        project={{
          Id: 'Projects-1',
          Name: 'Backstage',
          Slug: 'backstage',
          Links: { Self: '/api/projects/Projects-1', Web: '/projects/1' },
        }}
        config={{ WebUiBaseUrl: 'https://octopus.example.com' }}
      />,
    );

    expect(
      await screen.findByRole('link', { name: /Backstage/ }),
    ).toHaveAttribute('href', 'https://octopus.example.com/projects/1');
    expect(screen.getByText(/\(2\)/)).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Development' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Production' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /1\.0\.0/ })).toHaveAttribute(
      'href',
      'https://octopus.example.com/releases/Releases-1',
    );
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('Executing')).toBeInTheDocument();

    fireEvent.change(
      screen.getByRole('searchbox', { name: 'Search releases' }),
      {
        target: { value: 'executing' },
      },
    );

    expect(
      await screen.findByRole('link', { name: /1\.1\.0/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /1\.0\.0/ }),
    ).not.toBeInTheDocument();
  });

  it('sorts releases by version', async () => {
    await renderInTestApp(
      <ReleaseTable
        loading={false}
        environments={[]}
        releases={[
          release('Releases-1', '1.9.0', {}),
          release('Releases-2', '1.10.0', {}),
          release('Releases-3', '1.2.0', {}),
        ]}
      />,
    );

    const versions = () =>
      screen.getAllByRole('rowheader').map(cell => cell.textContent);
    const header = await screen.findByRole('columnheader', {
      name: /Version/,
    });

    expect(versions()).toEqual(['1.9.0', '1.10.0', '1.2.0']);

    fireEvent.click(header);
    expect(versions()).toEqual(['1.2.0', '1.9.0', '1.10.0']);

    fireEvent.click(header);
    expect(versions()).toEqual(['1.10.0', '1.9.0', '1.2.0']);
  });

  it('renders loading and error states', async () => {
    const { rerender } = await renderInTestApp(
      <ReleaseTable
        loading
        environments={[{ Id: 'Environments-1', Name: 'Development' }]}
      />,
    );

    expect(await screen.findByText('Loading table data.')).toBeInTheDocument();
    expect(screen.queryByText('No releases found.')).not.toBeInTheDocument();

    rerender(<ReleaseTable loading={false} error={new Error('Boom')} />);

    expect(await screen.findAllByText('Error: Boom')).not.toHaveLength(0);
  });
});
