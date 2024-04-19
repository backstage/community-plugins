/*
 * Copyright 2020 The Backstage Authors
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
import { makeStyles } from '@material-ui/core/styles';

export type Props = {
  x: number;
  y: number;
  spaces?: number;
  labels?: Array<string>;
};

const onespace = '\u00a0';

const useStyles = makeStyles(theme => ({
  text: {
    pointerEvents: 'none',
    userSelect: 'none',
    fontSize: '10px',
    fill: theme.palette.text.secondary,
  },
}));

const RadarFooter = (props: Props): JSX.Element => {
  const { x, y, spaces = 5, labels } = props;
  const classes = useStyles(props);
  const space = onespace.repeat(spaces);

  return (
    <text
      data-testid="radar-footer"
      transform={`translate(${x}, ${y})`}
      className={classes.text}
    >
      {`▲ moved up${space}▼ moved down`}
      {labels && space}
      {labels?.join(space)}
    </text>
  );
};

export default RadarFooter;
