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

import {
  ConfluenceCollatorDocumentTransformer,
  IndexableConfluenceDocument,
} from './ConfluenceCollatorFactory';
import { ConfluenceDocument } from '../client';

/**
 * Default document transformer. Returns an empty object by default.
 *
 * This is provided as a reference and easy starting point for customization.
 * Future format changes may be accommodated by evolving this API.
 * @alpha
 */
export const defaultConfluenceCollatorDocumentTransformer: ConfluenceCollatorDocumentTransformer =
  (_doc: IndexableConfluenceDocument, _raw: ConfluenceDocument) => ({});
