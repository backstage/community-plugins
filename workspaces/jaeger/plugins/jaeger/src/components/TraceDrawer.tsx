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

import React, { ChangeEvent, useState } from 'react';

import Drawer from '@material-ui/core/Drawer';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import {
  createStyles,
  makeStyles,
  Theme,
  withStyles,
} from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import { Span, Process } from '@backstage-community/plugin-jaeger-common';
import { SpansTable } from './SpansTable';

const useDrawerContentStyles = makeStyles((_theme: Theme) =>
  createStyles({
    header: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    content: {
      height: '80%',
    },
    icon: {
      fontSize: 20,
    },
  }),
);

type TraceDrawerContentProps = {
  trace: Trace;
  close: () => void;
};

const TraceDrawerContent = ({ trace, close }: TraceDrawerContentProps) => {
  const classes = useDrawerContentStyles();

  return (
    <>
      <div className={classes.header}>
        <Grid container justifyContent="flex-start" alignItems="flex-start">
          <Grid item xs={11}>
            <Typography variant="h5">Trace Details</Typography>
          </Grid>
          <Grid item xs={1}>
            <IconButton
              key="dismiss"
              title="Close the drawer"
              onClick={() => close()}
              color="inherit"
            >
              <CloseIcon className={classes.icon} />
            </IconButton>
          </Grid>
          <Grid item xs={12}>
            Trace Id: {trace.traceID} <br />
            Span Count: {trace.spans.length}
          </Grid>
          <Grid item xs={12}>
            <SpansTable spans={trace.spans} processes={trace.processes} />
          </Grid>
        </Grid>
      </div>
    </>
  );
};

const useDrawerStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      width: '50%',
      justifyContent: 'space-between',
      padding: theme.spacing(2.5),
    },
  }),
);

type Trace = {
  traceID: string;
  spans: Span[];
  processes: Record<string, Process>;
};

const DrawerButton = withStyles({
  root: {
    padding: '6px 5px',
  },
  label: {
    textTransform: 'none',
  },
})(Button);
type TraceDrawerProps = {
  open: boolean;
  trace: Trace;
};
export const TraceDrawer = ({ open, trace }: TraceDrawerProps) => {
  const classes = useDrawerStyles();
  const [isOpen, setIsOpen] = useState<boolean>(open ?? false);

  const toggleDrawer = (e: ChangeEvent<{}>, newValue: boolean) => {
    e.stopPropagation();
    setIsOpen(newValue);
  };

  return (
    <>
      <DrawerButton onClick={() => setIsOpen(true)}>
        {trace.traceID}
      </DrawerButton>
      <Drawer
        classes={{
          paper: classes.paper,
        }}
        anchor="right"
        open={isOpen}
        onClose={(e: any) => toggleDrawer(e, false)}
        onClick={event => event.stopPropagation()}
      >
        {isOpen && (
          <TraceDrawerContent trace={trace} close={() => setIsOpen(false)} />
        )}
      </Drawer>
    </>
  );
};
