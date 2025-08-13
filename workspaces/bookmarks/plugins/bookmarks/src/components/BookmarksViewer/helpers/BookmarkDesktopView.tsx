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

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import type { BookmarkViewerLayoutProps } from '../BookmarksViewer';
import { TEST_IDS } from '../../../consts/testids';

export const BookmarkDesktopView = ({
  toc,
  previousButton,
  viewer,
  openInNewTab,
  nextButton,
}: BookmarkViewerLayoutProps) => (
  <Grid
    direction="row"
    container
    spacing={2}
    sx={{ height: '100%' }}
    data-testid={TEST_IDS.BookmarkDesktopView.wrapper}
  >
    <Grid item md={2} sx={{ display: 'flex', flexDirection: 'column' }}>
      {toc}
      {previousButton}
    </Grid>
    <Grid item md={8} sx={{ display: 'flex', flexDirection: 'column' }}>
      {viewer}
    </Grid>
    <Grid item md={2} sx={{ display: 'flex', flexDirection: 'column' }}>
      {openInNewTab}
      <Box sx={{ flexGrow: 1 }} />
      {nextButton}
    </Grid>
  </Grid>
);
