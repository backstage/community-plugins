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

import { Box, Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  botAvatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    objectFit: 'contain' as const,
  },
}));

/**
 * Props for the PageHeader component
 * @public
 */
export interface PageHeaderProps {
  botName: string;
  botIcon?: string;
}

/** @public */
export function PageHeader({ botName, botIcon }: PageHeaderProps) {
  const classes = useStyles();

  if (!botIcon) {
    return (
      <Typography variant="h6" color="textPrimary">
        {botName} - AI Platform Engineer
      </Typography>
    );
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      mb={2}
      className={classes.headerContent}
    >
      <img src={botIcon} alt={botName} className={classes.botAvatar} />
      <Typography variant="h6" color="textPrimary">
        {botName} - AI Platform Engineer
      </Typography>
    </Box>
  );
}
