import React, { useEffect } from 'react';
import { Box } from '@material-ui/core';
import {
  useApi,
  fetchApiRef,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import { DefaultShortURLApi } from '../../api';
import {
  BottomLink,
  Content,
  ErrorPanel,
  Progress,
} from '@backstage/core-components';
import { useAsync } from '@react-hookz/web';

export const ShortURLGo = () => {
  const fetchApi = useApi(fetchApiRef);
  const identityApi = useApi(identityApiRef);
  const discoveryApi = useApi(discoveryApiRef);
  const shortURLApi = new DefaultShortURLApi(
    fetchApi,
    discoveryApi,
    identityApi,
  );
  const shortUrl = window.location.href.split('/go/')[1];

  const [{ status, error }, { execute }] = useAsync(async () => {
    if (!shortUrl || shortUrl === 'undefined') {
      throw new Error('Undefined ID found in URL');
    }

    const response = await shortURLApi.getRedirectURL(shortUrl);
    const responseJson = await response.json();

    if (response.status === 200) {
      window.location.href = responseJson.redirectUrl;
    } else if (response.status === 404) {
      throw new Error(`No redirection found for path ${shortUrl}`);
    } else {
      throw new Error(
        `StatusCode: ${response.status}, Message: ${
          responseJson?.message || response.statusText
        }`,
      );
    }
  });

  useEffect(() => {
    execute();
  });

  return (
    <Content>
      {status === 'loading' && <Progress />}
      {status === 'error' && error && (
        <Box>
          <ErrorPanel title="Redirection failure" error={error} />
          <BottomLink title="Check existing ShortURLs" link="/shorturl" />
        </Box>
      )}
    </Content>
  );
};
