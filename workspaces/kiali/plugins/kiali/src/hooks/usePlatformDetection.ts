/*
 * Copyright 2024 The Backstage Authors
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
import { useEffect, useState } from 'react';

const isOpenShiftConsole = (): boolean => {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return false;
  }

  // Strong signal: OpenShift Console exposes SERVER_FLAGS globally.
  if ((window as any).SERVER_FLAGS !== undefined) {
    return true;
  }

  // Secondary signals: specific OpenShift Console UI test ids.
  // Note: We intentionally do NOT rely on PatternFly masthead/header classes here,
  // because RHDH/Backstage can also render PatternFly-based headers, which would
  // create false positives.
  return (
    document.querySelector('[data-test="user-dropdown"]') !== null ||
    document.querySelector('[data-test="perspective-switcher"]') !== null
  );
};

/**
 * Detects if we are running in OpenShift Console
 * OpenShift Console has specific DOM elements and structure that we can detect
 *
 * @returns boolean indicating if we are in OpenShift Console (true) or RHDH/Backstage (false)
 */
export const usePlatformDetection = (): boolean => {
  const [isOpenShift, setIsOpenShift] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    let found = false;
    let attempts = 0;
    const maxAttempts = 5;

    const checkPlatform = () => {
      if (found || attempts >= maxAttempts) {
        return;
      }
      attempts++;

      if (isOpenShiftConsole()) {
        setIsOpenShift(true);
        found = true;
      }
    };

    // Check immediately
    checkPlatform();

    // If not found, re-check
    if (!found) {
      const interval = setInterval(() => {
        checkPlatform();
        if (found || attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 2000);

      return;
    }

    return;
  }, []);

  return isOpenShift;
};
