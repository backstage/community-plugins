import React, { PropsWithChildren } from 'react';

import { Content, Header, Page } from '@backstage/core-components';

export interface BaseOrchestratorProps {
  title?: string;
  subtitle?: string;
  type?: string;
  typeLink?: string;
  noPadding?: boolean;
}

export const BaseOrchestratorPage = ({
  title,
  subtitle,
  type,
  typeLink,
  noPadding,
  children,
}: PropsWithChildren<BaseOrchestratorProps>) => {
  return (
    <Page themeId="tool">
      <Header
        title={title}
        subtitle={subtitle}
        type={type}
        typeLink={typeLink}
      />
      <Content noPadding={noPadding}>{children}</Content>
    </Page>
  );
};
