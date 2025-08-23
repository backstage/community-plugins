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
import { render } from '@testing-library/react';

import { AZURE_CONTAINER_REGISTRY_ANNOTATION_IMAGE_NAME } from '../../annotations';
import { AcrImagesEntityContent } from './AcrImagesEntityContent';

// TODO use backstage catalog test-utils
jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: jest.fn().mockReturnValue({
    entity: {
      metadata: {
        annotations: {
          [AZURE_CONTAINER_REGISTRY_ANNOTATION_IMAGE_NAME]: 'sample/node',
        },
      },
    },
  }),
}));

jest.mock('../AcrImages', () => ({
  AcrImages: () => <div data-testid="acr-registry">acr registry</div>,
}));

describe('AcrImagesEntityContent', () => {
  it('should render AcrImages', () => {
    const { queryByTestId } = render(<AcrImagesEntityContent />);
    expect(queryByTestId('acr-registry')).toBeInTheDocument();
  });
});
