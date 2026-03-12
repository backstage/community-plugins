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
import React from 'react';
// eslint-disable-next-line @backstage/no-undeclared-imports
import { TestApiProvider } from '@backstage/test-utils';
import { agenticChatApiRef } from '../api';
import type { AgenticChatApi } from '../api';

export function createApiTestWrapper(api: Partial<AgenticChatApi>) {
  return ({ children }: { children: React.ReactNode }) => (
    <TestApiProvider apis={[[agenticChatApiRef, api as AgenticChatApi]]}>
      {children}
    </TestApiProvider>
  );
}
