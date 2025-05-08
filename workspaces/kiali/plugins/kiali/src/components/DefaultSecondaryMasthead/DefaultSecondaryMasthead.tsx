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
import { Grid, IconButton, Tooltip } from '@material-ui/core';
import Refresh from '@material-ui/icons/Refresh';
import { default as React } from 'react';

type DefaultProps = {
  hideNamespaceSelector?: boolean;
  elements?: JSX.Element[];
  showClusterSelector?: boolean;
  onRefresh: () => void;
};

const defaultStyle: React.CSSProperties = { marginTop: '25px', float: 'left' };
const justReloadStyle: React.CSSProperties = { marginTop: '0', float: 'right' };

export const DefaultSecondaryMasthead: React.FC<DefaultProps> = (
  props: DefaultProps,
) => {
  return (
    <Grid container spacing={1} direction="row">
      {props.elements?.map(element => {
        return element;
      })}
      <Grid item xs={props.elements && props.elements.length > 0 ? 1 : 12}>
        <Tooltip
          title="Refresh"
          style={
            props.elements && props.elements.length > 0
              ? defaultStyle
              : justReloadStyle
          }
        >
          <IconButton
            color="primary"
            aria-label="upload picture"
            component="label"
            onClick={props.onRefresh}
          >
            <Refresh />
          </IconButton>
        </Tooltip>
      </Grid>
    </Grid>
  );
};
