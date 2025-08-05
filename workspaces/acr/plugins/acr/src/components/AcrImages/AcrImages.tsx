/*
 * Copyright 2024 The Backstage Authors
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
import { ErrorPanel, Table } from '@backstage/core-components';
import { Box } from '@material-ui/core';
import { formatDate } from '../../utils/acr-utils';

import { useTags } from '../../hooks/useTags';
import { Tag, TagRow } from '../../types';
import { columns } from './tableHeading';

type AcrImagesProps = {
  image: string;
  registryName?: string;
};

export const AcrImages = ({ image, registryName }: AcrImagesProps) => {
  const title = `Azure Container Registry Repository: ${image}`;

  const { loading, value, error } = useTags(image, registryName);

  // TODO: it should be possible to just pass the tags to the table.
  const tags = value?.tags || [];
  const data = tags.map<TagRow>((tag: Tag) => {
    return {
      name: tag.name,
      createdTime: formatDate(tag.createdTime),
      lastModified: formatDate(tag.lastUpdateTime),
      manifestDigest: tag.digest,
      id: tag.name,
    };
  });

  const emptyContent = error ? (
    <Box padding={2}>
      <ErrorPanel error={error} />
    </Box>
  ) : null;

  return (
    <Table
      title={title}
      columns={columns}
      isLoading={loading}
      data={data}
      options={{ paging: true, padding: 'dense' }}
      emptyContent={emptyContent}
    />
  );
};
