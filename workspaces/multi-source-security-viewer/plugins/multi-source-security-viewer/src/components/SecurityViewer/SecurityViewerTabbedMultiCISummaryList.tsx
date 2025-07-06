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
import type { FC, ChangeEvent, SyntheticEvent } from 'react';

import { useState, Fragment } from 'react';
import { Box, Tabs, Tab, makeStyles, Theme } from '@material-ui/core';
import { MultiCIConfig } from '../../types/multiCI';
import { SecurityViewerPipelineSummary } from './SecurityViewerPipelineSummaryList';

type SecurityViewerTabbedMultiCISummaryListProps = {
  multiCIConfig: MultiCIConfig[];
};

const useStyles = makeStyles((theme: Theme) => ({
  tabbedContent: {
    marginTop: theme.spacing(4),
  },
}));

export const SecurityViewerTabbedMultiCISummaryList: FC<
  SecurityViewerTabbedMultiCISummaryListProps
> = ({ multiCIConfig }) => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState(0);
  const handleChange = (
    _event: ChangeEvent<{}> | SyntheticEvent,
    newValue: number,
  ) => {
    setTabValue(newValue);
  };

  return (
    <Fragment>
      <Box>
        <Tabs value={tabValue} onChange={handleChange} aria-label="Multi CI">
          {(multiCIConfig ?? []).map((config, index) => (
            <Tab label={config.title} key={index} aria-label={config.title} />
          ))}
        </Tabs>

        <Box className={classes.tabbedContent}>
          {(multiCIConfig ?? []).map((_, index) => (
            <Box key={`security-viewer-box-${index}`}>
              {tabValue === index && (
                <SecurityViewerPipelineSummary
                  key={`security-viewer-summary-${index}`}
                  apiRef={multiCIConfig[index].apiRef}
                />
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Fragment>
  );
};
