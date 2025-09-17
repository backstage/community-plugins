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
import Box from '@mui/material/Box';
import CircularProgress, {
  CircularProgressProps,
} from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

/** @public */
export type ProgressColor = Extract<CircularProgressProps['color'], string>;

/**
 * Props for {@link ColumnIconPercent}
 *
 * @public
 */
export interface ColumnIconPercentProps {
  title?: string;
  percent: number;
  color?: ProgressColor;
}

/**
 * A column icon for showing a percentage as a circular gauge
 *
 * @public
 */
export function ColumnIconPercent(props: ColumnIconPercentProps) {
  const inner = (
    <CircularProgressWithLabel
      variant="determinate"
      color={props.color}
      value={props.percent}
    />
  );

  return props.title ? <Tooltip title={props.title}>{inner}</Tooltip> : inner;
}

function CircularProgressWithLabel(props: CircularProgressProps) {
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress variant="determinate" {...props} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography
          variant="caption"
          component="div"
          color="textSecondary"
        >{`${Math.round(props.value ?? 0)}%`}</Typography>
      </Box>
    </Box>
  );
}
