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
import { createPlugin } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

/**
 * Legacy plugin for the old frontend system
 * @deprecated Use the new frontend system plugin from '/alpha' instead
 * @public
 */
export const chatAssistantPlugin = createPlugin({
  id: 'agent-forge',
  routes: {
    root: rootRouteRef,
  },
});

/**
 * Legacy page component for the old frontend system
 * @deprecated Use AgentForgePage from the main export instead
 * @public
 */
export { default as ChatAssistantPage } from './components/ChatAssistantApp';
