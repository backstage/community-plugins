export const getTimeFromNow = (lastDate: string = 'N/A') => {
  if (lastDate === 'N/A') {
    return lastDate;
  }

  const intl = new Intl.RelativeTimeFormat('en', { style: 'long' });
  const WEEK_IN_MILLIS = 6.048e8;
  const DAY_IN_MILLIS = 8.64e7;
  const HOUR_IN_MILLIS = 3.6e6;
  const MIN_IN_MILLIS = 6e4;
  const SEC_IN_MILLIS = 1e3;

  const getUTCTime = (date: Date) =>
    date.getTime() - date.getTimezoneOffset() * 60000;
  const currentUTCTime = getUTCTime(new Date());
  const lastUTCTime = lastDate
    ? getUTCTime(new Date(lastDate))
    : currentUTCTime;
  const diff = currentUTCTime - lastUTCTime;

  if (Math.abs(diff) > WEEK_IN_MILLIS) {
    return intl.format(Math.trunc(-(diff / WEEK_IN_MILLIS)), 'week');
  } else if (Math.abs(diff) > DAY_IN_MILLIS) {
    return intl.format(Math.trunc(-(diff / DAY_IN_MILLIS)), 'day');
  } else if (Math.abs(diff) > HOUR_IN_MILLIS) {
    return intl.format(
      Math.trunc(-(diff % DAY_IN_MILLIS) / HOUR_IN_MILLIS),
      'hour',
    );
  } else if (Math.abs(diff) > MIN_IN_MILLIS) {
    return intl.format(
      Math.trunc(-(diff % HOUR_IN_MILLIS) / MIN_IN_MILLIS),
      'minute',
    );
  }

  return intl.format(
    Math.trunc(-(diff % MIN_IN_MILLIS) / SEC_IN_MILLIS),
    'second',
  );
};
