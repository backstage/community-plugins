/*
 * Copyright 2020 The Backstage Authors
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

import { Link } from '@backstage/core-components';
import React from 'react';

type WithLinkProps = {
  url?: string;
  className: string;
  children: React.ReactNode;
};

export function isValidUrl(url: string | undefined): url is string {
  return Boolean(url && url !== '#' && url.length > 0);
}

export const WithLink = ({
  url,
  className,
  children,
}: WithLinkProps): JSX.Element =>
  isValidUrl(url) ? (
    <Link className={className} to={url}>
      {children}
    </Link>
  ) : (
    <>{children}</>
  );
