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

import { renderHook } from '@testing-library/react';
import { useCustomProtocol } from './useCustomProtocol';
import { mockApis, TestApiProvider } from '@backstage/test-utils';
import { configApiRef } from '@backstage/core-plugin-api';

/** Produce an AppConfig wrapper for some given config */
const getMockAppConfig =
  (config: object) =>
  ({ children }: { children: React.ReactNode }) => {
    const mockConfig = mockApis.config({ data: config });
    return (
      <TestApiProvider apis={[[configApiRef, mockConfig]]}>
        {children}
      </TestApiProvider>
    );
  };

describe('useCustomProtocol', () => {
  it('should export hook', () => {
    expect(useCustomProtocol).toBeDefined();
  });

  it('should return original URL if no custom protocols are configured', () => {
    const { result } = renderHook(
      () => useCustomProtocol('https://example.com'),
      {
        wrapper: getMockAppConfig({}),
      },
    );
    expect(result.current).toEqual({
      src: 'https://example.com',
      href: 'https://example.com',
    });
  });

  it('should throw an error when the app-config is malformed', () => {
    const invalidAppConfigs = [
      { bookmarks: { customProtocols: 'invalid' } },
      { bookmarks: { customProtocols: { gdoc: 'invalid' } } },
      { bookmarks: { customProtocols: { gdoc: { iframeBaseUrl: 123 } } } },
      { bookmarks: { customProtocols: { gdoc: { linkBaseUrl: null } } } },
    ];

    // suppress console.error for this test to avoid noise
    for (const config of invalidAppConfigs) {
      /* eslint-disable no-console */
      const originalError = console.error;
      console.error = jest.fn();

      expect(() =>
        renderHook(() => useCustomProtocol('foo:bar'), {
          wrapper: getMockAppConfig(config),
        }),
      ).toThrow('Invalid bookmarks.customProtocols configuration!');

      expect(console.error).toHaveBeenCalled();

      console.error = originalError;
      /* eslint-enable no-console */
    }
  });

  it('should return transformed URLs for supported protocols', () => {
    const wrapper = getMockAppConfig({
      bookmarks: {
        customProtocols: {
          gdoc: {
            iframeBaseUrl: 'https://docs.google.com/document/d/%s/mobilebasic',
            linkBaseUrl: 'https://docs.google.com/document/d/%s/edit',
          },
          foo: {
            iframeBaseUrl: 'https://foo.example.com/view?doc=%s',
            linkBaseUrl: 'https://foo.example.com/edit?doc=%s',
          },
        },
      },
    });

    const { result: result1 } = renderHook(
      () => useCustomProtocol('gdoc:12345'),
      {
        wrapper,
      },
    );
    expect(result1.current).toEqual({
      src: 'https://docs.google.com/document/d/12345/mobilebasic',
      href: 'https://docs.google.com/document/d/12345/edit',
    });

    const { result: result2 } = renderHook(
      () => useCustomProtocol('foo:abcde'),
      {
        wrapper,
      },
    );
    expect(result2.current).toEqual({
      src: 'https://foo.example.com/view?doc=abcde',
      href: 'https://foo.example.com/edit?doc=abcde',
    });

    // not in the config, should return original URL
    const { result: result3 } = renderHook(
      () => useCustomProtocol('https://example.com'),
      {
        wrapper,
      },
    );
    expect(result3.current).toEqual({
      src: 'https://example.com',
      href: 'https://example.com',
    });
  });
});
