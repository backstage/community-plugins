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
import type { FC } from 'react';
import { t_color_red_50 as criticalColor } from '@patternfly/react-tokens';
import { SvgIconProps } from '@material-ui/core';

export const CriticalRiskIcon: FC<SvgIconProps> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 925 1024"
      fill={criticalColor.value}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M897.86597,252.24865 L491.105712,7.96742801 C473.40731,-2.65897781 451.300057,-2.65597516 433.611654,7.97743687 L27.1213875,252.245648 C10.3059556,262.353595 0.0163032058,280.549701 0.0163032058,300.182078 L0.0163032058,967.971163 C-1.04266102,1010.81008 49.7156241,1038.89994 85.4314175,1015.41816 C85.4304175,1015.42016 432.807682,798.630273 432.807682,798.630273 C450.891071,787.348287 473.816296,787.342282 491.906685,798.624268 L839.584939,1015.4612 C875.297732,1039.03406 926.031018,1010.73602 924.984054,968.003192 C924.985054,968.005193 924.985054,300.192087 924.985054,300.192087 C924.985054,280.552703 914.688401,262.353595 897.86597,252.24865" />
    </svg>
  );
};
