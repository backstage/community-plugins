import { useCallback, useEffect, useState } from 'react';
import { useApi, alertApiRef, configApiRef } from '@backstage/core-plugin-api';
import { shorturlApiRef } from '../api';
import useAsync from 'react-use/lib/useAsync';

export function useShortUrlList(refreshFlag: boolean) {
  const [urlData, setUrlData] = useState([]);
  const [apiFailure, setApiFailure] = useState(false);
  const alertApi = useApi(alertApiRef);
  const shorturlApi = useApi(shorturlApiRef);
  const configApi = useApi(configApiRef);

  const getData = useCallback(async () => {
    try {
      const res = await shorturlApi.getAllURLs();
      const response = await res.json();

      if (response?.status === 'ok') {
        setUrlData(response.data);
        setApiFailure(false);
      } else {
        throw new Error('Short URL API returned an error');
      }
    } catch (error) {
      setApiFailure(true);
      setUrlData([]);
      alertApi.post({
        message: 'Failed to fetch ShortURLs',
        severity: 'error',
      });
    }
  }, [alertApi, shorturlApi]);

  const { value: baseUrl } = useAsync(async () => {
    return await configApi.getString('app.baseUrl');
  }, []);

  useEffect(() => {
    getData();
  }, [getData, apiFailure, refreshFlag]);

  return {
    urlData,
    baseUrl,
  };
}
