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

import { renderInTestApp } from '@backstage/test-utils';
import { screen, fireEvent } from '@testing-library/react';
import { TimeRangeSelector } from './TimeRangeSelector';

describe('TimeRangeSelector', () => {
  it('renders all preset buttons', async () => {
    await renderInTestApp(
      <TimeRangeSelector
        preset="30d"
        onPresetChange={jest.fn()}
        onCustomRangeChange={jest.fn()}
      />,
    );
    expect(screen.getByText('7D')).toBeInTheDocument();
    expect(screen.getByText('30D')).toBeInTheDocument();
    expect(screen.getByText('90D')).toBeInTheDocument();
    expect(screen.getByText('Quarter')).toBeInTheDocument();
    expect(screen.getByText('1Y')).toBeInTheDocument();
  });

  it('renders From and To date inputs', async () => {
    await renderInTestApp(
      <TimeRangeSelector
        onPresetChange={jest.fn()}
        onCustomRangeChange={jest.fn()}
      />,
    );
    // MUI TextField date inputs — query by type since label association varies
    const dateInputs = document.querySelectorAll('input[type="date"]');
    expect(dateInputs).toHaveLength(2);
  });

  it('calls onPresetChange when a preset button is clicked', async () => {
    const onPresetChange = jest.fn();
    await renderInTestApp(
      <TimeRangeSelector
        preset="30d"
        onPresetChange={onPresetChange}
        onCustomRangeChange={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByText('7D'));
    expect(onPresetChange).toHaveBeenCalledWith('7d');
  });

  it('calls onPresetChange with correct value for each preset', async () => {
    const onPresetChange = jest.fn();
    await renderInTestApp(
      <TimeRangeSelector
        onPresetChange={onPresetChange}
        onCustomRangeChange={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByText('1Y'));
    expect(onPresetChange).toHaveBeenCalledWith('1y');
    fireEvent.click(screen.getByText('Quarter'));
    expect(onPresetChange).toHaveBeenCalledWith('quarter');
  });

  it('calls onCustomRangeChange when the From date changes', async () => {
    const onCustomRangeChange = jest.fn();
    await renderInTestApp(
      <TimeRangeSelector
        to="2024-01-31"
        onPresetChange={jest.fn()}
        onCustomRangeChange={onCustomRangeChange}
      />,
    );
    const [fromInput] = document.querySelectorAll('input[type="date"]');
    fireEvent.change(fromInput, { target: { value: '2024-01-01' } });
    expect(onCustomRangeChange).toHaveBeenCalledWith(
      '2024-01-01',
      '2024-01-31',
    );
  });

  it('calls onCustomRangeChange when the To date changes', async () => {
    const onCustomRangeChange = jest.fn();
    await renderInTestApp(
      <TimeRangeSelector
        from="2024-01-01"
        onPresetChange={jest.fn()}
        onCustomRangeChange={onCustomRangeChange}
      />,
    );
    const [, toInput] = document.querySelectorAll('input[type="date"]');
    fireEvent.change(toInput, { target: { value: '2024-01-31' } });
    expect(onCustomRangeChange).toHaveBeenCalledWith(
      '2024-01-01',
      '2024-01-31',
    );
  });

  it('displays provided date values in the inputs', async () => {
    await renderInTestApp(
      <TimeRangeSelector
        from="2024-03-01"
        to="2024-03-31"
        onPresetChange={jest.fn()}
        onCustomRangeChange={jest.fn()}
      />,
    );
    expect(screen.getByDisplayValue('2024-03-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-03-31')).toBeInTheDocument();
  });
});
