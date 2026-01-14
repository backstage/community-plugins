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
import { render, screen } from '@testing-library/react';

import Metadata from '../Metadata';
import MetadataItem from '../MetadataItem';

describe('Metadata', () => {
  test('should  render Metadata and MetadataItem', () => {
    render(
      <Metadata data-testid="metadata">
        <MetadataItem data-testid="metadata-item" title="One">
          Item 1
        </MetadataItem>
      </Metadata>,
    );
    expect(screen.queryByTestId('metadata')).toBeInTheDocument();
    expect(screen.queryByTestId('metadata-item')).toBeInTheDocument();
  });
});
