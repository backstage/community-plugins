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
import { renderInTestApp } from '@backstage/test-utils';
import { StatusIcon } from './StatusIcon';
import { BuildStatus } from '../../api';

describe('StatusIcon', () => {
  it('should render', async () => {
    let rendered = await renderInTestApp(
      <StatusIcon buildStatus="succeeded" />,
    );
    expect(rendered.getByLabelText('Status ok')).toBeInTheDocument();

    rendered = await renderInTestApp(<StatusIcon buildStatus="failed" />);
    expect(rendered.getByLabelText('Status error')).toBeInTheDocument();

    rendered = await renderInTestApp(<StatusIcon buildStatus="stopped" />);
    expect(rendered.getByLabelText('Status warning')).toBeInTheDocument();
  });

  it('should render invalid statuses', async () => {
    const rendered = await renderInTestApp(
      <StatusIcon buildStatus={'invalid' as BuildStatus} />,
    );
    expect(rendered.getByLabelText('Status aborted')).toBeInTheDocument();
  });
});
