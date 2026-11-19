/*
 * Copyright 2026 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useNavigate } from 'react-router-dom';
import useAsync from 'react-use/esm/useAsync';
import Button from '@mui/material/Button';
import {
  Content,
  ContentHeader,
  Link,
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { usePermission } from '@backstage/plugin-permission-react';
import {
  MdxCardTemplateSummary,
  mdxCardTemplateCreatePermission,
} from '@backstage-community/plugin-mdx-card-common';
import { mdxCardApiRef } from '../../api';

const columns: TableColumn<MdxCardTemplateSummary>[] = [
  {
    title: 'ID',
    field: 'id',
    render: row => <Link to={`edit/${row.id}`}>{row.id}</Link>,
  },
  { title: 'Title', field: 'title' },
  { title: 'Updated by', field: 'updatedBy' },
  {
    title: 'Updated',
    field: 'updatedAt',
    render: row => new Date(row.updatedAt).toLocaleString(),
  },
];

export const TemplateList = () => {
  const mdxCardApi = useApi(mdxCardApiRef);
  const navigate = useNavigate();
  const { allowed: canCreate } = usePermission({
    permission: mdxCardTemplateCreatePermission,
  });
  const { value, loading, error } = useAsync(
    () => mdxCardApi.listTemplates(),
    [mdxCardApi],
  );

  return (
    <Content>
      <ContentHeader title="MDX cards">
        <Button
          variant="contained"
          disabled={!canCreate}
          onClick={() => navigate('new')}
        >
          Create card
        </Button>
      </ContentHeader>
      {error ? (
        <ResponseErrorPanel error={error} />
      ) : (
        <Table
          isLoading={loading}
          options={{ paging: false, search: true }}
          columns={columns}
          data={value ?? []}
          emptyContent={
            <Content>No MDX cards yet. Create one to get started.</Content>
          }
        />
      )}
    </Content>
  );
};
