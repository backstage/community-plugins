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
import type { FC } from 'react';

import { Fragment } from 'react';
import { renderInTestApp } from '@backstage/test-utils';
import { screen } from '@testing-library/react';
import { DialogLauncher } from './DialogLauncher';

describe('DialogLauncher', () => {
  const TestComponent: FC<{ greeting: string }> = ({ greeting }) => {
    return <Fragment>Hello {greeting}</Fragment>;
  };

  it('should render the component as dialog', async () => {
    const componentProps = { greeting: 'World' };
    await renderInTestApp(
      <DialogLauncher
        component={TestComponent}
        componentProps={componentProps}
        title="DialogLauncher Test"
        onClose={() => {}}
        open
      />,
    );

    expect(screen.getByText('DialogLauncher Test')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
