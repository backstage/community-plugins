import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestApiProvider, MockErrorApi, mockApis } from '@backstage/test-utils';
import { errorApiRef } from '@backstage/core-plugin-api';
import { translationApiRef } from '@backstage/core-plugin-api/alpha';
import { ArtifactRowData, ArtifactTable } from './ArtifactTable';
import { formatDate } from '../../utils/format-date/format-date';

// Get the text at row[columnName]
function getCellText(table: HTMLElement, row: number, columnName: string) {
  const header = table.querySelector(`thead tr`);
  if (!header) {
    throw new Error('No header found');
  }
  const columnIndex = Array.from(header.children).findIndex(
    el => el.textContent === columnName,
  );
  if (columnIndex === -1) {
    throw new Error(`Column ${columnName} not found`);
  }

  const rowElement = table.querySelector(`tbody tr:nth-child(${row + 1})`);
  if (!rowElement) {
    throw new Error(`Row ${row} not found`);
  }
  const cell = rowElement.children[columnIndex];
  return cell.textContent;
}

describe('ArtifactTable', () => {
  const sampleRows: ArtifactRowData[] = [
    {
      version: '1.0.0',
      artifact: 'test-artifact',
      assetVariants: new Set(['test-variant']),
      repositoryType: 'test-repo',
      hash: {
        algorithm: 'sha256',
        value: 'sha256-test-hash',
      },
      lastModified: '2023-09-26T22:35:00.000Z',
      sizeBytes: 140000,
    },
    {
      version: '1.0.1',
      artifact: 'test-artifact',
      assetVariants: new Set(),
      repositoryType: 'test-repo',
      hash: {
        algorithm: 'sha1',
        value: 'test-hash-sha1',
      },
      lastModified: '2023-09-29T22:35:00.000Z',
      sizeBytes: 130000,
    },
  ];

  it('renders rows', async () => {
    render(
      <TestApiProvider
        apis={[
          [errorApiRef, new MockErrorApi()],
          [translationApiRef, mockApis.translation()],
        ]}
      >
        <ArtifactTable title="Nexus Artifacts" artifacts={sampleRows} />
      </TestApiProvider>,
    );

    const table = screen.getAllByRole('table')[0];

    // Table defaults to sorting by Modified descending, so the more
    // recently modified sampleRows[1] renders first.
    expect(getCellText(table, 0, 'Version')).toBe('1.0.1');
    expect(getCellText(table, 0, 'Artifact')).toBe('test-artifact');
    // Not full hash, just first 12 chars
    expect(getCellText(table, 0, 'Checksum')).toBe('sha1' + 'test-hash-sh');
    expect(getCellText(table, 0, 'Repository Type')).toBe('test-repo');
    expect(getCellText(table, 0, 'Size')).toBe('130 kB');
    expect(getCellText(table, 0, 'Modified')).toBe(
      formatDate(sampleRows[1].lastModified),
    );

    // Check second row rendered
    expect(getCellText(table, 1, 'Version')).toBe('1.0.0');
  });

  it('renders empty state', async () => {
    const { queryByTestId } = render(
      <TestApiProvider
        apis={[
          [errorApiRef, new MockErrorApi()],
          [translationApiRef, mockApis.translation()],
        ]}
      >
        <ArtifactTable title="Nexus Artifacts" artifacts={[]} />
      </TestApiProvider>,
    );

    expect(
      queryByTestId('nexus-repository-manager-empty-table'),
    ).not.toBeNull();
    expect(screen.getByText(/No data was added yet/)).toBeInTheDocument();
  });

  it('renders variants in the right order', async () => {
    const rowData = [
      {
        ...sampleRows[0],
        assetVariants: new Set(['jar', '+sources', '+javadoc']),
      },
    ];

    await render(
      <TestApiProvider
        apis={[
          [errorApiRef, new MockErrorApi()],
          [translationApiRef, mockApis.translation()],
        ]}
      >
        <ArtifactTable title="Nexus Artifacts" artifacts={rowData} />
      </TestApiProvider>,
    );

    const table = screen.getAllByRole('table')[0];
    expect(getCellText(table, 0, 'Artifact')).toContain(
      'jar' + '+sources' + '+javadoc',
    );
  });

  it('renders N/A for undefined hashes', async () => {
    const noHash = {
      ...sampleRows[0],
      hash: undefined,
    };

    render(
      <TestApiProvider
        apis={[
          [errorApiRef, new MockErrorApi()],
          [translationApiRef, mockApis.translation()],
        ]}
      >
        <ArtifactTable title="Nexus Artifacts" artifacts={[noHash]} />
      </TestApiProvider>,
    );

    const table = screen.getAllByRole('table')[0];
    expect(getCellText(table, 0, 'Checksum')).toBe('N/A');
  });

  it('sorts by size correctly', async () => {
    const rowData = [
      {
        ...sampleRows[0],
        version: 'smaller',
        sizeBytes: 100,
      },
      {
        ...sampleRows[0],
        version: 'larger',
        sizeBytes: 200,
      },
    ];
    render(
      <TestApiProvider
        apis={[
          [errorApiRef, new MockErrorApi()],
          [translationApiRef, mockApis.translation()],
        ]}
      >
        <ArtifactTable title="Nexus Artifacts" artifacts={rowData} />
      </TestApiProvider>,
    );

    const user = userEvent.setup();
    const table = screen.getAllByRole('table')[0];
    const header = screen.getByText('Size');

    await user.click(header);
    expect(getCellText(table, 0, 'Version')).toBe('smaller');

    await user.click(header);
    expect(getCellText(table, 0, 'Version')).toBe('larger');
  });

  it('defaults to sorting by modified descending', async () => {
    const rowData = [
      {
        ...sampleRows[0],
        version: 'older',
        lastModified: '2023-01-01T00:00:00.000Z',
      },
      {
        ...sampleRows[0],
        version: 'newer',
        lastModified: '2023-12-01T00:00:00.000Z',
      },
    ];
    render(
      <TestApiProvider
        apis={[
          [errorApiRef, new MockErrorApi()],
          [translationApiRef, mockApis.translation()],
        ]}
      >
        <ArtifactTable title="Nexus Artifacts" artifacts={rowData} />
      </TestApiProvider>,
    );

    const table = screen.getAllByRole('table')[0];
    expect(getCellText(table, 0, 'Version')).toBe('newer');
  });

  it('sorts by modified chronologically, not alphabetically on the formatted date', async () => {
    const rowData = [
      {
        ...sampleRows[0],
        version: 'january',
        lastModified: '2023-01-15T00:00:00.000Z',
      },
      {
        ...sampleRows[0],
        version: 'june',
        lastModified: '2023-06-15T00:00:00.000Z',
      },
    ];
    render(
      <TestApiProvider
        apis={[
          [errorApiRef, new MockErrorApi()],
          [translationApiRef, mockApis.translation()],
        ]}
      >
        <ArtifactTable title="Nexus Artifacts" artifacts={rowData} />
      </TestApiProvider>,
    );

    const user = userEvent.setup();
    const table = screen.getAllByRole('table')[0];
    const header = screen.getByText('Modified');

    // Column defaults to descending, so the first click switches to ascending.
    await user.click(header);
    expect(getCellText(table, 0, 'Version')).toBe('january');

    await user.click(header);
    expect(getCellText(table, 0, 'Version')).toBe('june');
  });

  it('sorts rows with a missing modified date to the front, ahead of dated rows', async () => {
    const rowData = [
      {
        ...sampleRows[0],
        version: 'nodate1',
        lastModified: undefined,
      },
      {
        ...sampleRows[0],
        version: 'dated',
        lastModified: '2023-01-15T00:00:00.000Z',
      },
      {
        ...sampleRows[0],
        version: 'nodate2',
        lastModified: undefined,
      },
    ];
    render(
      <TestApiProvider
        apis={[
          [errorApiRef, new MockErrorApi()],
          [translationApiRef, mockApis.translation()],
        ]}
      >
        <ArtifactTable title="Nexus Artifacts" artifacts={rowData} />
      </TestApiProvider>,
    );

    const user = userEvent.setup();
    const table = screen.getAllByRole('table')[0];
    const header = screen.getByText('Modified');

    // Column defaults to descending, so the first click switches to ascending.
    await user.click(header);
    expect(getCellText(table, 0, 'Version')).toBe('nodate1');
    expect(getCellText(table, 1, 'Version')).toBe('nodate2');
    expect(getCellText(table, 2, 'Version')).toBe('dated');
  });

  it('filters by modified date using the displayed text', async () => {
    const rowData = [
      {
        ...sampleRows[0],
        version: 'january',
        lastModified: '2023-01-15T00:00:00.000Z',
      },
      {
        ...sampleRows[0],
        version: 'june',
        lastModified: '2023-06-15T00:00:00.000Z',
      },
    ];
    render(
      <TestApiProvider
        apis={[
          [errorApiRef, new MockErrorApi()],
          [translationApiRef, mockApis.translation()],
        ]}
      >
        <ArtifactTable title="Nexus Artifacts" artifacts={rowData} />
      </TestApiProvider>,
    );

    const user = userEvent.setup();
    const table = screen.getAllByRole('table')[0];

    const filterInput = screen.getByPlaceholderText('Filter');
    await user.type(filterInput, 'Jan');
    await waitFor(() => {
      expect(getCellText(table, 0, 'Version')).toBe('january');
      const rows = table.querySelectorAll('tbody tr');
      expect(rows[1].textContent).toBe('');
    });
  });

  it('sorts by checksum correctly', async () => {
    const rowData = [
      {
        ...sampleRows[0],
        version: 'smaller',
        hash: {
          algorithm: 'sha256' as const,
          value: 'a',
        },
      },
      {
        ...sampleRows[0],
        version: 'larger',
        hash: {
          algorithm: 'sha1' as const,
          value: 'b',
        },
      },
      {
        ...sampleRows[0],
        version: 'larger2',
        hash: {
          algorithm: 'sha1' as const,
          value: 'b',
        },
      },
      {
        ...sampleRows[0],
        version: 'unset',
        hash: undefined,
      },
    ];
    render(
      <TestApiProvider
        apis={[
          [errorApiRef, new MockErrorApi()],
          [translationApiRef, mockApis.translation()],
        ]}
      >
        <ArtifactTable title="Nexus Artifacts" artifacts={rowData} />
      </TestApiProvider>,
    );

    const user = userEvent.setup();
    const table = screen.getAllByRole('table')[0];
    const header = screen.getByText('Checksum');

    await user.click(header);
    expect(getCellText(table, 0, 'Version')).toBe('unset');
    expect(getCellText(table, 1, 'Version')).toBe('smaller');
    expect(getCellText(table, 2, 'Version')).toContain('larger');
    expect(getCellText(table, 3, 'Version')).toContain('larger');

    await user.click(header);
    expect(getCellText(table, 0, 'Version')).toContain('larger');
    expect(getCellText(table, 1, 'Version')).toContain('larger');
    expect(getCellText(table, 2, 'Version')).toBe('smaller');
    expect(getCellText(table, 3, 'Version')).toBe('unset');
  });

  it('filters by checksum', async () => {
    const rowData = [
      {
        ...sampleRows[0],
        hash: {
          algorithm: 'sha1' as const,
          value: 'first-hash',
        },
      },
      {
        ...sampleRows[0],
        hash: {
          algorithm: 'sha1' as const,
          value: 'second-hash',
        },
      },
      {
        ...sampleRows[0],
        hash: {
          algorithm: 'sha1' as const,
          value: 'something-else',
        },
      },
      {
        ...sampleRows[0],
        hash: undefined,
      },
    ];
    render(
      <TestApiProvider
        apis={[
          [errorApiRef, new MockErrorApi()],
          [translationApiRef, mockApis.translation()],
        ]}
      >
        <ArtifactTable title="Nexus Artifacts" artifacts={rowData} />
      </TestApiProvider>,
    );

    const user = userEvent.setup();
    const table = screen.getAllByRole('table')[0];

    const filterInput = screen.getByPlaceholderText('Filter');
    await user.type(filterInput, '-hash');
    await waitFor(() => {
      expect(getCellText(table, 0, 'Checksum')).toContain('-hash');
      expect(getCellText(table, 1, 'Checksum')).toContain('-hash');
      // This is how we check for empty rows
      const rows = table.querySelectorAll('tbody tr');
      expect(rows[2].textContent).toBe('');
    });

    await user.clear(filterInput);
    await user.type(filterInput, 'something');
    await waitFor(() => {
      expect(getCellText(table, 0, 'Checksum')).toContain('something-');
      const rows = table.querySelectorAll('tbody tr');
      expect(rows[1].textContent).toBe('');
    });

    await user.clear(filterInput);
    await user.type(filterInput, 'nothing-that-exists');
    await waitFor(() => {
      const rows = table.querySelectorAll('tbody tr');
      expect(rows[0].textContent).toBe('No records to display');
    });
  });
});
