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

import { renderHook, act } from '@testing-library/react';
import { useToolApproval } from './useToolApproval';
import { ApprovalStatus } from '../types';

describe('useToolApproval', () => {
  const onDecisionsChange = jest.fn();
  const onComplete = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('approve updates decision and calls onDecisionsChange', () => {
    const decisions: Record<string, ApprovalStatus> = {
      c1: 'pending',
      c2: 'pending',
    };

    const { result } = renderHook(() =>
      useToolApproval(decisions, onDecisionsChange, onComplete),
    );

    act(() => result.current.approve('c1'));

    expect(onDecisionsChange).toHaveBeenCalledWith({
      c1: 'approved',
      c2: 'pending',
    });
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('reject updates decision and calls onDecisionsChange', () => {
    const decisions: Record<string, ApprovalStatus> = {
      c1: 'pending',
      c2: 'pending',
    };

    const { result } = renderHook(() =>
      useToolApproval(decisions, onDecisionsChange, onComplete),
    );

    act(() => result.current.reject('c1'));

    expect(onDecisionsChange).toHaveBeenCalledWith({
      c1: 'rejected',
      c2: 'pending',
    });
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('calls onComplete when all decisions resolved', () => {
    const decisions: Record<string, ApprovalStatus> = {
      c1: 'approved',
      c2: 'pending',
    };

    const { result } = renderHook(() =>
      useToolApproval(decisions, onDecisionsChange, onComplete),
    );

    act(() => result.current.approve('c2'));

    expect(onComplete).toHaveBeenCalledWith({
      c1: 'approved',
      c2: 'approved',
    });
  });

  it('does nothing when decisions is undefined', () => {
    const { result } = renderHook(() =>
      useToolApproval(undefined, onDecisionsChange, onComplete),
    );

    act(() => result.current.approve('c1'));

    expect(onDecisionsChange).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('does nothing when id not in decisions', () => {
    const decisions: Record<string, ApprovalStatus> = { c1: 'pending' };

    const { result } = renderHook(() =>
      useToolApproval(decisions, onDecisionsChange, onComplete),
    );

    act(() => result.current.approve('unknown'));

    expect(onDecisionsChange).not.toHaveBeenCalled();
  });

  it('does nothing when id already resolved', () => {
    const decisions: Record<string, ApprovalStatus> = { c1: 'approved' };

    const { result } = renderHook(() =>
      useToolApproval(decisions, onDecisionsChange, onComplete),
    );

    act(() => result.current.reject('c1'));

    expect(onDecisionsChange).not.toHaveBeenCalled();
  });

  it('handles mixed approve and reject leading to completion', () => {
    const decisions: Record<string, ApprovalStatus> = {
      c1: 'rejected',
      c2: 'pending',
    };

    const { result } = renderHook(() =>
      useToolApproval(decisions, onDecisionsChange, onComplete),
    );

    act(() => result.current.reject('c2'));

    expect(onComplete).toHaveBeenCalledWith({
      c1: 'rejected',
      c2: 'rejected',
    });
  });
});
