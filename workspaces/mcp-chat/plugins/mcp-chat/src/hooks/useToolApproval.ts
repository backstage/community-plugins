/*
 * Copyright 2026 The Backstage Authors
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
import { ApprovalStatus, ConfirmedStatus } from '../types';

/**
 * @public
 */
export interface UseToolApprovalReturn {
  approve: (id: string) => void;
  reject: (id: string) => void;
}
/**
 * @public
 */
export function useToolApproval(
  decisions: Record<string, ApprovalStatus> | undefined,
  onDecisionsChange: (decisions: Record<string, ApprovalStatus>) => void,
  onComplete: (finalDecisions: Record<string, ConfirmedStatus>) => void,
): UseToolApprovalReturn {
  const decide = useCallback(
    (id: string, decision: ConfirmedStatus) => {
      if (!decisions) return;
      if (!decisions[id] || decisions[id] !== 'pending') return;

      const nextDecisions = { ...decisions, [id]: decision };
      onDecisionsChange(nextDecisions);

      const allResolved =
        Object.keys(nextDecisions).length > 0 &&
        Object.values(nextDecisions).every(
          d => d === 'approved' || d === 'rejected',
        );

      if (allResolved) {
        onComplete(nextDecisions as Record<string, ConfirmedStatus>);
      }
    },
    [decisions, onComplete, onDecisionsChange],
  );

  const approve = useCallback((id: string) => decide(id, 'approved'), [decide]);
  const reject = useCallback((id: string) => decide(id, 'rejected'), [decide]);

  return { approve, reject };
}
