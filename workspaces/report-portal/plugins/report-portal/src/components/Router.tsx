import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { launchRouteRef, projectsRouteRef } from '../routes';
import { LaunchesPage } from './LaunchesPage';
import { ProjectsPage } from './ProjectsPage';
import {
  ReportPortalGlobalPage,
  ReportPortalGlobalPageProps,
} from './ReportPortalGlobalPage';

export const Router = (props: ReportPortalGlobalPageProps) => {
  return (
    <Routes>
      <Route path="/*" element={<ReportPortalGlobalPage {...props} />} />
      <Route
        path={projectsRouteRef.path}
        element={<ProjectsPage themeId={props.theme} />}
      />
      <Route
        path={launchRouteRef.path}
        element={<LaunchesPage themeId={props.theme} />}
      />
    </Routes>
  );
};
