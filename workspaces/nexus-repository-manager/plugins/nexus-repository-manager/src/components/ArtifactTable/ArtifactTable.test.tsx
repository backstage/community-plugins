import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ArtifactRowData, ArtifactTable } from './ArtifactTable';

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
      lastModified: 'Sep 26, 2023, 10:35 PM',
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
      lastModified: 'Sep 29, 2023, 10:35 PM',
      sizeBytes: 130000,
    },
  ];

  it('renders rows', async () => {
    await render(
      <ArtifactTable title="Nexus Artifacts" artifacts={sampleRows} />,
    );

    const table = screen.getAllByRole('table')[0];

    expect(getCellText(table, 0, 'Version')).toBe('1.0.0');
    expect(getCellText(table, 0, 'Artifact')).toBe(
      'test-artifact' + 'test-variant',
    );
    // Not full hash, just first 12 chars
    expect(getCellText(table, 0, 'Checksum')).toBe('sha256' + 'sha256-test-');
    expect(getCellText(table, 0, 'Repository Type')).toBe('test-repo');
    expect(getCellText(table, 0, 'Size')).toBe('140 kB');
    expect(getCellText(table, 0, 'Modified')).toBe('Sep 26, 2023, 10:35 PM');

    // Check second row rendered
    expect(getCellText(table, 1, 'Version')).toBe('1.0.1');
  });

  it('renders empty state', async () => {
    const { queryByTestId } = await render(
      <ArtifactTable title="Nexus Artifacts" artifacts={[]} />,
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

    await render(<ArtifactTable title="Nexus Artifacts" artifacts={rowData} />);

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

    await render(
      <ArtifactTable title="Nexus Artifacts" artifacts={[noHash]} />,
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
    await render(<ArtifactTable title="Nexus Artifacts" artifacts={rowData} />);

    const user = userEvent.setup();
    const table = screen.getAllByRole('table')[0];
    const header = screen.getByText('Size');

    await user.click(header);
    expect(getCellText(table, 0, 'Version')).toBe('smaller');

    await user.click(header);
    expect(getCellText(table, 0, 'Version')).toBe('larger');
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
    await render(<ArtifactTable title="Nexus Artifacts" artifacts={rowData} />);

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
    await render(<ArtifactTable title="Nexus Artifacts" artifacts={rowData} />);

    const user = userEvent.setup();
    const table = screen.getAllByRole('table')[0];

    const filterInput = screen.getByPlaceholderText('Search');
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
