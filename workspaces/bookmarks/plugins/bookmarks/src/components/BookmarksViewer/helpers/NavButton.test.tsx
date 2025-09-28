/*
 * Copyright 2025 The Backstage Authors
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
import { screen, fireEvent } from '@testing-library/react';
import { NavButton } from './NavButton';
import { PATH_SEPARATOR } from '../../../consts/consts';

const TREE_KEY = ['foo', 'bar'].join(PATH_SEPARATOR);

describe('NavButton', () => {
  it('renders next button with correct treeKey', async () => {
    const handleClick = jest.fn();
    await renderInTestApp(
      <NavButton direction="next" onClick={handleClick} treeKey={TREE_KEY} />,
    );
    expect(
      screen.getByText('bookmarkViewer.navButton.next'),
    ).toBeInTheDocument();
    expect(screen.getByText('bar')).toBeInTheDocument();
  });

  it('renders previous button with correct treeKey', async () => {
    const handleClick = jest.fn();
    await renderInTestApp(
      <NavButton
        direction="previous"
        onClick={handleClick}
        treeKey={TREE_KEY}
      />,
    );
    expect(
      screen.getByText('bookmarkViewer.navButton.previous'),
    ).toBeInTheDocument();
    expect(screen.getByText('bar')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    await renderInTestApp(
      <NavButton direction="next" onClick={handleClick} treeKey={TREE_KEY} />,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
