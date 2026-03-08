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
import { useState, useCallback, useRef } from 'react';

/** Return type of the useFormState hook. */
export interface UseFormStateReturn<T extends object> {
  /** Current form values. */
  values: T;
  /** Update a single field by key. */
  setField: <K extends keyof T>(key: K, value: T[K]) => void;
  /** Replace all form values at once. */
  setValues: (next: T) => void;
  /** Whether any field has changed since the last call to resetDirty/setValues. */
  dirty: boolean;
  /** Mark the current values as the clean baseline. */
  resetDirty: () => void;
}

/**
 * Manages form state for admin panels.
 * Replaces the repeated pattern of individual setState + setField updaters
 * found across SettingsPanel, BrandingPanel, etc.
 */
export function useFormState<T extends object>(
  initial: T,
): UseFormStateReturn<T> {
  const [values, setValuesRaw] = useState<T>(initial);
  const valuesRef = useRef<T>(initial);
  valuesRef.current = values;
  const baselineRef = useRef<T>(initial);

  const setField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValuesRaw(prev => ({ ...prev, [key]: value }));
  }, []);

  const setValues = useCallback((next: T) => {
    setValuesRaw(next);
    baselineRef.current = next;
  }, []);

  const resetDirty = useCallback(() => {
    baselineRef.current = valuesRef.current;
    setValuesRaw(prev => ({ ...prev }));
  }, []);

  const dirty = JSON.stringify(values) !== JSON.stringify(baselineRef.current);

  return { values, setField, setValues, dirty, resetDirty };
}
