/*
 * Copyright 2020 The Backstage Authors
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

import classnames from 'classnames';
import Typography from '@material-ui/core/Typography';
import { CurrencyType, Duration, GrowthType } from '../../types';
import { ChangeStatistic } from '@backstage-community/plugin-cost-insights-common';
import { rateOf } from '../../utils/currency';
import { growthOf } from '../../utils/change';
import { useCostGrowthStyles as useStyles } from '../../utils/styles';
import { formatPercent, formatCurrency } from '../../utils/formatters';
import { indefiniteArticleOf } from '../../utils/grammar';
import { useConfig, useCurrency } from '../../hooks';
import { notEmpty } from '../../utils/assert';
import { DateTime } from 'luxon';

/** @public */
export type CostGrowthProps = {
  change: ChangeStatistic;
  duration: Duration;
  customDateRange?: { start: string; end: string };
};

/** @public */
export const CostGrowth = (props: CostGrowthProps) => {
  const { change, duration, customDateRange } = props;

  const styles = useStyles();
  const { engineerCost, engineerThreshold } = useConfig();
  const [currency] = useCurrency();

  // Only display costs in absolute values
  const amount = Math.abs(change.amount);
  const ratio = Math.abs(change.ratio ?? NaN);

  // Calculate customDays if we have a custom date range
  // For custom ranges, we use floor division to get the first period length
  // (the rate calculation uses the average period length)
  let customDays: number | undefined;
  if (duration === Duration.CUSTOM && customDateRange) {
    const startDate = DateTime.fromISO(customDateRange.start);
    const endDate = DateTime.fromISO(customDateRange.end);
    const totalDays = Math.round(endDate.diff(startDate, 'days').days) + 1;
    // Use floor division for consistent period calculation
    customDays = Math.floor(totalDays / 2);
  }

  const rate = rateOf(engineerCost, duration, customDays);
  const engineers = amount / rate;
  const converted = amount / (currency.rate ?? rate);

  // If a ratio cannot be calculated, don't format.
  const growth = notEmpty(change.ratio)
    ? growthOf({ ratio: change.ratio, amount: engineers }, engineerThreshold)
    : null;
  // Determine if growth is significant enough to highlight
  const classes = classnames({
    [styles.excess]: growth === GrowthType.Excess,
    [styles.savings]: growth === GrowthType.Savings,
  });

  if (engineers < engineerThreshold) {
    return (
      <Typography component="span" className={classes}>
        Negligible
      </Typography>
    );
  }

  if (currency.kind === CurrencyType.USD) {
    // Do not display percentage if ratio cannot be calculated
    if (isNaN(ratio)) {
      return (
        <Typography component="span" className={classes}>
          ~{currency.prefix}
          {formatCurrency(converted)}
        </Typography>
      );
    }

    return (
      <Typography component="span" className={classes}>
        {formatPercent(ratio)} or ~{currency.prefix}
        {formatCurrency(converted)}
      </Typography>
    );
  }

  if (amount < 1) {
    return (
      <Typography component="span" className={classes}>
        less than {indefiniteArticleOf(['a', 'an'], currency.unit)}
      </Typography>
    );
  }

  // Do not display percentage if ratio cannot be calculated
  if (isNaN(ratio)) {
    return (
      <Typography component="span" className={classes}>
        ~{formatCurrency(converted, currency.unit)}
      </Typography>
    );
  }

  return (
    <Typography component="span" className={classes}>
      {formatPercent(ratio)} or ~{formatCurrency(converted, currency.unit)}
    </Typography>
  );
};
