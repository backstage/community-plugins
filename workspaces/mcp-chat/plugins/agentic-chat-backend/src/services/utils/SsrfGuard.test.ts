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

import { isPrivateUrl } from './SsrfGuard';

describe('SsrfGuard', () => {
  describe('isPrivateUrl', () => {
    describe('public URLs', () => {
      it('returns null for https://example.com', () => {
        expect(isPrivateUrl('https://example.com')).toBeNull();
      });

      it('returns null for https://api.github.com/repos', () => {
        expect(isPrivateUrl('https://api.github.com/repos')).toBeNull();
      });

      it('returns null for other public domains', () => {
        expect(isPrivateUrl('https://www.google.com')).toBeNull();
        expect(isPrivateUrl('https://registry.npmjs.org')).toBeNull();
        expect(isPrivateUrl('http://example.org/path')).toBeNull();
      });
    });

    describe('localhost', () => {
      it('returns reason for http://localhost:8080', () => {
        expect(isPrivateUrl('http://localhost:8080')).toBe('localhost');
      });

      it('returns reason for http://127.0.0.1:3000', () => {
        expect(isPrivateUrl('http://127.0.0.1:3000')).toBe('loopback');
      });

      it('returns reason for https://localhost/', () => {
        expect(isPrivateUrl('https://localhost/')).toBe('localhost');
      });
    });

    describe('private IPs (RFC-1918)', () => {
      it('returns reason for 10.0.0.1', () => {
        expect(isPrivateUrl('http://10.0.0.1')).toBe('RFC-1918');
      });

      it('returns reason for 172.16.0.1', () => {
        expect(isPrivateUrl('http://172.16.0.1:8080')).toBe('RFC-1918');
      });

      it('returns reason for 172.31.255.255', () => {
        expect(isPrivateUrl('https://172.31.255.255')).toBe('RFC-1918');
      });

      it('returns reason for 192.168.1.1', () => {
        expect(isPrivateUrl('http://192.168.1.1')).toBe('RFC-1918');
      });

      it('returns reason for 192.168.0.0', () => {
        expect(isPrivateUrl('https://192.168.0.0')).toBe('RFC-1918');
      });
    });

    describe('link-local (169.254.x.x)', () => {
      it('returns reason for 169.254.1.1', () => {
        expect(isPrivateUrl('http://169.254.1.1')).toBe('link-local');
      });

      it('returns reason for 169.254.0.0', () => {
        expect(isPrivateUrl('https://169.254.0.0')).toBe('link-local');
      });
    });

    describe('cloud metadata endpoint (169.254.169.254)', () => {
      it('returns reason for 169.254.169.254 (matches link-local pattern first)', () => {
        // Implementation matches 169.254.* as link-local before cloud metadata check
        expect(isPrivateUrl('http://169.254.169.254/latest/meta-data/')).toBe(
          'link-local',
        );
      });
    });

    describe('IPv6 loopback', () => {
      it('returns reason for ::1', () => {
        expect(isPrivateUrl('http://[::1]:3000')).toBe('IPv6 loopback');
      });

      it('returns reason for ::1 without brackets in hostname extraction', () => {
        expect(isPrivateUrl('http://[::1]/')).toBe('IPv6 loopback');
      });
    });

    describe('blocked hostnames', () => {
      it('returns reason for metadata.google.internal', () => {
        expect(
          isPrivateUrl('http://metadata.google.internal/computeMetadata/v1/'),
        ).toBe('blocked host: metadata.google.internal');
      });

      it('returns reason for metadata.goog', () => {
        expect(isPrivateUrl('http://metadata.goog/')).toBe(
          'blocked host: metadata.goog',
        );
      });
    });

    describe('malformed URLs', () => {
      it('returns reason for invalid URL', () => {
        expect(isPrivateUrl('not-a-valid-url')).toBe('invalid URL');
      });

      it('returns reason for empty string', () => {
        expect(isPrivateUrl('')).toBe('invalid URL');
      });

      it('returns reason for URL with invalid characters', () => {
        expect(isPrivateUrl('http://[invalid')).toBe('invalid URL');
      });

      it('returns reason for URL with missing protocol', () => {
        expect(isPrivateUrl('://example.com')).toBe('invalid URL');
      });
    });

    describe('non-HTTP protocols', () => {
      it('returns null for ftp://example.com (hostname is public; protocol not checked)', () => {
        // SsrfGuard only checks hostname; ftp://example.com has public hostname
        expect(isPrivateUrl('ftp://example.com')).toBeNull();
      });

      it('returns null for file:///etc/passwd (empty hostname; protocol not checked)', () => {
        // file:///etc/passwd has empty hostname; implementation does not block by protocol
        expect(isPrivateUrl('file:///etc/passwd')).toBeNull();
      });
    });

    describe('IPv4-mapped IPv6', () => {
      it('returns reason for ::ffff:127.0.0.1', () => {
        expect(isPrivateUrl('http://[::ffff:127.0.0.1]')).toBe(
          'IPv4-mapped IPv6',
        );
      });

      it('returns reason for ::ffff:10.0.0.1', () => {
        expect(isPrivateUrl('http://[::ffff:10.0.0.1]')).toBe(
          'IPv4-mapped IPv6',
        );
      });

      it('returns reason for ::ffff:192.168.1.1', () => {
        expect(isPrivateUrl('http://[::ffff:192.168.1.1]')).toBe(
          'IPv4-mapped IPv6',
        );
      });
    });

    describe('unspecified and IPv6 ULA/link-local', () => {
      it('returns reason for 0.0.0.0', () => {
        expect(isPrivateUrl('http://0.0.0.0')).toBe('unspecified');
      });

      it('returns reason for IPv6 ULA (fc00::)', () => {
        expect(isPrivateUrl('http://[fc00::1]')).toBe('IPv6 ULA');
      });

      it('returns reason for IPv6 link-local (fe80::)', () => {
        expect(isPrivateUrl('http://[fe80::1]')).toBe('IPv6 link-local');
      });
    });
  });
});
