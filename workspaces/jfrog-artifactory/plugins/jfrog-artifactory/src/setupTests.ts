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

// The dom import here is technically not required but it's required at runtime
// but only a peer dependency of the other testing library packages.
// Without this knip-report would report this as an unused dependency...
// eslint-disable-next-line testing-library/no-dom-import
import '@testing-library/dom';
import '@testing-library/jest-dom';
import 'cross-fetch/polyfill';
