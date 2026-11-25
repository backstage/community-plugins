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

import {
  ButtonIcon,
  Dialog,
  DialogBody,
  DialogHeader,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import { RiListUnordered } from '@remixicon/react';
import { BookmarkViewerLayoutProps } from '../BookmarksViewer';
import { useState } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { TEST_IDS } from '../../../consts/testids';

import styles from './BookmarkMobileView.module.css';

export const BookmarkMobileView = ({
  toc,
  openInNewTab,
  nextButton,
  viewer,
}: BookmarkViewerLayoutProps) => {
  const { t } = useTranslation();

  const [tocDrawerOpen, setTocDrawerOpen] = useState(false);

  return (
    <div
      className={styles.root}
      data-testid={TEST_IDS.BookmarkMobileView.wrapper}
    >
      <Dialog
        isOpen={tocDrawerOpen}
        onOpenChange={setTocDrawerOpen}
        isDismissable
        width={280}
        className={styles.drawer}
        data-testid={TEST_IDS.BookmarkMobileView.backdrop}
      >
        <DialogHeader>{t('bookmarkViewer.mobileView.toc')}</DialogHeader>
        <DialogBody>{toc}</DialogBody>
      </Dialog>

      <div className={styles.toolbar}>
        <div className={styles.group}>
          <TooltipTrigger>
            <ButtonIcon
              aria-label={t('bookmarkViewer.mobileView.toc')}
              icon={<RiListUnordered />}
              variant="tertiary"
              className={styles.tocToggle}
              onPress={() => setTocDrawerOpen(prev => !prev)}
              data-testid={TEST_IDS.BookmarkMobileView.toggleToc}
            />
            <Tooltip>{t('bookmarkViewer.mobileView.toc')}</Tooltip>
          </TooltipTrigger>
          {openInNewTab}
        </div>

        <div className={styles.group}>{nextButton}</div>
      </div>

      <div className={styles.viewer}>{viewer}</div>
    </div>
  );
};
