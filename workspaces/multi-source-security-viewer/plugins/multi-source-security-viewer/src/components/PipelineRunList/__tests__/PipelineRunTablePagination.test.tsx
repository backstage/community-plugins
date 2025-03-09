/*
 * Copyright 2024 The Backstage Authors
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
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { PipelineRunTablePagination } from '../PipelineRunTablePagination';

describe('PipelineRunTablePagination', () => {
  it('should display a total of pages', () => {
    const { rerender } = render(
      <PipelineRunTablePagination
        page={0}
        count={10}
        rowSize={[5, 10, 20]}
        rowsPerPage={5}
        handleChangePage={() => {}}
        handleChangeRowsPerPage={() => {}}
      />,
    );
    expect(
      screen.getByRole('button', { name: /1 \- 5 of 10/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('1');
    expect(screen.getByText(/of 2/i)).toBeInTheDocument();

    rerender(
      <PipelineRunTablePagination
        page={1}
        count={10}
        rowSize={[5, 10, 20]}
        rowsPerPage={5}
        handleChangePage={() => {}}
        handleChangeRowsPerPage={() => {}}
      />,
    );
    // expect 6 - 10 of 10 [2] of 2
    expect(
      screen.getByRole('button', { name: /6 \- 10 of 10/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('2');
    expect(screen.getByText(/of 2/i)).toBeInTheDocument();
  });

  it('should trigger a page change', () => {
    const handleChangePage = jest.fn();
    render(
      <PipelineRunTablePagination
        page={2}
        count={20}
        rowSize={[5, 10, 20]}
        rowsPerPage={5}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={() => {}}
      />,
    );
    const nextButton = screen.getByTestId('next-page');
    const previousButton = screen.getByTestId('previous-page');
    const firstButton = screen.getByTestId('first-page');
    const lastButton = screen.getByTestId('last-page');

    fireEvent.click(previousButton);
    expect(handleChangePage).toHaveBeenCalledTimes(1);
    expect(handleChangePage).toHaveBeenCalledWith(1);

    fireEvent.click(nextButton);
    expect(handleChangePage).toHaveBeenCalledTimes(2);
    expect(handleChangePage).toHaveBeenCalledWith(3);

    fireEvent.click(firstButton);
    expect(handleChangePage).toHaveBeenCalledTimes(3);
    expect(handleChangePage).toHaveBeenCalledWith(0);

    // 0-indexed 20/5 = 4 - 1 = 3
    fireEvent.click(lastButton);
    expect(handleChangePage).toHaveBeenCalledTimes(4);
    expect(handleChangePage).toHaveBeenCalledWith(3);
  });
});
