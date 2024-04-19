/*
 * Copyright 2020 The Backstage Authors
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

import React from 'react';
import useAsync from 'react-use/esm/useAsync';
import { codeClimateApiRef } from '../../api';
import { CodeClimateTable } from '../CodeClimateTable';
import { CODECLIMATE_REPO_ID_ANNOTATION } from '../../plugin';
import {
  useEntity,
  MissingAnnotationEmptyState,
} from '@backstage/plugin-catalog-react';
import { EmptyState, ErrorPanel, Progress } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

export const CodeClimateCardContents = () => {
  const { entity } = useEntity();
  const codeClimateApi = useApi(codeClimateApiRef);

  const repoID =
    entity?.metadata.annotations?.[CODECLIMATE_REPO_ID_ANNOTATION] ?? '';

  const { loading, value, error } = useAsync(
    () => codeClimateApi.fetchData(repoID),
    [codeClimateApi, repoID],
  );

  if (loading) {
    return <Progress />;
  } else if (!repoID) {
    return (
      <MissingAnnotationEmptyState
        annotation={CODECLIMATE_REPO_ID_ANNOTATION}
      />
    );
  } else if (error) {
    return <ErrorPanel error={error} />;
  } else if (!value) {
    return (
      <EmptyState
        missing="info"
        title="No information to display"
        description={`There is no Code Climate repo setup with id '${repoID}'.`}
      />
    );
  }

  return <CodeClimateTable codeClimateData={value} />;
};
