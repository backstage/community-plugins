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

import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for handling token authentication with external systems
 * @public
 */
export function useTokenAuthentication() {
  const [message, setMessage] = useState('');
  const [isTokenRequest, setIsTokenRequest] = useState(false);
  const identityApi = useApi(identityApiRef);

  const handleTokenAuthentication = useCallback(async () => {
    try {
      const { token } = await identityApi.getCredentials();
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const cb = urlParams.get('cb');

      if (urlParams.has('dt')) {
        setMessage(token!);
        setIsTokenRequest(true);
        return;
      }

      if (cb) {
        setIsTokenRequest(true);
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 300000); // 300 seconds timeout

          const response = await fetch(cb, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          if (!response.ok) {
            setMessage(`Failed to post token to callback URL: ${cb}`);
            return;
          }
          setMessage('Success! You may close this window.');
        } catch (error: any) {
          if (error.name === 'AbortError') {
            setMessage(`Request timeout after 300 seconds`);
            return;
          }
          setMessage(
            `Failed to post token to callback URL: ${cb} err: ${error} redirecting...`,
          );
          // Redirect to callback URL with token as query parameter
          window.location.href = `${cb}?token=${token}`;
        }
      }
    } catch (error) {
      setMessage(`Failed to get authentication token: ${error}`);
      setIsTokenRequest(true);
    }
  }, [identityApi]);

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if (urlParams.has('dt') || urlParams.has('cb')) {
      handleTokenAuthentication();
    }
  }, [handleTokenAuthentication]);

  return {
    tokenMessage: message,
    isTokenRequest,
    handleTokenAuthentication,
  };
}

/**
 * Legacy component for token authentication display
 * @deprecated Use useTokenAuthentication hook instead
 * @public
 */
function ChatAssistantToken() {
  const { tokenMessage } = useTokenAuthentication();
  return <div>{tokenMessage}</div>;
}

/** @public */
export default ChatAssistantToken;
