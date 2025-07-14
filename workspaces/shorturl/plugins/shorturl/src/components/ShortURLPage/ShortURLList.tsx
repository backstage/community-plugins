// code based on https://github.com/shailahir/backstage-plugin-shorturl
import { Link, Table } from '@backstage/core-components';
import React from 'react';
import { Box } from '@material-ui/core';
import { useShortUrlList } from '../../hooks/useShortUrlList';

export const ShortURLList = ({ refreshFlag }: { refreshFlag: boolean }) => {
  const { urlData, baseUrl } = useShortUrlList(refreshFlag);

  return (
    <Box>
      <Table
        columns={[
          {
            title: 'Full URL',
            field: 'full_url',
            render: (data: any) => {
              return (
                <Link to={`${data?.full_url}`}>{`${data?.full_url}`}</Link>
              );
            },
          },
          {
            title: 'Short URL',
            field: 'short_id',
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
