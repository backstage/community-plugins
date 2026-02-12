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

import { screen, waitFor } from '@testing-library/react';
import { renderInTestApp } from '@backstage/test-utils';
import userEvent from '@testing-library/user-event';
import { DateRangePicker, getDefaultOptions } from './DateRangePicker';
import { getDefaultPageFilters } from '../../utils/filters';
import { MockBillingDateProvider } from '../../testUtils';
import { Duration } from '../../types';
import { Group } from '@backstage-community/plugin-cost-insights-common';

const DefaultPageFilters = getDefaultPageFilters([{ id: 'tools' }] as Group[]);
const lastCompleteBillingDate = '2020-05-01';
const options = getDefaultOptions(lastCompleteBillingDate);

describe('<DateRangePicker />', () => {
  it('Renders without exploding', async () => {
    await renderInTestApp(
      <MockBillingDateProvider
        lastCompleteBillingDate={lastCompleteBillingDate}
      >
        <DateRangePicker
          duration={DefaultPageFilters.duration}
          onSelect={jest.fn()}
        />
      </MockBillingDateProvider>,
    );
    expect(screen.getByTestId('period-select')).toBeInTheDocument();
  });

  it('Should display all preset period options', async () => {
    await renderInTestApp(
      <MockBillingDateProvider
        lastCompleteBillingDate={lastCompleteBillingDate}
      >
        <DateRangePicker
          duration={DefaultPageFilters.duration}
          onSelect={jest.fn()}
        />
      </MockBillingDateProvider>,
    );
    const button = screen.getByTestId('period-select');
    await userEvent.click(button);
    await waitFor(() => screen.getByText('Quick Select'));
    options.forEach(option =>
      expect(
        screen.getByTestId(`period-preset-${option.value}`),
      ).toBeInTheDocument(),
    );
  });

  describe.each`
    duration
    ${Duration.P3M}
    ${Duration.P90D}
    ${Duration.P30D}
  `('Should select the correct preset duration', ({ duration }) => {
    it(`Should select ${duration}`, async () => {
      const mockOnSelect = jest.fn();
      const mockDuration =
        DefaultPageFilters.duration === duration
          ? Duration.P30D
          : DefaultPageFilters.duration;

      await renderInTestApp(
        <MockBillingDateProvider
          lastCompleteBillingDate={lastCompleteBillingDate}
        >
          <DateRangePicker duration={mockDuration} onSelect={mockOnSelect} />,
        </MockBillingDateProvider>,
      );
      const button = screen.getByTestId('period-select');

      await userEvent.click(button);
      await userEvent.click(screen.getByTestId(`period-preset-${duration}`));
      expect(mockOnSelect).toHaveBeenCalledWith(duration);
    });
  });

  it('Should display custom date range section', async () => {
    await renderInTestApp(
      <MockBillingDateProvider
        lastCompleteBillingDate={lastCompleteBillingDate}
      >
        <DateRangePicker
          duration={DefaultPageFilters.duration}
          onSelect={jest.fn()}
        />
      </MockBillingDateProvider>,
    );
    const button = screen.getByTestId('period-select');
    await userEvent.click(button);

    await waitFor(() => screen.getByText('Custom Date Range'));
    // Query by test ID for more reliable selection
    expect(screen.getByTestId('apply-custom-range')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('Should display custom date range when CUSTOM duration is selected', async () => {
    const customDateRange = { start: '2020-01-01', end: '2020-01-31' };

    await renderInTestApp(
      <MockBillingDateProvider
        lastCompleteBillingDate={lastCompleteBillingDate}
      >
        <DateRangePicker
          duration={Duration.CUSTOM}
          onSelect={jest.fn()}
          customDateRange={customDateRange}
        />
      </MockBillingDateProvider>,
    );

    const button = screen.getByTestId('period-select');
    expect(button).toHaveTextContent('2020-01-01 to 2020-01-31');
  });

  it('Should not apply date range when start date is missing', async () => {
    const mockOnSelect = jest.fn();

    await renderInTestApp(
      <MockBillingDateProvider
        lastCompleteBillingDate={lastCompleteBillingDate}
      >
        <DateRangePicker
          duration={DefaultPageFilters.duration}
          onSelect={mockOnSelect}
        />
      </MockBillingDateProvider>,
    );

    const button = screen.getByTestId('period-select');
    await userEvent.click(button);

    // Wait for popover to open
    await waitFor(() => screen.getByText('Custom Date Range'));

    // Verify that onSelect is NOT called when Apply is clicked without selecting dates
    // (button should be disabled, preventing the action)
    const applyButton = screen.getByTestId('apply-custom-range');
    expect(applyButton).toBeDisabled();

    // Verify no callback was triggered
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('Should close popover when Cancel is clicked', async () => {
    await renderInTestApp(
      <MockBillingDateProvider
        lastCompleteBillingDate={lastCompleteBillingDate}
      >
        <DateRangePicker
          duration={DefaultPageFilters.duration}
          onSelect={jest.fn()}
        />
      </MockBillingDateProvider>,
    );

    const button = screen.getByTestId('period-select');
    await userEvent.click(button);

    await waitFor(() => screen.getByText('Custom Date Range'));

    const cancelButton = screen.getByText('Cancel');
    await userEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Custom Date Range')).not.toBeInTheDocument();
    });
  });

  it('Should display helper text indicating end date is optional', async () => {
    const mockOnSelect = jest.fn();

    await renderInTestApp(
      <MockBillingDateProvider
        lastCompleteBillingDate={lastCompleteBillingDate}
      >
        <DateRangePicker
          duration={DefaultPageFilters.duration}
          onSelect={mockOnSelect}
        />
      </MockBillingDateProvider>,
    );

    const button = screen.getByTestId('period-select');
    await userEvent.click(button);

    await waitFor(() => screen.getByText('Custom Date Range'));

    // Verify the UI communicates that end date defaults to yesterday
    expect(screen.getByText('Defaults to yesterday')).toBeInTheDocument();
    const endDateLabels = screen.getAllByText('End Date (optional)');
    expect(endDateLabels.length).toBeGreaterThan(0);
  });

  it('Should be backward compatible with PeriodSelect props', async () => {
    const mockOnSelect = jest.fn();

    // Test that it accepts the same props as PeriodSelect
    await renderInTestApp(
      <MockBillingDateProvider
        lastCompleteBillingDate={lastCompleteBillingDate}
      >
        <DateRangePicker
          duration={Duration.P30D}
          onSelect={mockOnSelect}
          options={options}
        />
      </MockBillingDateProvider>,
    );

    expect(screen.getByTestId('period-select')).toBeInTheDocument();

    // Test that preset selection works like PeriodSelect
    const button = screen.getByTestId('period-select');
    await userEvent.click(button);
    await userEvent.click(screen.getByTestId(`period-preset-${Duration.P90D}`));

    expect(mockOnSelect).toHaveBeenCalledWith(Duration.P90D);
  });

  describe('Edge cases', () => {
    it('Should handle CUSTOM duration without customDateRange gracefully', async () => {
      const mockOnSelect = jest.fn();

      // When CUSTOM duration is set but no customDateRange is provided,
      // it should fall back to displaying a default format
      await renderInTestApp(
        <MockBillingDateProvider
          lastCompleteBillingDate={lastCompleteBillingDate}
        >
          <DateRangePicker duration={Duration.CUSTOM} onSelect={mockOnSelect} />
        </MockBillingDateProvider>,
      );

      const button = screen.getByTestId('period-select');
      // Should display "Select Period" as fallback when customDateRange is missing
      expect(button).toBeInTheDocument();
    });

    it('Should handle same start and end date (single day range)', async () => {
      const singleDayRange = { start: '2020-05-01', end: '2020-05-01' };

      await renderInTestApp(
        <MockBillingDateProvider
          lastCompleteBillingDate={lastCompleteBillingDate}
        >
          <DateRangePicker
            duration={Duration.CUSTOM}
            onSelect={jest.fn()}
            customDateRange={singleDayRange}
          />
        </MockBillingDateProvider>,
      );

      const button = screen.getByTestId('period-select');
      // Should display the single-day range correctly
      expect(button).toHaveTextContent('2020-05-01 to 2020-05-01');
    });

    it('Should handle date range far in the past', async () => {
      const pastRange = { start: '2000-01-01', end: '2000-12-31' };

      await renderInTestApp(
        <MockBillingDateProvider
          lastCompleteBillingDate={lastCompleteBillingDate}
        >
          <DateRangePicker
            duration={Duration.CUSTOM}
            onSelect={jest.fn()}
            customDateRange={pastRange}
          />
        </MockBillingDateProvider>,
      );

      const button = screen.getByTestId('period-select');
      // Should display dates from the past correctly
      expect(button).toHaveTextContent('2000-01-01 to 2000-12-31');
    });

    it('Should handle date range spanning multiple years', async () => {
      const longRange = { start: '2019-01-01', end: '2021-12-31' };

      await renderInTestApp(
        <MockBillingDateProvider
          lastCompleteBillingDate={lastCompleteBillingDate}
        >
          <DateRangePicker
            duration={Duration.CUSTOM}
            onSelect={jest.fn()}
            customDateRange={longRange}
          />
        </MockBillingDateProvider>,
      );

      const button = screen.getByTestId('period-select');
      // Should handle multi-year ranges
      expect(button).toHaveTextContent('2019-01-01 to 2021-12-31');
    });

    it('Should close popover and not call onSelect when user cancels', async () => {
      const mockOnSelect = jest.fn();

      await renderInTestApp(
        <MockBillingDateProvider
          lastCompleteBillingDate={lastCompleteBillingDate}
        >
          <DateRangePicker
            duration={DefaultPageFilters.duration}
            onSelect={mockOnSelect}
          />
        </MockBillingDateProvider>,
      );

      const button = screen.getByTestId('period-select');
      await userEvent.click(button);
      await waitFor(() => screen.getByText('Custom Date Range'));

      const cancelButton = screen.getByText('Cancel');
      await userEvent.click(cancelButton);

      // Verify popover closed and onSelect was not called
      await waitFor(() => {
        expect(screen.queryByText('Custom Date Range')).not.toBeInTheDocument();
      });
      expect(mockOnSelect).not.toHaveBeenCalled();
    });

    it('Should handle rapid preset selection changes', async () => {
      const mockOnSelect = jest.fn();

      await renderInTestApp(
        <MockBillingDateProvider
          lastCompleteBillingDate={lastCompleteBillingDate}
        >
          <DateRangePicker duration={Duration.P30D} onSelect={mockOnSelect} />
        </MockBillingDateProvider>,
      );

      const button = screen.getByTestId('period-select');
      await userEvent.click(button);

      // Rapidly select different presets
      await userEvent.click(
        screen.getByTestId(`period-preset-${Duration.P90D}`),
      );
      await userEvent.click(button);
      await userEvent.click(
        screen.getByTestId(`period-preset-${Duration.P3M}`),
      );

      // Should have been called twice with correct durations
      expect(mockOnSelect).toHaveBeenCalledTimes(2);
      expect(mockOnSelect).toHaveBeenNthCalledWith(1, Duration.P90D);
      expect(mockOnSelect).toHaveBeenNthCalledWith(2, Duration.P3M);
    });
  });
});
