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
import { renderInTestApp } from '@backstage/test-utils';

import { QuayRepository } from './QuayRepository';
import { QuayTagPage } from './QuayTagPage';
import { Router } from './Router';

jest.mock('./QuayRepository', () => ({
  QuayRepository: jest.fn(() => null),
}));

jest.mock('./QuayTagPage', () => ({
  QuayTagPage: jest.fn(() => null),
}));

describe('Router', () => {
  beforeEach(() => {
    (QuayRepository as jest.Mock).mockClear();
    (QuayTagPage as jest.Mock).mockClear();
  });
  describe('/', () => {
    it('should render the QuayRepository', async () => {
      await renderInTestApp(<Router />);
      expect(QuayRepository).toHaveBeenCalled();
    });
  });

  describe('/tag/:digestId', () => {
    it('should render the QuayTagPage page', async () => {
      await renderInTestApp(<Router />, {
        routeEntries: ['/tag/my-digest'],
      });
      expect(QuayTagPage).toHaveBeenCalled();
    });
  });
});
