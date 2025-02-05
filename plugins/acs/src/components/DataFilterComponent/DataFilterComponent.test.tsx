import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DataFilterComponent } from './DataFilterComponent';

const mockData = [
    {
        result: {
            cluster: "test",
            component: "test",
            cvefixedin: "test",
            firstdiscovered: "test",
            image: "test",
            location: "test",
            namespace: "test",
            published: "test",
            severity: "test",
            source: "test",
            summary: "test",
            version: "test",
            workload: "test",
        }
    },
    {
        result: {
            cluster: "test",
            component: "test",
            cvefixedin: "test",
            firstdiscovered: "test",
            image: "test",
            location: "test",
            namespace: "test",
            published: "test",
            severity: "test",
            source: "test",
            summary: "test",
            version: "test",
            workload: "test",
        }
    }
];

describe('DataFilterComponent', () => {
  test('displays loading state initially', () => {
    const setFilters = jest.fn();
    (setFilters as jest.Mock).mockReturnValue({});
    render(<DataFilterComponent setFilters={setFilters} data={mockData} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /Image/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /Name/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /CVE severity/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /CVE status/i})).toBeInTheDocument();
  });
});
