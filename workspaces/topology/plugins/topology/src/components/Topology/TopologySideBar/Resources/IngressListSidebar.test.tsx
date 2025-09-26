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
import { IngressData } from '../../../../types/ingresses';
import IngressListSidebar from './IngressListSidebar';

jest.mock('../../../../hooks/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

describe('IngressListSidebar', () => {
  it('should render ingress if exists', () => {
    const { queryByText } = render(
      <IngressListSidebar
        ingressesData={
          workloadNodeData.data.data.ingressesData as IngressData[]
        }
      />,
    );
    expect(queryByText(/hello-minikube2-ingress/i)).toBeInTheDocument();
    expect(queryByText(/Location:/i)).toBeInTheDocument();
  });

  it('should render ingress rule if exists', () => {
    const { queryByText } = render(
      <IngressListSidebar
        ingressesData={
          workloadNodeData.data.data.ingressesData as IngressData[]
        }
      />,
    );
    expect(queryByText(/hello-minikube2-ingress/i)).toBeInTheDocument();
    expect(queryByText(/rules:/i)).toBeInTheDocument();
  });

  it('should not render ingress and show empty state if does not exists', () => {
    const { queryByText, getByText } = render(
      <IngressListSidebar ingressesData={[]} />,
    );
    getByText(/No Ingresses found for this resource./i);
    expect(queryByText(/hello-minikube2-ingress/i)).not.toBeInTheDocument();
    expect(queryByText(/Location:/)).not.toBeInTheDocument();
  });
});
