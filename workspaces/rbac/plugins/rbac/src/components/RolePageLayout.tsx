/*
 * Copyright 2026 The Backstage Authors
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
import { ReactNode } from 'react';

import { Header as LegacyHeader, Page } from '@backstage/core-components';
import { Header } from '@backstage/ui';

export type HeaderVariant = 'legacy' | 'bui';

export const RolePageLayout = ({
  headerVariant,
  title,
  children,
}: {
  headerVariant: HeaderVariant;
  title: string;
  children: ReactNode;
}) => {
  if (headerVariant === 'bui') {
    return (
      <>
        <Header title={title} />
        {children}
      </>
    );
  }

  return (
    <Page themeId="tool">
      <LegacyHeader title={title} type="RBAC" typeLink=".." />
      {children}
    </Page>
  );
};
