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
import Button from '@material-ui/core/Button';
import { EmptyState } from '@backstage/core-components';

export const MissingAuthorizationHeaderError = () => (
  <EmptyState
    missing="info"
    title="Missing or invalid iLert authorization header"
    description="The request to fetch data needs a valid authorization header. See README for more details."
    action={
      <Button
        color="primary"
        variant="contained"
        href="https://github.com/backstage/backstage/blob/master/plugins/ilert/README.md"
      >
        Read More
      </Button>
    }
  />
);
