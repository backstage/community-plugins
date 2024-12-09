import React from 'react';

import { CodeSnippet, WarningPanel } from '@backstage/core-components';

type ErrorReportProps = {
  title: string;
  errorText: string;
};

export const ErrorReport = ({ title, errorText }: ErrorReportProps) => (
  <WarningPanel severity="error" title={title}>
    <CodeSnippet language="text" text={errorText} />
  </WarningPanel>
);
