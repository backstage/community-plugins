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
import { PromptsPanel } from './PromptsPanel';
import type { SwimLane } from '../../../types';

const theme = createTheme();

const SAMPLE_LANES: SwimLane[] = [
  {
    id: 'ops',
    title: 'Ansible Ops',
    icon: 'terminal',
    color: '#d32f2f',
    cards: [
      { title: 'View Projects', prompt: 'List Projects', description: 'Test' },
      { title: 'List Inventories', prompt: 'List Inventories' },
    ],
    order: 1,
  },
  {
    id: 'dev',
    title: 'Development',
    cards: [{ title: 'Build', prompt: 'Run build' }],
    order: 2,
  },
];

function createApi(lanes: SwimLane[] = SAMPLE_LANES) {
  const api = createAdminMockApi();
  (api.getAdminConfig as jest.Mock).mockResolvedValue({
    entry: { key: 'swimLanes', configValue: lanes },
    source: 'database',
  });
  (api.getSwimLanes as jest.Mock).mockResolvedValue(lanes);
  return api;
}

function renderPanel(api = createApi()) {
  return render(
    <ThemeProvider theme={theme}>
      <TestApiProvider apis={[[agenticChatApiRef, api as any]]}>
        <PromptsPanel />
      </TestApiProvider>
    </ThemeProvider>,
  );
}

describe('PromptsPanel', () => {
  it('renders header and lanes after loading', async () => {
    renderPanel();
    await waitFor(() => {
      expect(screen.getByText('Prompts & Actions')).toBeInTheDocument();
    });
    expect(screen.getByText('Ansible Ops')).toBeInTheDocument();
    expect(screen.getByText('Development')).toBeInTheDocument();
  });

  it('shows loading spinner initially', () => {
    const api = createAdminMockApi();
    (api.getAdminConfig as jest.Mock).mockReturnValue(new Promise(() => {}));
    renderPanel(api);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders Customized chip when source is database', async () => {
    renderPanel();
    await waitFor(() => {
      expect(screen.getByText('Customized')).toBeInTheDocument();
    });
  });

  it('disables Save button when no changes made', async () => {
    renderPanel();
    await waitFor(() => {
      expect(screen.getByText('Saved')).toBeInTheDocument();
    });
    expect(screen.getByText('Saved').closest('button')).toBeDisabled();
  });

  it('enables Save button after editing a field', async () => {
    renderPanel();
    await waitFor(() => {
      expect(screen.getByText('Ansible Ops')).toBeInTheDocument();
    });

    const titleInputs = screen.getAllByLabelText('Lane Title *');
    fireEvent.change(titleInputs[0], { target: { value: 'Modified Lane' } });

    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
      expect(
        screen.getByText('Save Changes').closest('button'),
      ).not.toBeDisabled();
    });
  });

  it('adds a new lane when Add Swim Lane is clicked', async () => {
    renderPanel();
    await waitFor(() => {
      expect(screen.getByText('Add Swim Lane')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Swim Lane'));

    await waitFor(() => {
      expect(screen.getByText('Untitled Lane')).toBeInTheDocument();
    });
  });

  it('adds a card when Add Card is clicked', async () => {
    renderPanel();
    await waitFor(() => {
      expect(screen.getByText('Ansible Ops')).toBeInTheDocument();
    });

    const addCardButtons = screen.getAllByText('Add Card');
    const initialCards = screen.getAllByLabelText('Remove card');
    fireEvent.click(addCardButtons[0]);

    await waitFor(() => {
      expect(screen.getAllByLabelText('Remove card').length).toBe(
        initialCards.length + 1,
      );
    });
  });

  it('removes a card when delete button is clicked', async () => {
    renderPanel();
    await waitFor(() => {
      expect(screen.getByText('Ansible Ops')).toBeInTheDocument();
    });

    const initialCards = screen.getAllByLabelText('Remove card');
    fireEvent.click(initialCards[0]);

    await waitFor(() => {
      expect(screen.getAllByLabelText('Remove card').length).toBe(
        initialCards.length - 1,
      );
    });
  });

  it('calls save with cleaned lanes on save', async () => {
    const api = createApi();
    renderPanel(api);
    await waitFor(() => {
      expect(screen.getByText('Ansible Ops')).toBeInTheDocument();
    });

    const titleInputs = screen.getAllByLabelText('Lane Title *');
    fireEvent.change(titleInputs[0], { target: { value: 'Updated Ops' } });

    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(api.setAdminConfig).toHaveBeenCalledWith(
        'swimLanes',
        expect.arrayContaining([
          expect.objectContaining({ title: 'Updated Ops' }),
        ]),
      );
    });
  });

  it('shows error alert when error occurs', async () => {
    const api = createAdminMockApi();
    (api.getAdminConfig as jest.Mock).mockResolvedValue({
      entry: null,
      source: 'default',
    });
    (api.getSwimLanes as jest.Mock).mockRejectedValue(
      new Error('Network error'),
    );
    renderPanel(api);

    await waitFor(() => {
      expect(screen.getByText('Add Swim Lane')).toBeInTheDocument();
    });
  });

  it('only expands the first lane by default', async () => {
    renderPanel();
    await waitFor(() => {
      expect(screen.getByText('Ansible Ops')).toBeInTheDocument();
    });

    const firstAccordionSummary = screen
      .getByText('Ansible Ops')
      .closest('[role="button"]');
    expect(firstAccordionSummary).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows color swatch next to color field', async () => {
    renderPanel();
    await waitFor(() => {
      expect(screen.getByText('Ansible Ops')).toBeInTheDocument();
    });

    const colorInput = screen.getAllByLabelText('Color')[0] as HTMLInputElement;
    expect(colorInput.value).toBe('#d32f2f');
  });

  it('shows empty state when no lanes exist', async () => {
    const api = createApi([]);
    renderPanel(api);
    await waitFor(() => {
      expect(
        screen.getByText('No swim lanes configured yet.'),
      ).toBeInTheDocument();
    });
    expect(screen.getByText('Add Swim Lane')).toBeInTheDocument();
  });

  it('shows card count chip in lane accordion summary', async () => {
    renderPanel();
    await waitFor(() => {
      expect(screen.getByText('2 cards')).toBeInTheDocument();
      expect(screen.getByText('1 card')).toBeInTheDocument();
    });
  });
});
