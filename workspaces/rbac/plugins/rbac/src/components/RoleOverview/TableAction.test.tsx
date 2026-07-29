/*
 * Copyright 2026 The Backstage Authors
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
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderInTestApp } from '@backstage/test-utils';

import { TableAction } from './TableAction';

describe('TableAction', () => {
  it('renders nothing when action is hidden', async () => {
    const { container } = await renderInTestApp(
      <TableAction action={{ hidden: true, icon: () => <span>icon</span> }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when action is undefined', async () => {
    const { container } = await renderInTestApp(
      <TableAction action={undefined as any} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders an IconButton with tooltip and correct aria-label', async () => {
    await renderInTestApp(
      <TableAction
        action={{
          icon: () => <span data-testid="test-icon">icon</span>,
          tooltip: 'Refresh',
          onClick: jest.fn(),
        }}
      />,
    );

    const button = screen.getByRole('button', { name: 'Refresh' });
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('uses translated fallback aria-label when tooltip is missing', async () => {
    await renderInTestApp(
      <TableAction
        action={{
          icon: () => <span>icon</span>,
          onClick: jest.fn(),
        }}
      />,
    );

    const button = screen.getByRole('button', { name: 'Table action' });
    expect(button).toBeInTheDocument();
  });

  it('renders customComponent directly without wrapping IconButton', async () => {
    await renderInTestApp(
      <TableAction
        action={{
          icon: () => (
            <button type="button" data-testid="custom-btn">
              Custom
            </button>
          ),
          customComponent: true,
          onClick: jest.fn(),
        }}
      />,
    );

    expect(screen.getByTestId('custom-btn')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Table action' })).toBeNull();
  });

  it('calls onClick when button is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    await renderInTestApp(
      <TableAction
        action={{
          icon: () => <span>icon</span>,
          tooltip: 'Click me',
          onClick: handleClick,
        }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Click me' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders a disabled button when action.disabled is true', async () => {
    await renderInTestApp(
      <TableAction
        action={{
          icon: () => <span>icon</span>,
          tooltip: 'Disabled action',
          disabled: true,
          onClick: jest.fn(),
        }}
      />,
    );

    const button = screen.getByRole('button', { name: 'Disabled action' });
    expect(button).toBeDisabled();
  });

  it('resolves function-style actions', async () => {
    const actionFn = () => ({
      icon: () => <span data-testid="fn-icon">icon</span>,
      tooltip: 'From function',
      onClick: jest.fn(),
    });

    await renderInTestApp(<TableAction action={actionFn} />);

    expect(
      screen.getByRole('button', { name: 'From function' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('fn-icon')).toBeInTheDocument();
  });

  it('resolves nested action.action functions', async () => {
    const action = {
      action: () => ({
        icon: () => <span data-testid="nested-icon">icon</span>,
        tooltip: 'Nested action',
        onClick: jest.fn(),
      }),
    };

    await renderInTestApp(<TableAction action={action as any} />);

    expect(
      screen.getByRole('button', { name: 'Nested action' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('nested-icon')).toBeInTheDocument();
  });

  it('renders button without tooltip wrapper when no tooltip is provided', async () => {
    const { container } = await renderInTestApp(
      <TableAction
        action={{
          icon: () => <span>icon</span>,
          onClick: jest.fn(),
        }}
      />,
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(container.querySelector('[role="tooltip"]')).toBeNull();
  });
});
