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
import { RevisionInfo } from '@backstage-community/plugin-redhat-argocd-common';

export const mockRevision: RevisionInfo = {
  author: 'author-name',
  date: new Date('2023-10-10T05:28:38Z'),
  message: 'First release',
  revisionID: '90f9758b7033a4bbb7c33a35ee474d61091644bc',
};

export const mockRevisionTwo = {
  author: 'author-name',
  date: '2023-10-11T05:28:38Z',
  message: 'Commit v1.0.0 tag release',
};

export const mockRevisionThree = {
  author: 'author-name',
  date: '2023-10-13T05:28:38Z',
  message: 'Initial commit',
};

export const mockRevisions = [mockRevision, mockRevisionTwo, mockRevisionThree];
