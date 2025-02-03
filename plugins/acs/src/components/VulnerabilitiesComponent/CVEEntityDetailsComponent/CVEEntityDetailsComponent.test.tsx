import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CVEEntityDetailsComponent } from './CVEEntityDetailsComponent';

const mockData = {
    expanded_data: {
        cluster: "test",
        component: "test",
        cveFixedIn: "test",
        first_discovered: "test",
        image: "test",
        location: "test",
        namespace: "test",
        published: "test",
        severity: "test",
        source: "test",
        summary: "test",
        version: "test",
        workload: "test",
    },
    row_data: {
        cve: "test",
        cvss: "test",
        discovered: "test",
        image: "test",
        link: "test",
        severity: "test",
        status: "test",
        workload: "test",
    }
};

describe('CVEEntityDetailsComponent', () => {
  test('displays the CVEEntityDetailsComponent in the DOM', () => {
    const populateRows = jest.fn();
    (populateRows as jest.Mock).mockReturnValue([]);

    render(<CVEEntityDetailsComponent data={mockData} cveDetails={""} entityDetails={""} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
