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
import { fireEvent, render, screen } from '@testing-library/react';

import { mockKubernetesResponse } from '../../../../__fixtures__/1-deployments';
import { ContainerSelector } from './ContainerSelector';

const containerList = [
  mockKubernetesResponse.pods[0].spec.containers[0],
  {
    name: 'container2',
    image: 'openshift/hello-openshift',
    ports: [
      {
        containerPort: 8080,
        protocol: 'TCP',
      },
    ],
    resources: {},
    volumeMounts: [
      {
        name: 'kube-api-access-7g8nf',
        readOnly: true,
        mountPath: '/var/run/secrets/kubernetes.io/serviceaccount',
      },
    ],
    terminationMessagePath: '/dev/termination-log',
    terminationMessagePolicy: 'File',
    imagePullPolicy: 'Always',
  },
];

const mockOnContainerChange = jest.fn();

describe('ContainerSelector', () => {
  it('should render the select dropdown and show selected option', () => {
    render(
      <ContainerSelector
        containersList={containerList}
        containerSelected="container-hello"
        onContainerChange={mockOnContainerChange}
      />,
    );
    expect(screen.getByText('container-hello')).toBeInTheDocument();
    expect(screen.getByTestId('container-select')).toBeInTheDocument();
  });

  it('should trigger onChange handler', () => {
    render(
      <ContainerSelector
        containersList={containerList}
        containerSelected="container-hello"
        onContainerChange={mockOnContainerChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /container-hello/i }));
    fireEvent.click(screen.getByRole('option', { name: /container2/i }));
    expect(mockOnContainerChange).toHaveBeenCalledWith('container2');
  });
});
