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
import { parseJsonRpcFromResponse } from './http';

describe('parseJsonRpcFromResponse', () => {
  it('parses plain JSON response', () => {
    const input = '{"jsonrpc":"2.0","result":{"tools":[]},"id":3}';
    const result = parseJsonRpcFromResponse(input);
    expect(result).toEqual({
      jsonrpc: '2.0',
      result: { tools: [] },
      id: 3,
    });
  });

  it('parses SSE response with event: message prefix', () => {
    const input = [
      'event: message',
      'data: {"jsonrpc":"2.0","result":{"tools":[{"name":"greet"}]},"id":3}',
      '',
    ].join('\n');
    const result = parseJsonRpcFromResponse(input) as {
      jsonrpc: string;
      result?: { tools?: Array<{ name: string }> };
    };
    expect(result.jsonrpc).toBe('2.0');
    expect(result.result?.tools).toEqual([{ name: 'greet' }]);
  });

  it('parses SSE response without trailing newline', () => {
    const input = [
      'event: message',
      'data: {"jsonrpc":"2.0","result":{"protocolVersion":"2024-11-05"},"id":1}',
    ].join('\n');
    const result = parseJsonRpcFromResponse(input) as {
      result?: { protocolVersion?: string };
    };
    expect(result.result?.protocolVersion).toBe('2024-11-05');
  });

  it('handles multiple SSE events and returns first valid one', () => {
    const input = [
      'event: message',
      'data: {"jsonrpc":"2.0","result":{"first":true},"id":1}',
      '',
      'event: message',
      'data: {"jsonrpc":"2.0","result":{"second":true},"id":2}',
      '',
    ].join('\n');
    const result = parseJsonRpcFromResponse(input) as {
      result?: { first?: boolean };
    };
    expect(result.result?.first).toBe(true);
  });

  it('handles whitespace-padded JSON', () => {
    const input = '  {"jsonrpc":"2.0","id":1}  ';
    const result = parseJsonRpcFromResponse(input);
    expect(result).toEqual({ jsonrpc: '2.0', id: 1 });
  });

  it('returns null for empty input', () => {
    expect(parseJsonRpcFromResponse('')).toBeNull();
    expect(parseJsonRpcFromResponse('  ')).toBeNull();
  });

  it('returns null for completely invalid input', () => {
    expect(parseJsonRpcFromResponse('not json at all')).toBeNull();
  });

  it('handles SSE with data-only lines (no event: prefix)', () => {
    const input = 'data: {"jsonrpc":"2.0","id":1}\n\n';
    const result = parseJsonRpcFromResponse(input);
    expect(result).toEqual({ jsonrpc: '2.0', id: 1 });
  });
});
