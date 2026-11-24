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
import { useNavigate, useResolvedPath } from 'react-router-dom';
import {
  Button,
  CellText,
  ColumnConfig,
  Container,
  Flex,
  Table,
  Text,
  useTable,
} from '@backstage/ui';
import { useApi } from '@backstage/core-plugin-api';
import { usePermission } from '@backstage/plugin-permission-react';
import {
  MdxCardTemplateSummary,
  mdxCardTemplateCreatePermission,
} from '@backstage-community/plugin-mdx-card-common';
import { mdxCardApiRef } from '../../api';

export const TemplateList = () => {
  const mdxCardApi = useApi(mdxCardApiRef);
  const navigate = useNavigate();
  const editPath = useResolvedPath('edit').pathname;
  const { allowed: canCreate } = usePermission({
    permission: mdxCardTemplateCreatePermission,
  });
  const { tableProps } = useTable({
    mode: 'complete',
    getData: () => mdxCardApi.listTemplates(),
  });

  const columns: ColumnConfig<MdxCardTemplateSummary>[] = [
    {
      id: 'id',
      label: 'ID',
      isRowHeader: true,
      cell: template => (
        <CellText title={template.id} href={`${editPath}/${template.id}`} />
      ),
    },
    {
      id: 'title',
      label: 'Title',
      cell: template => <CellText title={template.title ?? ''} />,
    },
    {
      id: 'updatedBy',
      label: 'Updated by',
      cell: template => <CellText title={template.updatedBy} />,
    },
    {
      id: 'updatedAt',
      label: 'Updated',
      cell: template => (
        <CellText title={new Date(template.updatedAt).toLocaleString()} />
      ),
    },
  ];

  return (
    <Container>
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Text as="h2" variant="title-medium">
            MDX cards
          </Text>
          <Button isDisabled={!canCreate} onPress={() => navigate('new')}>
            Create card
          </Button>
        </Flex>
        <Table
          columnConfig={columns}
          emptyState={<Text>No MDX cards yet. Create one to get started.</Text>}
          {...tableProps}
        />
      </Flex>
    </Container>
  );
};
