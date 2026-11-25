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

import { Grid } from '@backstage/ui';
import type { BookmarkViewerLayoutProps } from '../BookmarksViewer';
import { TEST_IDS } from '../../../consts/testids';

import styles from './BookmarkDesktopView.module.css';

export const BookmarkDesktopView = ({
  toc,
  previousButton,
  viewer,
  openInNewTab,
  nextButton,
}: BookmarkViewerLayoutProps) => (
  <Grid.Root
    columns="12"
    gap="4"
    className={styles.root}
    data-testid={TEST_IDS.BookmarkDesktopView.wrapper}
  >
    <Grid.Item colSpan="2" className={styles.column}>
      {toc}
      {previousButton}
    </Grid.Item>
    <Grid.Item colSpan="8" className={styles.column}>
      {viewer}
    </Grid.Item>
    <Grid.Item colSpan="2" className={styles.column}>
      {openInNewTab}
      <div className={styles.spacer} />
      {nextButton}
    </Grid.Item>
  </Grid.Root>
);
