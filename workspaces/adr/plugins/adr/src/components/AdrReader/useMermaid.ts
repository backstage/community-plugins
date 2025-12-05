/*
 * Copyright 2022 The Backstage Authors
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

import { useEffect, useRef } from 'react';
import { useTheme } from '@material-ui/core/styles';
import mermaid from 'mermaid';

// Global flag to ensure mermaid is only initialized once
let mermaidInitialized = false;

/**
 * Custom hook to initialize and manage mermaid configuration
 * Initializes mermaid once globally and updates theme when needed
 */
export const useMermaid = () => {
  const theme = useTheme();
  const themeRef = useRef(theme.palette.type);

  useEffect(() => {
    const isDarkTheme = theme.palette.type === 'dark';
    const mermaidTheme = isDarkTheme ? 'dark' : 'neutral';

    // Initialize mermaid once on first use
    if (!mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: mermaidTheme,
      });
      mermaidInitialized = true;
      themeRef.current = theme.palette.type;
      return;
    }

    // Update theme if it changed
    if (themeRef.current !== theme.palette.type) {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: mermaidTheme,
      });
      themeRef.current = theme.palette.type;
    }
  }, [theme.palette.type]);

  return mermaid;
};
