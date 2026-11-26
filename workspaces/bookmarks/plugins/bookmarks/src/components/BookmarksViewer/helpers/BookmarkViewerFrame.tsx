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

import { Skeleton, Text } from '@backstage/ui';
import { memo, useRef } from 'react';
import { useIsIframeLoading } from '../../../hooks/useIsIframeLoading';
import { TEST_IDS } from '../../../consts/testids';
import { useTranslation } from '../../../hooks/useTranslation';

import styles from './BookmarkViewerFrame.module.css';

type FrameProps = {
  src: string;
  title?: string;
};

export const BookmarkViewerFrame = memo(({ src, title }: FrameProps) => {
  const { t } = useTranslation();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isIframeLoading = useIsIframeLoading(iframeRef, src);

  /**
   * In development mode, React's Fast Refresh (live reload) can remount components,
   * causing this hook to reset its loading state. This leads the iframe to incorrectly
   * appearing as loading.
   */
  const isDevEnv = process.env.NODE_ENV === 'development';

  return (
    <>
      {isIframeLoading && (
        <div
          className={styles.loading}
          data-testid={TEST_IDS.BookmarkViewerFrame.loading}
        >
          <Skeleton width="100%" height={128} />

          {isDevEnv && (
            <Text
              variant="body-small"
              color="primary"
              className={styles.devWarning}
            >
              {t('bookmarkViewerFrame.devModeWarning')}
            </Text>
          )}
        </div>
      )}

      <iframe
        title={title}
        aria-label={title}
        className={styles.frame}
        style={{ visibility: isIframeLoading ? 'hidden' : 'visible' }}
        data-testid={TEST_IDS.BookmarkViewerFrame.iframe}
        ref={iframeRef}
        referrerPolicy="no-referrer"
        src={src}
        // disallow top-navigation, top-navigation-by-user-activation, popups-to-escape-sandbox
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation allow-modals allow-orientation-lock allow-pointer-lock"
        // keeps the embedded page keyboard-focusable
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
      />
    </>
  );
});
