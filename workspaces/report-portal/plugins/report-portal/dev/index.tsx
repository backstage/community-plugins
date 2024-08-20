import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { reportPortalPlugin, ReportPortalGlobalPage } from '../src/plugin';

createDevApp()
  .registerPlugin(reportPortalPlugin)
  .addPage({
    element: <ReportPortalGlobalPage />,
    title: 'Root Page',
    path: '/report-portal',
  })
  .render();
