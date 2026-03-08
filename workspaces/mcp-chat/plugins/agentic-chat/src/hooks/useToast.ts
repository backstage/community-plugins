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
import { useState, useCallback } from 'react';

/** Severity levels matching MUI Alert severity. */
export type ToastSeverity = 'success' | 'error' | 'warning' | 'info';

/** State for a toast notification. */
export interface ToastState {
  open: boolean;
  message: string;
  severity: ToastSeverity;
}

/** Return type of the useToast hook. */
export interface UseToastReturn {
  toast: ToastState;
  showToast: (message: string, severity?: ToastSeverity) => void;
  closeToast: () => void;
}

const CLOSED_STATE: ToastState = {
  open: false,
  message: '',
  severity: 'success',
};

/**
 * Manages toast/snackbar notification state.
 * Replaces the duplicated `useState<{open, message, severity}>` + setter
 * pattern found across admin panels.
 */
export function useToast(): UseToastReturn {
  const [toast, setToast] = useState<ToastState>(CLOSED_STATE);

  const showToast = useCallback(
    (message: string, severity: ToastSeverity = 'success') => {
      setToast({ open: true, message, severity });
    },
    [],
  );

  const closeToast = useCallback(() => {
    setToast(prev => ({ ...prev, open: false }));
  }, []);

  return { toast, showToast, closeToast };
}
