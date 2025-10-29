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
import { useState } from 'react';
import { useAsync } from 'react-use';

import { Link, Progress, Table } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { Box, Chip, makeStyles } from '@material-ui/core';

import { jfrogArtifactoryApiRef } from '../../api';
import { Edge } from '../../types';
import { columns, useStyles } from './tableHeading';
import { formatByteSize, formatDate } from '../../utils';

const useLocalStyles = makeStyles({
  chip: {
    margin: 0,
    marginRight: '.2em',
    height: '1.5em',
    '& > span': {
      padding: '.3em',
    },
  },
});

export function JfrogArtifactoryRepository({ image, target }: RepositoryProps) {
  const jfrogArtifactoryClient = useApi(jfrogArtifactoryApiRef);
  const classes = useStyles();
  const localClasses = useLocalStyles();
  const [edges, setEdges] = useState<Edge[]>([]);
  const titleprop = `Jfrog Artifactory repository: ${image}`;

  const { loading } = useAsync(async () => {
    const tagsResponse = await jfrogArtifactoryClient.getTags(image, target);

    setEdges(tagsResponse.data.versions.edges);

    return tagsResponse;
  });

  if (loading) {
    return <Progress />;
  }

  const data = edges?.map((edge: Edge) => {
    const shortHash = edge.node.files
      .find(manifest => manifest.name === 'manifest.json')
      ?.sha256.substring(0, 12);
    return {
      name: edge.node.name,
      last_modified: formatDate(edge.node.modified),
      size: formatByteSize(Number(edge.node.size)),
      manifest_digest: (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip label="sha256" className={localClasses.chip} />
          {shortHash}
        </Box>
      ),
      repositories:
        `${edge.node.repos.length}` +
        ' | ' +
        `${edge.node.repos.map(repo => repo.name).join('| ')}`,
    };
  });

  return (
    <div style={{ border: '1px solid #ddd' }}>
      <Table
        title={titleprop}
        options={{ paging: true, padding: 'dense' }}
        data={data}
        columns={columns}
        emptyContent={
          <div className={classes.empty}>
            No data was added yet,&nbsp;
            <Link to="https://backstage.io/">learn how to add data</Link>.
          </div>
        }
      />
    </div>
  );
}

interface RepositoryProps {
  image: string;
  target?: string;
}
