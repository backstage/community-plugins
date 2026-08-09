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

import { ConfigReader } from '@backstage/config';
import { readAnnotateScmSlugProcessorConfig } from './config';

describe('readAnnotateScmSlugProcessorConfig', () => {
  it('returns undefined kinds when config is not set', () => {
    expect(readAnnotateScmSlugProcessorConfig(new ConfigReader({}))).toEqual({
      kinds: undefined,
    });
  });

  it('reads kinds from config', () => {
    const config = new ConfigReader({
      catalog: {
        processors: {
          annotateScmSlug: {
            kinds: ['API', 'Component', 'Resource', 'System'],
          },
        },
      },
    });

    expect(readAnnotateScmSlugProcessorConfig(config)).toEqual({
      kinds: ['API', 'Component', 'Resource', 'System'],
    });
  });
});
