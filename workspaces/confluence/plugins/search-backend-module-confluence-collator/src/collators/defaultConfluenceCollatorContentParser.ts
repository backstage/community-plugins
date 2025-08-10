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

import { ConfluenceCollatorContentParser } from './ConfluenceCollatorFactory';
import { ConfluenceDocument } from '../client';

/**
 * Default content parser that converts Confluence storage content to plaintext.
 *
 * Note: This targets the current XML/HTML storage format. Response formats may
 * evolve; this API may be extended in the future to ease migration without
 * breaking existing implementations.
 * @alpha
 */
export const defaultConfluenceCollatorContentParser: ConfluenceCollatorContentParser =
  (document: ConfluenceDocument): string => {
    const storage = document?.body?.storage?.value ?? '';
    return stripHtml(storage);
  };

function stripHtml(input: string): string {
  return input.replace(/(<([^>]+)>)/gi, '');
}
