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
import { Typography } from '@material-ui/core';

import { ReplicaSet } from '../../../../../types/resources';
import { useTranslation } from '../../../../../hooks/useTranslation';

const RevisionImage = ({ revision }: { revision: ReplicaSet }) => {
  const image = revision.spec?.template?.spec?.containers?.[0]?.image;
  const { t } = useTranslation();

  if (!image) {
    return null;
  }

  return (
    <div style={{ maxWidth: '95%' }}>
      <Typography variant="body2" color="textPrimary">
        {t(
          'deploymentLifecycle.sidebar.rollouts.revisions.revisionImage.textPrimary',
        )}{' '}
        {image}
      </Typography>
    </div>
  );
};
export default RevisionImage;
