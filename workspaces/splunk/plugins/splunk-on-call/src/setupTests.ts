/*
 * Copyright 2020 The Backstage Authors
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

import '@testing-library/jest-dom';

// Suppress JSDOM CSS parsing errors for unsupported CSS features like @layer
if (typeof window !== 'undefined') {
  // Mock VirtualConsole to suppress CSS parsing errors
  // eslint-disable-next-line no-console
  const originalError = console.error;
  // eslint-disable-next-line no-console
  console.error = (...args: any[]) => {
    const errorMsg = args[0];

    // Suppress CSS parsing errors (JSDOM doesn't support @layer)
    if (
      errorMsg instanceof Error &&
      errorMsg.message?.includes('Could not parse CSS stylesheet')
    ) {
      return;
    }

    // Also check if first argument is an error with 'detail' property containing CSS
    if (errorMsg?.detail?.includes('@layer')) {
      return;
    }

    originalError(...args);
  };
}
