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
import { agenticChatApiRef } from '../../api';
import { createAdminMockApi } from '../../test-utils/factories';
import { BrandingPanel } from './BrandingPanel';

const theme = createTheme();

function renderPanel(api = createAdminMockApi()) {
  return render(
    <ThemeProvider theme={theme}>
      <TestApiProvider apis={[[agenticChatApiRef, api as any]]}>
        <BrandingPanel />
      </TestApiProvider>
    </ThemeProvider>,
  );
}

describe('BrandingPanel', () => {
  it('renders panel title', async () => {
    renderPanel();
    await waitFor(() => {
      expect(screen.getByText('Branding')).toBeInTheDocument();
    });
  });

  it('renders sub-tabs', async () => {
    renderPanel();
    await waitFor(() => {
      expect(screen.getByText('Appearance')).toBeInTheDocument();
      expect(screen.getByText('Swim Lanes')).toBeInTheDocument();
    });
  });

  it('shows Appearance section by default with branding fields', async () => {
    renderPanel();
    await waitFor(() => {
      expect(screen.getByLabelText('App Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Tagline')).toBeInTheDocument();
      expect(screen.getByLabelText('Primary Color')).toBeInTheDocument();
      expect(screen.getByLabelText('Secondary Color')).toBeInTheDocument();
    });
  });

  it('switches to Swim Lanes tab', async () => {
    renderPanel();

    await waitFor(() => {
      expect(screen.getByText('Swim Lanes')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Swim Lanes'));

    await waitFor(() => {
      expect(screen.getByText('Prompts & Actions')).toBeInTheDocument();
    });
  });

  it('calls setAdminConfig on save from Appearance', async () => {
    const api = createAdminMockApi();
    renderPanel(api);

    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(api.setAdminConfig).toHaveBeenCalledWith(
        'branding',
        expect.any(Object),
      );
    });
  });

  it('pre-populates Appearance fields from effective config', async () => {
    const api = createAdminMockApi();
    renderPanel(api);

    await waitFor(() => {
      const appNameInput = screen.getByLabelText(
        'App Name',
      ) as HTMLInputElement;
      expect(appNameInput.value).toBe('AI Chat');
    });

    const taglineInput = screen.getByLabelText('Tagline') as HTMLInputElement;
    expect(taglineInput.value).toBe('Your AI Assistant');
  });
});
