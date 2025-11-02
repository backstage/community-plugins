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

import { useApi, configApiRef } from '@backstage/core-plugin-api';

export type UseCustomProtocolResult = {
  /** The URL to be used in an iframe src attribute */
  src: string;
  /** The URL to be used in an anchor href attribute */
  href: string;
};

/** The schema of `bookmarks.customProtocols` config */
export type CustomProtocolConfig = {
  /** The custom protocol to match, e.g. "myapp" for "myapp://some/path" */
  [protocol: string]: {
    /**
     * The base URL to use for iframe src with %s replaced by the encoded original URL,
     * e.g. "https://myapp-iframe-host.com/iframe?url=%s"
     */
    iframeBaseUrl: string;
    /**
     * The base URL to use for anchor href with %s replaced by the encoded original URL,
     * e.g. "https://myapp-web-host.com/open?url=%s"
     */
    linkBaseUrl: string;
  };
};

/** Validates if the given config matches the CustomProtocolConfig schema */
const validateCustomProtocolConfig = (
  config: unknown,
): config is CustomProtocolConfig => {
  if (typeof config !== 'object' || config === null) {
    return false;
  }

  for (const [protocol, urls] of Object.entries(config)) {
    if (
      typeof protocol !== 'string' ||
      typeof urls !== 'object' ||
      urls === null
    ) {
      return false;
    }
    if (
      typeof urls?.iframeBaseUrl !== 'string' ||
      typeof urls?.linkBaseUrl !== 'string'
    ) {
      return false;
    }
  }

  return true;
};

/**
 * A hook that transforms a custom protocol URL to a safe URL for iframe and anchor usage.
 */
export const useCustomProtocol = (url: string): UseCustomProtocolResult => {
  const customProtocols = useApi(
    configApiRef,
  ).getOptional<CustomProtocolConfig>('bookmarks.customProtocols');

  if (!customProtocols) {
    return { src: url, href: url };
  } else if (!validateCustomProtocolConfig(customProtocols)) {
    throw new Error('Invalid bookmarks.customProtocols configuration!');
  }

  const protocol = new URL(url).protocol.replace(':', '');
  const urlContent = url.slice(protocol.length + 1);

  if (Object.keys(customProtocols).includes(protocol)) {
    const { iframeBaseUrl, linkBaseUrl } = customProtocols[protocol];

    const encodedUrl = encodeURIComponent(urlContent);
    return {
      src: iframeBaseUrl.replace('%s', encodedUrl),
      href: linkBaseUrl.replace('%s', encodedUrl),
    };
  }

  // Fallback to the original URL if no custom protocol is matched
  return { src: url, href: url };
};
