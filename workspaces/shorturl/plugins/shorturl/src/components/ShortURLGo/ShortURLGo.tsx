import React, { useEffect } from 'react';
import { CircularProgress } from '@material-ui/core';
import {
  useApi,
  fetchApiRef,
  discoveryApiRef,
  identityApiRef,
  alertApiRef,
} from '@backstage/core-plugin-api';
import { DefaultShortURLApi } from '../../api';

export const ShortURLGo = () => {
  const alertApi = useApi(alertApiRef);
  const fetchApi = useApi(fetchApiRef);
  const identityApi = useApi(identityApiRef);
  const discoveryApi = useApi(discoveryApiRef);
  const shortURLApi = new DefaultShortURLApi(
    fetchApi,
    discoveryApi,
    identityApi,
  );
  const shortUrl = window.location.pathname.split('/go/')[1];

  useEffect(() => {
    const fetchData = async () => {
      const path = window.location.pathname;
      if (path.includes('/go/')) {
        const id = path.split('/go/')[1];
        try {
          const response = await shortURLApi.getRedirectURL(id).then(
            res => res.json(),
            _ => {
              alertApi.post({
                message: `No redirection found for ID ${id}`,
                severity: 'error',
              });
              return null;
            },
          );
          if (response.status === 'ok') {
            window.location.href = response.redirectUrl;
          } else {
            alertApi.post({
              message: `No redirection found for ID ${id}`,
              severity: 'error',
            });
          }
        } catch (error) {
          alertApi.post({
            message: 'Failed to fetch redirection URL',
            severity: 'error',
          });
        }
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortUrl]);

  return <CircularProgress />;
};
