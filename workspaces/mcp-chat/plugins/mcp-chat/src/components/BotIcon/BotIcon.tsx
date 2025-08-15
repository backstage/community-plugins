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

/*
 * SVG Icon Attribution:
 *
 * Icon: "Chatbot" by Tanmay Goswami from The Noun Project
 * License: Creative Commons (CC BY 3.0)
 * URL: https://thenounproject.com/icon/chatbot-4453381/
 */
import type { FC, SVGProps } from 'react';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface BotIconProps extends SVGProps<SVGSVGElement> {
  /** Size of the icon (width and height) */
  size?: number;
  /** Color of the icon */
  color?: string;
}

export const BotIcon: FC<BotIconProps> = ({
  size = 30,
  color = '#333',
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill={color}
      {...props}
    >
      <path
        d="M71,21.2V5H58v14H41V5H29v15C14.1,22,3,34,3,49v0.7C3,66.1,16.4,79,33.5,79H52V64H33.1C24.5,64,18,57.7,18,49.3v-0.7
        C18,40.3,24.5,34,33.1,34l26.3,0c11.2,0,21.1,8.1,22.7,19.2C84.1,67,73.5,79,60.2,79H52v15h8.7c19.4,0,36-14.5,37.8-33.8
        C100.1,41.8,87.9,25.9,71,21.2z"
      />
      <rect x="31" y="43" width="12" height="12" />
      <rect x="55" y="43" width="12" height="12" />
    </svg>
  );
};

// Backstage IconComponent compatible wrapper
export const BotIconComponent: FC<SvgIconProps> = ({
  fontSize = 'medium',
  color = 'inherit',
  titleAccess,
  htmlColor,
  inheritViewBox,
  shapeRendering,
  ...props
}) => {
  // Map fontSize to size
  const sizeMap = {
    small: 20,
    medium: 24,
    large: 35,
    inherit: 24,
  };

  const size = typeof fontSize === 'string' ? sizeMap[fontSize] || 24 : 24;

  return (
    <BotIcon
      size={size}
      color={color === 'inherit' ? '#B5B5B5' : (color as string)}
      {...props}
    />
  );
};
