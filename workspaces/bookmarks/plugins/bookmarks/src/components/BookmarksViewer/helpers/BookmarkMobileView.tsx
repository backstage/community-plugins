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

import TocIcon from '@mui/icons-material/Toc';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { BookmarkViewerLayoutProps } from '../BookmarksViewer';
import { useState } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { TEST_IDS } from '../../../consts/testids';

export const BookmarkMobileView = ({
  toc,
  openInNewTab,
  nextButton,
  viewer,
}: BookmarkViewerLayoutProps) => {
  const { t } = useTranslation();

  const [tocDrawerOpen, setTocDrawerOpen] = useState(false);

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      data-testid={TEST_IDS.BookmarkMobileView.wrapper}
    >
      <Drawer
        anchor="left"
        open={tocDrawerOpen}
        onClose={() => setTocDrawerOpen(false)}
        ModalProps={{
          slotProps: {
            backdrop: {
              'data-testid': TEST_IDS.BookmarkMobileView.backdrop,
            } as React.HTMLAttributes<HTMLDivElement>,
          },
        }}
      >
        <Box sx={{ minWidth: 250, padding: 2 }}>{toc}</Box>
      </Drawer>

      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          pb: 2,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
          <Tooltip title={t('bookmarkViewer.mobileView.toc')}>
            <IconButton
              onClick={() => setTocDrawerOpen(prev => !prev)}
              sx={{ mb: 2 }}
              data-testid={TEST_IDS.BookmarkMobileView.toggleToc}
            >
              <TocIcon />
            </IconButton>
          </Tooltip>
          {openInNewTab}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
          {nextButton}
        </Box>
      </Box>

      <Box
        sx={{ flexGrow: 1, width: '100%', minHeight: '50vh', height: '100%' }}
      >
        {viewer}
      </Box>
    </Box>
  );
};
