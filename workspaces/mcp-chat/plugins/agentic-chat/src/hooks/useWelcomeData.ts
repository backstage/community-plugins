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
import { useCallback } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { agenticChatApiRef } from '../api';
import { Workflow, QuickAction, SwimLane } from '../types';
import { debugWarn } from '../utils';
import { useApiQuery } from './useApiQuery';

interface WelcomeDataResult {
  workflows: Workflow[];
  quickActions: QuickAction[];
  swimLanes: SwimLane[];
}

const INITIAL_DATA: WelcomeDataResult = {
  workflows: [],
  quickActions: [],
  swimLanes: [],
};

/**
 * Fetches workflows, quick actions, and swim lanes on mount.
 * Used by ChatContainer to populate the welcome screen.
 * Uses Promise.allSettled so partial failures still return successful data.
 */
export function useWelcomeData() {
  const api = useApi(agenticChatApiRef);

  const fetcher = useCallback(async (): Promise<WelcomeDataResult> => {
    const [wfsResult, qasResult, slsResult] = await Promise.allSettled([
      api.getWorkflows(),
      api.getQuickActions(),
      api.getSwimLanes(),
    ]);

    if (wfsResult.status === 'rejected') {
      debugWarn('Failed to load workflows:', wfsResult.reason);
    }
    if (qasResult.status === 'rejected') {
      debugWarn('Failed to load quick actions:', qasResult.reason);
    }
    if (slsResult.status === 'rejected') {
      debugWarn('Failed to load swim lanes:', slsResult.reason);
    }

    return {
      workflows: wfsResult.status === 'fulfilled' ? wfsResult.value : [],
      quickActions: qasResult.status === 'fulfilled' ? qasResult.value : [],
      swimLanes: slsResult.status === 'fulfilled' ? slsResult.value : [],
    };
  }, [api]);

  const { data } = useApiQuery<WelcomeDataResult>({
    fetcher,
    initialValue: INITIAL_DATA,
  });

  return data;
}
