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

import { fireEvent, screen } from '@testing-library/react';

import { PipelineRunListSearchBar } from './PipelineRunListSearchBar';
import { renderInTestApp } from '@backstage/test-utils';

describe('PipelineRunListSearchBar', () => {
  test('renders PipelineRunListSearchBar component', async () => {
    const { getByPlaceholderText } = await renderInTestApp(
      <PipelineRunListSearchBar value="" onChange={() => {}} />,
    );

    screen.logTestingPlaygroundURL();

    expect(getByPlaceholderText('Search')).toBeInTheDocument();
  });

  test('handles search input change', async () => {
    const onChange = jest.fn();
    const { getByPlaceholderText, getByTestId } = await renderInTestApp(
      <PipelineRunListSearchBar value="" onChange={onChange} />,
    );
    const searchInput = getByPlaceholderText('Search');
    const clearButton = getByTestId('clear-search');
    expect(clearButton.getAttribute('disabled')).toBe(''); // disabled

    fireEvent.change(searchInput, { target: { value: 'example' } });

    expect(onChange).toHaveBeenCalledWith('example');
  });

  test('clears search input', async () => {
    const onChange = jest.fn();
    const { getByTestId } = await renderInTestApp(
      <PipelineRunListSearchBar value="example" onChange={onChange} />,
    );
    const clearButton = getByTestId('clear-search');
    expect(clearButton.getAttribute('disabled')).toBe(null); // not disabled

    fireEvent.click(getByTestId('clear-search'));

    expect(onChange).toHaveBeenCalledWith('');
  });
});
