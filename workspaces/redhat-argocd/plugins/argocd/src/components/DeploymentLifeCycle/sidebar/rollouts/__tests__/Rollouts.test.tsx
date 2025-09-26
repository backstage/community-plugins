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
import { render, screen } from '@testing-library/react';

import { mockArgoResources } from '../../../../../../dev/__data__/argoRolloutsObjects';
import { getRolloutUIResources } from '../../../../../utils/rollout-utils';
import { useArgoResources } from '../RolloutContext';
import Rollouts from '../Rollouts';
import { mockUseTranslation } from '../../../../../test-utils/mockTranslations';

jest.mock('../../../../../hooks/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

jest.mock('../RolloutContext', () => ({
  ...jest.requireActual('../RolloutContext'),
  useArgoResources: jest.fn(),
}));

describe('Rollouts', () => {
  beforeEach(() => {
    (useArgoResources as jest.Mock).mockReturnValue({
      rollouts: getRolloutUIResources(mockArgoResources, 'quarkus-app'),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not render anything if rollouts is missing', () => {
    (useArgoResources as jest.Mock).mockReturnValue({ rollouts: [] });

    render(<Rollouts />);
    expect(screen.queryByTestId('rollouts-list')).not.toBeInTheDocument();
  });

  it('should render rollouts', () => {
    render(<Rollouts />);
    expect(screen.queryByTestId('rollouts-list')).toBeInTheDocument();
  });
});
