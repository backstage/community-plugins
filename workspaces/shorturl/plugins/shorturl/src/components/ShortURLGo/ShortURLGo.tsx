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

export const ShortURLGo = () => {
  const [redirectError, setRedirectError] = React.useState(new Error());
  const fetchApi = useApi(fetchApiRef);
  const identityApi = useApi(identityApiRef);
  const discoveryApi = useApi(discoveryApiRef);
  const shortURLApi = new DefaultShortURLApi(
    fetchApi,
    discoveryApi,
    identityApi,
  );
  const shortUrl = window.location.href.split('/go/')[1];

  useEffect(() => {
    const fetchData = async () => {
      if (!shortUrl || shortUrl === 'undefined') {
        setRedirectError(new Error('Undefined ID found in URL'));
        return;
      }
      try {
        const response = await shortURLApi.getRedirectURL(shortUrl);
        const responseJson = await response.json();
        if (response.status === 200) {
          window.location.href = responseJson.redirectUrl;
          return;
        } else if (response.status === 404) {
          setRedirectError(
            new Error(`No redirection found for path ${shortUrl}`),
          );
        } else {
          setRedirectError(
            new Error(
              `StatusCode: ${response.status}, Message: ${response.json}`,
            ),
          );
        }
      } catch (error) {
        setRedirectError(
          new Error(`Failed to fetch redirection URL: ${error}`),
        );
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortUrl]);

  return (
    <Content>
      {(redirectError.message === '' && <Progress />) || (
        <Box>
          <ErrorPanel title="Redirection failure" error={redirectError} />
          <BottomLink title="Check existing ShortURLs" link="/shorturl" />
        </Box>
      )}
    </Content>
  );
};
