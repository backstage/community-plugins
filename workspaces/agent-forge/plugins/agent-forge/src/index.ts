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

// Legacy exports for backward compatibility
export { default as ChatAssistantPage } from './components/ChatAssistantApp';
export { default as ChatAssistantApp } from './components/ChatAssistantApp';
export { default as ChatAssistantToken } from './components/ChatAssistantToken';
export { chatAssistantPlugin } from './plugin';

// New native page component
export { default as AgentForgePage } from './components/AgentForgePage';
export {
  ChatContainer,
  type ChatContainerProps,
} from './components/ChatContainer';
export { ChatMessage, type ChatMessageProps } from './components/ChatMessage';
export { PageHeader } from './components/PageHeader';

// Export types that are referenced by public APIs
export type { Message } from './types';
export type { PageHeaderProps } from './components/PageHeader';

// New frontend system exports
export { default } from './alpha';
