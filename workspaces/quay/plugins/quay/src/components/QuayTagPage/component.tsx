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
import { useParams } from 'react-router-dom';

import { ErrorPanel, Progress } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';

import { useRepository, useTagDetails } from '../../hooks';
import { useQuayViewPermission } from '../../hooks/useQuayViewPermission';
import { rootRouteRef } from '../../routes';
import PermissionAlert from '../PermissionAlert/PermissionAlert';
import { QuayTagDetails } from '../QuayTagDetails';

export const QuayTagPage = () => {
  const rootLink = useRouteRef(rootRouteRef);
  const { repository, organization } = useRepository();
  const { digest } = useParams();
  const hasViewPermission = useQuayViewPermission();
  if (!digest) {
    throw new Error('digest is not defined');
  }
  const { loading, value } = useTagDetails(organization, repository, digest);

  if (!hasViewPermission) {
    return <PermissionAlert />;
  }

  if (loading) {
    return (
      <div data-testid="quay-tag-page-progress">
        <Progress variant="query" />
      </div>
    );
  }
  if (!value?.data) {
    return <ErrorPanel error={new Error('no digest')} />;
  }

  return (
    <QuayTagDetails
      rootLink={rootLink}
      layer={value.data.Layer}
      digest={digest}
    />
  );
};

export default QuayTagPage;
