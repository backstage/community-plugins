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
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { agenticChatApiRef } from '../../api';
import { useAdminConfig } from '../../hooks';
import type { SwimLane, SwimLaneCard } from '../../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Card with a stable React key for list identity. */
export interface EditableCard extends SwimLaneCard {
  readonly _key: string;
}

/** Lane with a stable React key for list identity. */
export interface EditableLane extends Omit<SwimLane, 'cards'> {
  readonly _key: string;
  cards: EditableCard[];
}

/** Per-field validation errors keyed by path. */
export interface ValidationErrors {
  readonly lanes: ReadonlyMap<string, string>;
  readonly cards: ReadonlyMap<string, string>;
}

const EMPTY_VALIDATION: ValidationErrors = {
  lanes: new Map(),
  cards: new Map(),
};

// ---------------------------------------------------------------------------
// Stable key generator (avoids Date.now() collisions)
// ---------------------------------------------------------------------------

let nextId = 0;
function stableKey(prefix: string): string {
  nextId += 1;
  return `${prefix}-${nextId}`;
}

// ---------------------------------------------------------------------------
// Data transforms
// ---------------------------------------------------------------------------

function tagCard(c: SwimLaneCard): EditableCard {
  return { ...c, _key: stableKey('card') };
}

function tagLane(l: SwimLane): EditableLane {
  return { ...l, _key: stableKey('lane'), cards: l.cards.map(tagCard) };
}

function toEditable(data: readonly SwimLane[]): EditableLane[] {
  return data.map(tagLane);
}

function stripCard({ _key, ...rest }: EditableCard): SwimLaneCard {
  return rest;
}

function toCleanLanes(lanes: readonly EditableLane[]): SwimLane[] {
  return lanes
    .filter(l => l.title.trim())
    .map(({ _key, ...rest }, i) => ({
      ...rest,
      id: rest.id || `lane-${i}`,
      order: i + 1,
      cards: rest.cards
        .filter(c => c.title.trim() && c.prompt.trim())
        .map(stripCard),
    }));
}

