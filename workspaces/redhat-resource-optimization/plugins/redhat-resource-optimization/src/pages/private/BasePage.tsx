/*
 * Copyright 2024 The Backstage Authors
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
import React, { PropsWithChildren } from 'react';
import {
  PageWithHeader,
  Content,
  ContentHeader,
  SupportButton,
} from '@backstage/core-components';

/** @public */
export function BasePage(
  props: PropsWithChildren<{
    pageThemeId?: string;
    pageTitle: string;
    pageType?: string;
    pageTypeLink?: string;
    contentHeaderTitle?: string;
    showSupportButton?: boolean;
    showContentHeader?: boolean;
  }>,
) {
  const {
    children,
    contentHeaderTitle = '',
    pageThemeId = 'tool',
    pageTitle,
    pageType,
    pageTypeLink,
    showContentHeader = false,
    showSupportButton = false,
  } = props;

  return (
    <PageWithHeader
      title={pageTitle}
      type={pageType}
      typeLink={pageTypeLink}
      themeId={pageThemeId}
    >
      <Content>
        {showContentHeader && (
          <ContentHeader title={contentHeaderTitle}>
            {showSupportButton && <SupportButton>Support</SupportButton>}
          </ContentHeader>
        )}
        {children}
      </Content>
    </PageWithHeader>
  );
}
