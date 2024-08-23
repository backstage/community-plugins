import { DateTime } from 'luxon';
import createStateContext from 'react-use/lib/factory/createStateContext';

export const [useSharedDateRange, SharedDateRangeProvider] = createStateContext(
  {
    startDate: DateTime.now().minus({ days: 28 }).toJSDate(),
    endDate: DateTime.now().minus({ days: 1 }).toJSDate(),
  },
);
