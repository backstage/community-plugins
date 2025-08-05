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
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DataFilterComponent } from './DataFilterComponent';

describe('DataFilterComponent', () => {
  test('displays loading state initially', () => {
    const setFilters = jest.fn();
    (setFilters as jest.Mock).mockReturnValue({});
    render(<DataFilterComponent setFilters={setFilters} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entity/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /attribute/i }),
    ).toBeInTheDocument();
  });
});
