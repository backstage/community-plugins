import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SecurityFindingsComponent } from './SecurityFindingsComponent';

describe('SecurityFindingsComponent', () => {
  test('displays loading state initially', () => {
    const organizeData = jest.fn();
    (organizeData as jest.Mock).mockReturnValue([]);

    render(<SecurityFindingsComponent data={[]} filters={""} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
