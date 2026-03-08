/*
 * Copyright 2025 The Backstage Authors
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
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { TestApiProvider } from '@backstage/test-utils';
import { agenticChatApiRef } from '../../../api';
import { createAdminMockApi } from '../../../test-utils/factories';
import { SafetyEvalPanel } from './SafetyEvalPanel';

const theme = createTheme();

const defaultEffective = {
  safetyEnabled: false,
  inputShields: [],
  outputShields: [],
  safetyPatterns: [],
};

function renderPanel(
  api = createAdminMockApi(),
  effectiveConfig: Record<string, unknown> = defaultEffective,
) {
  return render(
    <ThemeProvider theme={theme}>
      <TestApiProvider apis={[[agenticChatApiRef, api as any]]}>
        <SafetyEvalPanel effectiveConfig={effectiveConfig} />
      </TestApiProvider>
    </ThemeProvider>,
  );
}

describe('SafetyEvalPanel', () => {
  it('renders both sub-tabs', async () => {
    renderPanel();
    await waitFor(() => {
      expect(screen.getByText('Shields')).toBeInTheDocument();
      expect(screen.getByText('Patterns')).toBeInTheDocument();
    });
  });

  it('renders page title', async () => {
    renderPanel();
    await waitFor(() => {
      expect(screen.getByText('Safety')).toBeInTheDocument();
    });
  });

  it('shows shields section by default with toggle', async () => {
    renderPanel();
    await waitFor(() => {
      expect(screen.getByText('Safety shields disabled')).toBeInTheDocument();
    });
  });

  it('shows shield editors when safety is toggled on', async () => {
    renderPanel();
    await waitFor(() => {
      expect(screen.getByText('Safety shields disabled')).toBeInTheDocument();
    });

    const toggle = screen.getByRole('checkbox', { name: /safety shields/i });
    fireEvent.click(toggle);

    expect(screen.getByText('Input Shields')).toBeInTheDocument();
    expect(screen.getByText('Output Shields')).toBeInTheDocument();
  });

  it('switches to Patterns tab', async () => {
    renderPanel();
    await waitFor(() => {
      expect(screen.getByText('Patterns')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Patterns'));

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Add a safety pattern...'),
      ).toBeInTheDocument();
    });
  });

  it('calls setAdminConfig when saving shields section', async () => {
    const api = createAdminMockApi();
    renderPanel(api);

    await waitFor(() => {
      expect(screen.getByText('Agent Platform Shields')).toBeInTheDocument();
    });

    const saveButtons = screen.getAllByText('Save');
    fireEvent.click(saveButtons[0]);

    await waitFor(() => {
      expect(api.setAdminConfig).toHaveBeenCalled();
    });
  });
});
