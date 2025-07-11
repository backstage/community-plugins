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

import { renderInTestApp } from '@backstage/test-utils';
import { GraphiQLBrowser } from './GraphiQLBrowser';
import { GraphiQLIcon } from '../../GraphiQLIcon';
import userEvent from '@testing-library/user-event';

describe('GraphiQLBrowser', () => {
  it('should render error text if there are no endpoints', async () => {
    const rendered = await renderInTestApp(<GraphiQLBrowser endpoints={[]} />);
    rendered.getByText('No endpoints available');
  });

  it('should render endpoint tabs', async () => {
    const rendered = await renderInTestApp(
      <GraphiQLBrowser
        endpoints={[
          {
            id: 'a',
            title: 'Endpoint A',
            async fetcher() {},
          },
          {
            id: 'b',
            title: 'Endpoint B',
            async fetcher() {},
          },
        ]}
      />,
    );
    rendered.getByText('Endpoint A');
    rendered.getByText('Endpoint B');
    expect(rendered.getByTestId('graphiql-container')).not.toBeNull();
  });

  it('should render plugins', async () => {
    const rendered = await renderInTestApp(
      <GraphiQLBrowser
        endpoints={[
          {
            id: 'a',
            title: 'Endpoint A',
            async fetcher() {},
            plugins: [
              {
                content: () => <div>Hello from My plugin</div>,
                icon: GraphiQLIcon,
                title: 'My plugin',
              },
            ],
          },
        ]}
      />,
    );

    await userEvent.click(
      rendered.getByRole('button', { name: 'Show My plugin' }),
    );

    expect(rendered.getByText('Hello from My plugin')).toBeVisible();
  });
});
