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
import React from 'react';
import { Box, Button, makeStyles, Theme, Typography } from '@material-ui/core';

type EmptyStateProps = {
  icon: React.ComponentType<any>;
  title: string;
  helperText: string;
  action?: {
    text: string;
    fn: () => void;
  };
};

const useStyles = makeStyles((theme: Theme) => ({
  box: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: theme.spacing(4),
  },
  icon: {
    margin: theme.spacing(4, 0, 2, 0),
    fontSize: theme.typography.h1?.fontSize ?? '4rem',
    fill: 'var(--pf-t--color--gray--50)',
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing(2),
  },
  helperText: {
    marginBottom: theme.spacing(4),
  },
  actionText: {
    textTransform: 'none',
    color: 'var(--pf-t--color--blue--40)',
  },
}));

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  helperText,
  action,
}) => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <Box className={classes.box}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Icon className={classes.icon} />
          <Typography className={classes.title} variant="h6">
            {title}
          </Typography>
          <Typography className={classes.helperText} variant="body1">
            {helperText}
          </Typography>
          {action && (
            <Button onClick={action.fn} className={classes.actionText}>
              {action.text}
            </Button>
          )}
        </Box>
      </Box>
    </React.Fragment>
  );
};
