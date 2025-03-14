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
import { PipelineRunToolbar } from '../PipelineRunToolbar';

describe('PipelineRunToolbar', () => {
  it('should render the pagination and search bar', () => {
    render(
      <PipelineRunToolbar
        totalCount={2}
        searchInputRef={null}
        page={0}
        rowSize={[5, 10, 20]}
        rowsPerPage={5}
        onSearch={() => {}}
        handleChangePage={() => {}}
        handleChangeRowsPerPage={() => {}}
      />,
    );
    expect(screen.getByTestId('pipeline-run-pagination')).toBeInTheDocument();
    expect(
      screen.getByTestId('pipeline-run-toolbar-input'),
    ).toBeInTheDocument();
  });

  it('should trigger a search on input change', () => {
    const onSearch = jest.fn();
    render(
      <PipelineRunToolbar
        totalCount={2}
        page={0}
        rowSize={[5, 10, 20]}
        rowsPerPage={5}
        searchInputRef={null}
        onSearch={onSearch}
        handleChangePage={() => {}}
        handleChangeRowsPerPage={() => {}}
      />,
    );
    const input = screen
      .getByTestId('pipeline-run-toolbar-input')
      .querySelector('input')!;
    fireEvent.change(input, { target: { value: 'test' } });
    expect(onSearch).toHaveBeenCalledTimes(1);
  });
});
