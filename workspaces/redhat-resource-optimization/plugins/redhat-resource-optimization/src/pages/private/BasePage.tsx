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
