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
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

const isOpenShiftConsole = (): boolean => {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return false;
  }

  // Strong signal: OpenShift Console exposes SERVER_FLAGS globally.
  if ((window as any).SERVER_FLAGS !== undefined) {
    return true;
  }

  // Secondary signals: specific OpenShift Console UI test ids.
  // Avoid PatternFly masthead/header class detection here, since RHDH/Backstage
  // can also render PatternFly-based headers (false positives).
  return (
    document.querySelector('[data-test="user-dropdown"]') !== null ||
    document.querySelector('[data-test="perspective-switcher"]') !== null
  );
};

interface HeaderBackgroundContextType {
  hasBackgroundImage: boolean;
  textColor?: string;
  iconColor?: string;
}

const HeaderBackgroundContext = createContext<HeaderBackgroundContextType>({
  hasBackgroundImage: false,
  textColor: undefined,
  iconColor: undefined,
});

export const useHeaderBackground = () => {
  return useContext(HeaderBackgroundContext).hasBackgroundImage;
};

export const useHeaderTextColor = () => {
  return useContext(HeaderBackgroundContext).textColor;
};

export const useHeaderIconColor = () => {
  return useContext(HeaderBackgroundContext).iconColor;
};

interface HeaderBackgroundProviderProps {
  children: ReactNode;
}

export const HeaderBackgroundProvider = ({
  children,
}: HeaderBackgroundProviderProps) => {
  const [hasBackgroundImage, setHasBackgroundImage] = useState(false);
  const [textColor, setTextColor] = useState<string | undefined>(undefined);
  const [iconColor, setIconColor] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    let found = false;
    let attempts = 0;
    const maxAttempts = 5;

    const checkHeader = () => {
      if (found || attempts >= maxAttempts) {
        return;
      }
      attempts++;

      // Try all possible selectors based on detected platform
      const openShiftConsole = isOpenShiftConsole();
      const selectors = openShiftConsole
        ? [
            '.pf-c-page__header',
            '.pf-v5-c-page__header',
            '.pf-v5-c-masthead',
            '.pf-v6-c-page__header',
            '.pf-v6-c-masthead',
            'header',
          ]
        : [
            'header[role="banner"]',
            'header.MuiPaper-root',
            '.MuiPaper-root[role="banner"]',
            'header',
          ];

      let header: Element | null = null;
      for (const selector of selectors) {
        header = document.querySelector(selector);
        if (header) break;
      }

      if (!header) {
        return;
      }

      // Check the header and its parent elements for background images
      let elementToCheck: Element = header;
      let parent = header.parentElement;
      let checkedParents = 0;

      while (parent && parent !== document.body && checkedParents < 3) {
        const parentStyles = window.getComputedStyle(parent);
        if (
          parentStyles.backgroundImage &&
          parentStyles.backgroundImage !== 'none' &&
          parentStyles.backgroundImage.includes('url')
        ) {
          elementToCheck = parent;
          break;
        }
        parent = parent.parentElement;
        checkedParents++;
      }

      const styles = window.getComputedStyle(elementToCheck);
      const backgroundImage = styles.backgroundImage;

      // Check if background image is valid
      const hasImage = Boolean(
        backgroundImage &&
          backgroundImage !== 'none' &&
          backgroundImage !== '' &&
          backgroundImage !== 'initial' &&
          backgroundImage !== 'inherit' &&
          backgroundImage.includes('url'),
      );

      // Detect host theme (OpenShift/RHDH tends to expose it via DOM).
      const html = document.documentElement;
      const body = document.body;
      const bodyMode =
        body?.getAttribute?.('data-theme-mode') ??
        (body as any)?.dataset?.themeMode;
      const isDark =
        html?.classList?.contains('pf-v5-theme-dark') ||
        html?.classList?.contains('pf-v6-theme-dark') ||
        bodyMode === 'dark';

      // Always report whether there is a background image.
      setHasBackgroundImage(hasImage);

      if (openShiftConsole) {
        // In OpenShift Console, header foreground should follow the host theme.
        const fg = isDark
          ? 'var(--pf-v5-global--Color--light-100, #fff)'
          : 'var(--pf-v5-global--Color--100, #151515)';
        setTextColor(fg);
        setIconColor(fg);
      } else {
        // In Backstage/RHDH, if there's a header background image we force white content.
        const fg = hasImage ? 'white' : undefined;
        setTextColor(fg);
        setIconColor(fg);
      }
      found = true;
    };

    // Check immediately
    checkHeader();

    // If not found, check periodically
    if (!found) {
      const interval = setInterval(() => {
        checkHeader();
        if (found || attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 2000);

      return;
    }

    return;
  }, []);

  return (
    <HeaderBackgroundContext.Provider
      value={{ hasBackgroundImage, textColor, iconColor }}
    >
      {children}
    </HeaderBackgroundContext.Provider>
  );
};
