// code based on https://github.com/shailahir/backstage-plugin-shorturl
import { Link, Table } from '@backstage/core-components';
import { alertApiRef, configApiRef, useApi } from '@backstage/core-plugin-api';
import { Box } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { shorturlApiRef } from '../../api';
import useAsync from 'react-use/lib/useAsync';

export const ShortURLList = ({ refreshFlag }: { refreshFlag: boolean }) => {
  const [urlData, setUrlData] = useState([]);
  const [apiFailure, setApiFailure] = useState(false);
  const alertApi = useApi(alertApiRef);
  const shorturlApi = useApi(shorturlApiRef);
  const configApi = useApi(configApiRef);

  const getData = async () => {
    try {
      const response = await shorturlApi.getAllURLs().then(res => res.json());
      if (response && response.status === 'ok') {
        if (urlData !== response?.data) {
          setUrlData(response?.data);
        }
        setApiFailure(false);
      } else {
        setApiFailure(true);
        setUrlData([]);
        alertApi.post({
          message: 'Failed to fetch ShortURLs',
          severity: 'error',
        });
      }
    } catch (error) {
      setApiFailure(true);
      setUrlData([]);
      alertApi.post({
        message: 'Failed to fetch ShortURLs',
        severity: 'error',
      });
    }
  };

  const { value: baseUrl } = useAsync(async () => {
    return await configApi.getString('app.baseUrl');
  }, []);

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiFailure, refreshFlag]);

  return (
    <Box>
      <Table
        columns={[
          {
            title: 'Full URL',
            render: (data: any) => {
              return (
                <Link to={`${data?.full_url}`}>{`${data?.full_url}`}</Link>
              );
            },
          },
          {
            title: 'Short URL',
            render: (data: any) => {
              return (
                <Link
                  to={`${baseUrl}/go/${data?.short_id}`}
                >{`${baseUrl}/go/${data?.short_id}`}</Link>
              );
            },
          },
          {
            title: 'Usage Count',
            field: 'usage_count',
          },
        ]}
        data={urlData || []}
      />
    </Box>
  );
};
