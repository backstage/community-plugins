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
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';

import { Entity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

import { Box, Chip, makeStyles } from '@material-ui/core';

import { quayApiRef } from '../api';
import { Layer, QuayTagData, Tag } from '../types';
import { formatByteSize, formatDate } from '../utils';

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

export const useTags = (organization: string, repository: string) => {
  const quayClient = useApi(quayApiRef);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagManifestLayers, setTagManifestLayers] = useState<
    Record<string, Layer>
  >({});
  const [tagManifestStatuses, setTagManifestStatuses] = useState<
    Record<string, string>
  >({});
  const localClasses = useLocalStyles();

  const fetchSecurityDetails = async (tag: Tag) => {
    const securityDetails = await quayClient.getSecurityDetails(
      organization,
      repository,
      tag.manifest_digest,
    );
    return securityDetails;
  };

  const { loading } = useAsync(async () => {
    const tagsResponse = await quayClient.getTags(organization, repository);
    Promise.all(
      tagsResponse.tags.map(async tag => {
        const securityDetails = await fetchSecurityDetails(tag);
        const securityData = securityDetails.data;
        const securityStatus = securityDetails.status;

        setTagManifestStatuses(prevState => ({
          ...prevState,
          [tag.manifest_digest]: securityStatus,
        }));

        if (securityData) {
          setTagManifestLayers(prevState => ({
            ...prevState,
            [tag.manifest_digest]: securityData.Layer,
          }));
        }
      }),
    );
    setTags(prevTags => [...prevTags, ...tagsResponse.tags]);
    return tagsResponse;
  });

  const data: QuayTagData[] = useMemo(() => {
    return Object.values(tags)?.map(tag => {
      const hashFunc = tag.manifest_digest.substring(0, 6);
      const shortHash = tag.manifest_digest.substring(7, 19);
      return {
        id: `${tag.manifest_digest}-${tag.name}`,
        name: tag.name,
        last_modified: formatDate(tag.last_modified),
        size: formatByteSize(tag.size),
        rawSize: tag.size,
        manifest_digest: (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip label={hashFunc} className={localClasses.chip} />
            {shortHash}
          </Box>
        ),
        expiration: tag.expiration,
        securityDetails: tagManifestLayers[tag.manifest_digest],
        securityStatus: tagManifestStatuses[tag.manifest_digest],
        manifest_digest_raw: tag.manifest_digest,
        // is_manifest_list: tag.is_manifest_list,
        // reversion: tag.reversion,
        // start_ts: tag.start_ts,
        // end_ts: tag.end_ts,
        // manifest_list: tag.manifest_list,
      };
    });
  }, [tags, localClasses.chip, tagManifestLayers, tagManifestStatuses]);

  return { loading, data };
};

export const QUAY_ANNOTATION_REPOSITORY = 'quay.io/repository-slug';

export const useQuayAppData = ({ entity }: { entity: Entity }) => {
  const repositorySlug =
    entity?.metadata.annotations?.[QUAY_ANNOTATION_REPOSITORY] ?? '';

  if (!repositorySlug) {
    throw new Error("'Quay' annotations are missing");
  }
  return { repositorySlug };
};

export const useRepository = () => {
  const { entity } = useEntity();
  const { repositorySlug } = useQuayAppData({ entity });
  const info = repositorySlug.split('/');

  const organization = info.shift() as 'string';
  const repository = info.join('/');
  return {
    organization,
    repository,
  };
};

export const useTagDetails = (org: string, repo: string, digest: string) => {
  const quayClient = useApi(quayApiRef);
  const result = useAsync(async () => {
    const manifestLayer = await quayClient.getSecurityDetails(
      org,
      repo,
      digest,
    );
    return manifestLayer;
  });
  return result;
};
