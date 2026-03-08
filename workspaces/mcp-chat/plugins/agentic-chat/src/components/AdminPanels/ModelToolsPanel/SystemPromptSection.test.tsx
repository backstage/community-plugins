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
import { SystemPromptSection } from './SystemPromptSection';

const theme = createTheme();

function renderSection(
  api = createAdminMockApi(),
  effectiveConfig: Record<string, unknown> = {
    systemPrompt: 'You are helpful',
    model: 'model-a',
  },
) {
  return render(
    <ThemeProvider theme={theme}>
      <TestApiProvider apis={[[agenticChatApiRef, api as any]]}>
        <SystemPromptSection effectiveConfig={effectiveConfig} />
      </TestApiProvider>
    </ThemeProvider>,
  );
}

describe('SystemPromptSection', () => {
  it('renders with effective config value pre-populated', async () => {
    renderSection();
    await waitFor(() => {
      expect(screen.getByDisplayValue('You are helpful')).toBeInTheDocument();
    });
  });

  it('shows Current Instructions and Generate tabs', async () => {
    renderSection();
    await waitFor(() => {
      expect(screen.getByText('Current Instructions')).toBeInTheDocument();
      expect(screen.getByText('Generate from Description')).toBeInTheDocument();
    });
  });

  it('shows editor by default, switches to generate tab', async () => {
    renderSection();

    await waitFor(() => {
      expect(screen.getByDisplayValue('You are helpful')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Generate from Description'));

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/Help developers troubleshoot/i),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Model for generation/i),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Current Instructions'));

    await waitFor(() => {
      expect(screen.getByDisplayValue('You are helpful')).toBeInTheDocument();
    });
  });

  it('disables Generate button when description is empty', async () => {
    renderSection();

    await waitFor(() => {
      expect(screen.getByText('Generate from Description')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Generate from Description'));

    await waitFor(() => {
      expect(screen.getByText('Generate')).toBeInTheDocument();
    });

    const generateBtn = screen.getByRole('button', { name: /^Generate$/ });
    expect(generateBtn).toBeDisabled();
  });

  it('calls API and switches to editor on successful generation', async () => {
    const api = createAdminMockApi();
    renderSection(api);

    await waitFor(() => {
      expect(screen.getByText('Generate from Description')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Generate from Description'));

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/Help developers troubleshoot/i),
      ).toBeInTheDocument();
    });

    const descInput = screen.getByPlaceholderText(
      /Help developers troubleshoot/i,
    );
    fireEvent.change(descInput, {
      target: { value: 'Help with Kubernetes' },
    });

    const generateBtn = screen.getByRole('button', { name: /^Generate$/ });
    expect(generateBtn).not.toBeDisabled();

    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(api.generateSystemPrompt).toHaveBeenCalledWith(
        'Help with Kubernetes',
        undefined,
        expect.anything(),
      );
    });

    await waitFor(() => {
      expect(
        screen.getByDisplayValue('Generated prompt text'),
      ).toBeInTheDocument();
    });
  });

  it('renders model dropdown in generate tab', async () => {
    renderSection();

    await waitFor(() => {
      expect(screen.getByText('Generate from Description')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Generate from Description'));

    await waitFor(() => {
      expect(
        screen.getByLabelText(/Model for generation/i),
      ).toBeInTheDocument();
    });
  });

  it('shows error alert when generation fails', async () => {
    const api = createAdminMockApi();
    (api.generateSystemPrompt as jest.Mock).mockRejectedValue(
      new Error('LLM unreachable'),
    );
    renderSection(api);

    await waitFor(() => {
      expect(screen.getByText('Generate from Description')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Generate from Description'));

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/Help developers troubleshoot/i),
      ).toBeInTheDocument();
    });

    const descInput = screen.getByPlaceholderText(
      /Help developers troubleshoot/i,
    );
    fireEvent.change(descInput, { target: { value: 'Help me' } });

    fireEvent.click(screen.getByRole('button', { name: /^Generate$/ }));

    await waitFor(() => {
      expect(screen.getByText('LLM unreachable')).toBeInTheDocument();
    });
  });

  it('shows character count on generate tab', async () => {
    renderSection();

    await waitFor(() => {
      expect(screen.getByText('Generate from Description')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Generate from Description'));

    await waitFor(() => {
      expect(screen.getByText('0/2000')).toBeInTheDocument();
    });

    const descInput = screen.getByPlaceholderText(
      /Help developers troubleshoot/i,
    );
    fireEvent.change(descInput, { target: { value: 'Hello' } });

    await waitFor(() => {
      expect(screen.getByText('5/2000')).toBeInTheDocument();
    });
  });

  it('shows copy button when prompt has content', async () => {
    renderSection();

    await waitFor(() => {
      expect(screen.getByDisplayValue('You are helpful')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Copy prompt')).toBeInTheDocument();
  });

  it('copies prompt to clipboard on click', async () => {
    Object.assign(window.navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });

    renderSection();

    await waitFor(() => {
      expect(screen.getByDisplayValue('You are helpful')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('Copy prompt'));

    await waitFor(() => {
      expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(
        'You are helpful',
      );
    });
  });
});
