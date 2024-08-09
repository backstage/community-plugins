import React from 'react';

import useSwr, { useSWRConfig } from 'swr';
import * as uuid from 'uuid';

import { LONG_REFRESH_INTERVAL } from '../constants';

const usePolling = <T>(
  fn: () => Promise<T>,
  delayMs: number = LONG_REFRESH_INTERVAL,
  continueRefresh?: (value: T | undefined) => boolean,
  maxErrorRetryCount: number = 3,
) => {
  const config = useSWRConfig();

  const prevFn = React.useRef(fn);
  const uniqueKey = React.useMemo<string>(() => {
    return uuid.v4();
  }, []);

  const [error, setError] = React.useState();
  const isInitalLoad = React.useRef(true);

  const { data, isLoading } = useSwr<T>(uniqueKey, fn, {
    refreshInterval: (value_: T | undefined) => {
      return !continueRefresh || continueRefresh(value_) ? delayMs : 0;
    },
    shouldRetryOnError: true,
    onErrorRetry: (curError, _key, _config, revalidate, { retryCount }) => {
      // requires custom behavior, retryErrorCount option doesn't support hiding the error before reaching the maximum
      if (isInitalLoad.current || retryCount >= maxErrorRetryCount) {
        setError(curError);
      } else {
        setTimeout(() => revalidate({ retryCount }), delayMs);
      }
    },
    onSuccess: () => {
      isInitalLoad.current = false;
    },
  });

  const restart = React.useCallback(
    () => config.mutate(uniqueKey),
    [config, uniqueKey],
  );

  React.useEffect(() => {
    if (prevFn.current !== fn) {
      restart();
      prevFn.current = fn;
    }
  }, [fn, restart]);

  React.useEffect(() => {
    // clean cache after unmount, no need to store the data globally
    return () => config.cache.delete(uniqueKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    value: data,
    error,
    loading: isLoading,
    restart,
  };
};

export default usePolling;
