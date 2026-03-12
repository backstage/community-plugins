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

import type { StreamingEvent, StreamingEventCallback } from '../types';
import { debugError } from '../utils';

/**
 * Parse SSE events from a ReadableStream and invoke the callback for each event.
 * Handles line buffering, "data: " prefix, [DONE] sentinel, and JSON parsing.
 *
 * @param reader - The stream reader (from response.body.getReader())
 * @param onEvent - Callback for each parsed streaming event
 * @param signal - Optional AbortSignal for cancellation
 */
export async function parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onEvent: StreamingEventCallback,
  signal?: AbortSignal,
): Promise<void> {
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    let reading = true;
    while (reading) {
      if (signal?.aborted) {
        await reader.cancel();
        break;
      }

      const { done, value } = await reader.read();
      if (done) {
        reading = false;
        continue;
      }

      if (signal?.aborted) {
        await reader.cancel();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (signal?.aborted) break;
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data && data !== '[DONE]') {
            try {
              const event: StreamingEvent = JSON.parse(data);
              onEvent(event);
            } catch (parseErr) {
              debugError('Malformed SSE event:', parseErr, data.slice(0, 120));
            }
          }
        }
      }
    }

    if (!signal?.aborted && buffer.startsWith('data: ')) {
      const data = buffer.slice(6).trim();
      if (data && data !== '[DONE]') {
        try {
          const event: StreamingEvent = JSON.parse(data);
          onEvent(event);
        } catch (parseErr) {
          debugError(
            'Malformed SSE event (buffer tail):',
            parseErr,
            data.slice(0, 120),
          );
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
