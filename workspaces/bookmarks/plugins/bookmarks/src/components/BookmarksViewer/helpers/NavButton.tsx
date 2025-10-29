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

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { PATH_SEPARATOR } from '../../../consts/consts';
import { useTranslation } from '../../../hooks/useTranslation';
import { TEST_IDS } from '../../../consts/testids';

/** Button component for navigating between bookmarks */
export const NavButton = ({
  direction,
  onClick,
  treeKey,
}: {
  direction: 'next' | 'previous';
  onClick: () => void;
  treeKey: string;
}) => {
  const { t } = useTranslation();

  const isNext = direction === 'next';
  const buttonText = t(`bookmarkViewer.navButton.${direction}`);
  /** last path item is the button label */
  const bookmarkName = treeKey.split(PATH_SEPARATOR).pop();

  return (
    <Button
      aria-label={`${buttonText}: ${bookmarkName}`}
      color="inherit"
      data-testid={TEST_IDS.NavButton[direction]}
      onClick={onClick}
      startIcon={
        !isNext ? (
          <ArrowBackIcon sx={{ color: theme => theme.palette.text.primary }} />
        ) : undefined
      }
      endIcon={
        isNext ? (
          <ArrowForwardIcon
            sx={{ color: theme => theme.palette.text.primary }}
          />
        ) : undefined
      }
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: isNext ? 'flex-end' : 'flex-start',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          textAlign: isNext ? 'right' : 'left',
        }}
      >
        <Typography
          component="small"
          sx={{ color: theme => theme.palette.text.secondary }}
          variant="body2"
        >
          {buttonText}
        </Typography>
        <Typography
          component="span"
          variant="body1"
          sx={{ color: theme => theme.palette.text.primary }}
        >
          {bookmarkName}
        </Typography>
      </Box>
    </Button>
  );
};
