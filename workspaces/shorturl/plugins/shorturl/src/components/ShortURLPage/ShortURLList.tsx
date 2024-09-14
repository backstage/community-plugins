// code based on https://github.com/shailahir/backstage-plugin-shorturl
import { Link, Table } from '@backstage/core-components';
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';
import { Box } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { shorturlApiRef } from '../../api';
import useAsync from 'react-use/lib/useAsync';

export const ShortURLList = () => {
  const [urlData, setUrlData] = useState([]);
  const discoveryApi = useApi(discoveryApiRef);
  const shorturlApi = useApi(shorturlApiRef);

  const getData = async () => {
    try {
      const data = await shorturlApi.getMappingData();
      const jsonData = await data.json();
      if (jsonData && jsonData.status === 'ok') {
        setUrlData(jsonData?.data);
      } else {
        setUrlData([]);
      }
    } catch (error) {
      setUrlData([]);
    }
  };

  const { value: baseUrl } = useAsync(async () => {
    return await discoveryApi.getBaseUrl('shorturl');
  }, []);

  useEffect(() => {
    getData();
  });

  return (
    <Box>
      <Table
        columns={[
          {
            title: 'Id',
            field: 'short_id',
          },
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