function lanesEqual(a: readonly SwimLane[], b: readonly SwimLane[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const la = a[i];
    const lb = b[i];
    if (
      la.title !== lb.title ||
      la.icon !== lb.icon ||
      la.color !== lb.color ||
      la.description !== lb.description ||
      la.cards.length !== lb.cards.length
    ) {
      return false;
    }
    for (let j = 0; j < la.cards.length; j++) {
      const ca = la.cards[j];
      const cb = lb.cards[j];
      if (
        ca.title !== cb.title ||
        ca.prompt !== cb.prompt ||
        ca.description !== cb.description ||
        ca.icon !== cb.icon
      ) {
        return false;
      }
    }
  }
  return true;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validate(lanes: readonly EditableLane[]): ValidationErrors {
  const laneErrors = new Map<string, string>();
  const cardErrors = new Map<string, string>();

  for (const lane of lanes) {
    if (!lane.title.trim()) {
      laneErrors.set(`${lane._key}:title`, 'Lane title is required');
    }
    const filledCards = lane.cards.filter(
      c => c.title.trim() || c.prompt.trim(),
    );
    if (filledCards.length === 0 && lane.title.trim()) {
      laneErrors.set(`${lane._key}:cards`, 'At least one card is required');
    }
    for (const card of lane.cards) {
      if (card.title.trim() && !card.prompt.trim()) {
        cardErrors.set(`${card._key}:prompt`, 'Prompt is required');
      }
      if (!card.title.trim() && card.prompt.trim()) {
        cardErrors.set(`${card._key}:title`, 'Title is required');
      }
    }
  }

  if (laneErrors.size === 0 && cardErrors.size === 0) {
    return EMPTY_VALIDATION;
  }
  return { lanes: laneErrors, cards: cardErrors };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSwimLanesEditor() {
  const api = useApi(agenticChatApiRef);
  const { entry, source, loading, saving, error, save, reset } =
    useAdminConfig('swimLanes');

  const [lanes, setLanes] = useState<EditableLane[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] =
    useState<ValidationErrors>(EMPTY_VALIDATION);
  const baselineRef = useRef<SwimLane[]>([]);

  // Single initialization effect: DB entry takes priority, then YAML fallback
  useEffect(() => {
    if (loading || initialized) return undefined;

    if (entry) {
      const data = entry.configValue as SwimLane[];
      if (Array.isArray(data)) {
        setLanes(toEditable(data));
        baselineRef.current = data;
      }
      setInitialized(true);
      return undefined;
    }

    let cancelled = false;
    api
      .getSwimLanes()
      .then(yamlLanes => {
        if (cancelled) return;
        baselineRef.current = yamlLanes;
        setLanes(yamlLanes.length > 0 ? toEditable(yamlLanes) : []);
        setInitialized(true);
      })
      .catch(() => {
        if (!cancelled) setInitialized(true);
      });

    return () => {
      cancelled = true;
    };
  }, [loading, initialized, entry, api]);

  const handleSave = useCallback(async () => {
    const errors = validate(lanes);
    setValidationErrors(errors);
    if (errors.lanes.size > 0 || errors.cards.size > 0) {
      setToast('Please fix validation errors before saving');
      return;
    }

    const cleanLanes = toCleanLanes(lanes);
    if (cleanLanes.length === 0) {
      setToast('At least one lane with a title is required');
      return;
    }

    try {
      await save(cleanLanes);
    } catch {
      return;
    }
    baselineRef.current = cleanLanes;
    setToast('Swim lanes saved successfully');
  }, [lanes, save]);

  const handleReset = useCallback(async () => {
    try {
      await reset();
    } catch {
      return;
    }
    const yamlLanes = await api.getSwimLanes();
    baselineRef.current = yamlLanes;
    setLanes(yamlLanes.length > 0 ? toEditable(yamlLanes) : []);
    setValidationErrors(EMPTY_VALIDATION);
    setToast('Reset to YAML defaults');
  }, [reset, api]);

  const updateLane = useCallback(
    (
      laneKey: string,
      updates: Partial<Omit<EditableLane, '_key' | 'cards'>>,
    ) => {
      setLanes(prev =>
        prev.map(l => (l._key === laneKey ? { ...l, ...updates } : l)),
      );
      setValidationErrors(EMPTY_VALIDATION);
    },
    [],
  );

  const updateCard = useCallback(
    (
      laneKey: string,
      cardKey: string,
      updates: Partial<Omit<EditableCard, '_key'>>,
    ) => {
      setLanes(prev =>
        prev.map(l => {
          if (l._key !== laneKey) return l;
          return {
            ...l,
            cards: l.cards.map(c =>
              c._key === cardKey ? { ...c, ...updates } : c,
            ),
          };
        }),
      );
      setValidationErrors(EMPTY_VALIDATION);
    },
    [],
  );

  const addCard = useCallback((laneKey: string) => {
    const card = tagCard({ title: '', prompt: '', description: '' });
    setLanes(prev =>
      prev.map(l =>
        l._key === laneKey ? { ...l, cards: [...l.cards, card] } : l,
      ),
    );
  }, []);

  const removeCard = useCallback((laneKey: string, cardKey: string) => {
    setLanes(prev =>
      prev.map(l => {
        if (l._key !== laneKey) return l;
        return { ...l, cards: l.cards.filter(c => c._key !== cardKey) };
      }),
    );
  }, []);

  const addLane = useCallback(() => {
    const lane = tagLane({
      id: stableKey('lane'),
      title: '',
      cards: [{ title: '', prompt: '', description: '' }],
      order: 0,
    });
    setLanes(prev => [...prev, lane]);
  }, []);

  const removeLane = useCallback((laneKey: string) => {
    setLanes(prev => prev.filter(l => l._key !== laneKey));
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const dirty = useMemo(() => {
    const cleanLanes = toCleanLanes(lanes);
    return !lanesEqual(cleanLanes, baselineRef.current);
  }, [lanes]);

  return useMemo(
    () => ({
      lanes,
      initialized,
      dirty,
      loading,
      saving,
      error,
      source,
      toast,
      validationErrors,
      handleSave,
      handleReset,
      updateLane,
      updateCard,
      addCard,
      removeCard,
      addLane,
      removeLane,
      dismissToast,
    }),
    [
      lanes,
      initialized,
      dirty,
      loading,
      saving,
      error,
      source,
      toast,
      validationErrors,
      handleSave,
      handleReset,
      updateLane,
      updateCard,
      addCard,
      removeCard,
      addLane,
      removeLane,
      dismissToast,
    ],
  );
}
