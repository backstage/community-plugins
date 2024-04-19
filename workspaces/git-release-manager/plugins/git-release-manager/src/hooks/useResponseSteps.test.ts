/*
 * Copyright 2021 The Backstage Authors
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

import { renderHook, act } from '@testing-library/react';

import { useResponseSteps } from './useResponseSteps';

describe('useResponseSteps', () => {
  it('should export expected variables', () => {
    const { result } = renderHook(() => useResponseSteps());

    expect(result.current).toMatchInlineSnapshot(`
      {
        "abortIfError": [Function],
        "addStepToResponseSteps": [Function],
        "asyncCatcher": [Function],
        "responseSteps": [],
      }
    `);
  });

  describe('addStepToResponseSteps', () => {
    it('should add responseSteps to state', async () => {
      const { result } = renderHook(() => useResponseSteps());

      expect(result.current.responseSteps).toMatchInlineSnapshot(`[]`);

      act(() => {
        result.current.addStepToResponseSteps({
          message: 'totally added a messaage ✌🏼',
        });
      });

      expect(result.current.responseSteps).toMatchInlineSnapshot(`
        [
          {
            "message": "totally added a messaage ✌🏼",
          },
        ]
      `);
    });
  });

  describe('asyncCatcher', () => {
    it('should catch Errors and add as failure step, then throw', async () => {
      const { result } = renderHook(() => useResponseSteps());

      expect(result.current.responseSteps).toMatchInlineSnapshot(`[]`);

      await act(async () => {
        await new Promise((_, reject) => reject(new Error(':(')))
          .catch(result.current.asyncCatcher)
          .catch(
            () => void 0, // swallow
          );
      });

      expect(result.current.responseSteps).toMatchInlineSnapshot(`
        [
          {
            "icon": "failure",
            "message": <b>
              Something went wrong
               
              <WithStyles(ForwardRef(Typography))
                aria-label="fire"
                component="span"
                role="img"
              >
                🔥
              </WithStyles(ForwardRef(Typography))>
            </b>,
            "secondaryMessage": "Error message: :(",
          },
        ]
      `);
    });

    it('should catch unknown Errors and add as failure step, then throw', async () => {
      const { result } = renderHook(() => useResponseSteps());

      expect(result.current.responseSteps).toMatchInlineSnapshot(`[]`);

      await act(async () => {
        await new Promise((_, reject) => reject())
          .catch(result.current.asyncCatcher)
          .catch(
            () => void 0, // swallow
          );
      });

      expect(result.current.responseSteps).toMatchInlineSnapshot(`
        [
          {
            "icon": "failure",
            "message": <b>
              Something went wrong
               
              <WithStyles(ForwardRef(Typography))
                aria-label="fire"
                component="span"
                role="img"
              >
                🔥
              </WithStyles(ForwardRef(Typography))>
            </b>,
            "secondaryMessage": "Error message: unknown",
          },
        ]
      `);
    });
  });

  describe('abortIfError', () => {
    it('should do nothing if not Error', async () => {
      const { result } = renderHook(() => useResponseSteps());

      expect(result.current.responseSteps).toMatchInlineSnapshot(`[]`);

      act(() => {
        result.current.abortIfError(undefined);
      });

      expect(result.current.responseSteps).toMatchInlineSnapshot(`[]`);
    });
  });
});
