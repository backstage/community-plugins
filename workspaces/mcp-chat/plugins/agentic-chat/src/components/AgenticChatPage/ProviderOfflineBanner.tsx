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

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

export interface ProviderOfflineBannerProps {
  /** Whether the AI provider is offline or unreachable */
  show: boolean;
  /** Whether a conversation is currently loading (affects top offset for LinearProgress) */
  loadingConversation: boolean;
  /** Whether the status poll failed (different message for connection vs model unreachable) */
  statusPollError: boolean;
  /** App name for the error message */
  appName: string;
}

/**
 * Banner shown when the AI provider is offline or unreachable.
 * Positioned at the top of the chat area to warn users before they send a message.
 */
export function ProviderOfflineBanner({
  show,
  loadingConversation,
  statusPollError,
  appName,
}: ProviderOfflineBannerProps) {
  if (!show) return null;

  return (
    <Alert
      severity="warning"
      variant="standard"
      sx={{
        position: 'absolute',
        top: loadingConversation ? 2 : 0,
        left: 0,
        right: 0,
        zIndex: 11,
        borderRadius: 0,
      }}
    >
      <AlertTitle>AI Provider Unavailable</AlertTitle>
      {statusPollError
        ? `Unable to reach ${appName} backend. Messages may fail until the connection is restored.`
        : `The AI model is currently unreachable. Messages may fail until the connection is restored.`}
    </Alert>
  );
}
