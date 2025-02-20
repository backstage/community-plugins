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
import React from 'react';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { BackstageTheme } from '@backstage/theme';
import { Link } from '@backstage/core-components';

const useStyles = makeStyles<BackstageTheme>(theme => ({
  root: {
    minWidth: 260,
    position: 'relative',
    '&::before': {
      left: -16,
      position: 'absolute',
      width: '4px',
      height: '100%',
      content: '""',
      backgroundColor: theme.palette.status.error,
      borderRadius: 2,
    },
  },
  text: {
    marginBottom: 0,
  },
}));

export const KeyCell = ({
  keyvaluePair,
}: {
  keyvaluePair: { key: string; value: number };
}) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Typography
        variant="body1"
        display="block"
        gutterBottom
        className={classes.text}
      >
        {keyvaluePair.key}
      </Typography>
    </div>
  );
};
export const ValueCell = ({
  keyvaluePair,
}: {
  keyvaluePair: { key: string; value: number };
}) => {
  const classes = useStyles();
  return (
    <div>
      <Typography
        variant="body1"
        display="block"
        gutterBottom
        className={classes.text}
      >
        {keyvaluePair.value}
      </Typography>
    </div>
  );
};

export const StringCell = ({ text }: { text: string }) => {
  const classes = useStyles();
  return (
    <div>
      <Typography
        variant="body1"
        display="block"
        gutterBottom
        className={classes.text}
      >
        {text}
      </Typography>
    </div>
  );
};

export const LinkCell = ({ text, url }: { text: string; url: string }) => {
  const classes = useStyles();
  return (
    <div>
      <Link to={url}>
        <Typography
          variant="body1"
          display="block"
          gutterBottom
          className={classes.text}
        >
          {text}
        </Typography>
      </Link>
    </div>
  );
};
