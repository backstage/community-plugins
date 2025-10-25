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

import { useElementFilter } from '@backstage/core-plugin-api';
import { Grid, Theme, Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  label: {
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    fontSize: '10px',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  value: {
    fontWeight: 'bold',
    overflow: 'hidden',
    lineHeight: '24px',
    wordBreak: 'break-word',
  },
}));

export interface ServiceDetailsFieldProps {
  label: string;
  value?: string;
  gridSizes?: Record<string, number>;
  children?: React.ReactNode;
}

export const ServiceDetailsField = (props: ServiceDetailsFieldProps) => {
  const { label, value, gridSizes, children } = props;
  const classes = useStyles();

  const childElements = useElementFilter(children, c => c.getElements());

  const content =
    childElements.length > 0 ? (
      childElements
    ) : (
      <Typography variant="body1" className={classes.value}>
        {value || 'unknown'}
      </Typography>
    );

  return (
    <Grid item {...gridSizes}>
      <Typography variant="h2" className={classes.label}>
        {label}
      </Typography>
      {content}
    </Grid>
  );
};
