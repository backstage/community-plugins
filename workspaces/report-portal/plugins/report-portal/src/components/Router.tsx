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
