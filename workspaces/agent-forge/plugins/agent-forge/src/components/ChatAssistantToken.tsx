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
import React, { useState, useEffect } from 'react';
import useStyles from './useStyles';

function ChatAssistantToken() {
  const styles = useStyles();
  const [message, setMessage] = useState('');

  const identityApi = useApi(identityApiRef);
  async function getMessage() {
    const { token } = await identityApi.getCredentials();
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const cb = urlParams.get('cb');
    if (urlParams.has('dt')) {
      setMessage(token!);
    }
    if (cb) {
      try {
        const response = await fetch(cb, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });
        if (!response.ok) {
          setMessage(`Failed to post token to callback URL: ${cb}`);
          return;
        }
        setMessage('Success! You may close this window.');
      } catch (error) {
        setMessage(
          `Failed to post token to callback URL:${cb} err:${error} redirecting...`,
        );
        // Redirect to callback URL with token as query parameter.
        window.location.href = `${cb}?token=${token}`;
        // Another possible workaround.
        // <form action={cb} method="POST">
        //     <input type="hidden" name="token" value={token} />
        //     <button type="submit">Submit</button>
        //     </form>
      }
    }
  }
  useEffect(() => {
    getMessage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <div className={styles.todayLine}>{message}</div>;
}

export default ChatAssistantToken;
