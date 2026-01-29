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
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

/** @public */
export const ApiiroSmall = (props: SvgIconProps): JSX.Element => (
  <SvgIcon
    {...props}
    viewBox="0 0 42 42"
    sx={{
      width: 42,
      height: 42,
      ...props.sx,
    }}
  >
    <path d="M21 0 0 21.293 21 42 9.855 21.293zM21 0l21 21.293L21 42l11.145-20.707z" />
  </SvgIcon>
);
