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

interface HeaderBackgroundContextType {
  hasBackgroundImage: boolean;
}

const HeaderBackgroundContext = createContext<HeaderBackgroundContextType>({
  hasBackgroundImage: false,
});

export const useHeaderBackground = () => {
  return useContext(HeaderBackgroundContext).hasBackgroundImage;
};

interface HeaderBackgroundProviderProps {
  children: ReactNode;
}

export const HeaderBackgroundProvider = ({
  children,
}: HeaderBackgroundProviderProps) => {
  const [hasBackgroundImage, setHasBackgroundImage] = useState(false);

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

      // Detect platform first
      // Support PF4 (pf-c-), PF5 (pf-v5-), and PF6 (pf-v6-) class prefixes
      const isOpenShiftConsole =
        document.querySelector('[data-test="user-dropdown"]') !== null ||
        document.querySelector('.pf-c-page__header') !== null ||
        document.querySelector('.pf-v5-c-page__header') !== null ||
        document.querySelector('.pf-v5-c-masthead') !== null ||
        document.querySelector('.pf-v6-c-page__header') !== null ||
        document.querySelector('.pf-v6-c-masthead') !== null ||
        document.querySelector('[data-test="perspective-switcher"]') !== null ||
        (window as any).SERVER_FLAGS !== undefined;

      // Try all possible selectors based on detected platform
      const selectors = isOpenShiftConsole
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

      setHasBackgroundImage(hasImage);
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
    <HeaderBackgroundContext.Provider value={{ hasBackgroundImage }}>
      {children}
    </HeaderBackgroundContext.Provider>
  );
};
