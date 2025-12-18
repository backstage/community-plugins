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
import { render } from '@testing-library/react';

import { workloadNodeData } from '../../../../__fixtures__/workloadNodeData';
import { mockUseTranslation } from '../../../../test-utils/mockTranslations';
import { RouteData } from '../../../../types/route';
import RouteListSidebar from './RouteListSidebar';

jest.mock('../../../../hooks/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

describe('RouteListSidebar', () => {
  it('should render host URL, Route if exists', () => {
    const { queryByText } = render(
      <RouteListSidebar
        routesData={workloadNodeData.data.data.routesData as RouteData[]}
      />,
    );
    expect(queryByText(/hello-minikube2/i)).toBeInTheDocument();
    expect(
      queryByText(
        /nodejs-ex-git-jai-test.apps.viraj-22-05-2023-0.devcluster.openshift.com/,
      ),
    ).toBeInTheDocument();
  });

  it('should not render host URL if does not exists', () => {
    const { queryByText, getByText } = render(
      <RouteListSidebar routesData={[] as RouteData[]} />,
    );
    getByText(/No Routes found for this resource./i);
    expect(queryByText(/hello-minikube2/i)).not.toBeInTheDocument();
    expect(
      queryByText(
        /nodejs-ex-git-jai-test.apps.viraj-22-05-2023-0.devcluster.openshift.com/,
      ),
    ).not.toBeInTheDocument();
  });
});
