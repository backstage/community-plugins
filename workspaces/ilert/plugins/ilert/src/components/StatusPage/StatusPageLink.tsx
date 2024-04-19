/*
 * Copyright 2021 The Backstage Authors
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
import { ilertApiRef } from '../../api';
import { StatusPage } from '../../types';

import { Link } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

export const StatusPageLink = ({
  statusPage,
}: {
  statusPage: StatusPage | null;
}) => {
  const ilertApi = useApi(ilertApiRef);

  if (!statusPage) {
    return null;
  }

  return (
    <Link to={ilertApi.getStatusPageDetailsURL(statusPage)}>
      #{statusPage.id}
    </Link>
  );
};
