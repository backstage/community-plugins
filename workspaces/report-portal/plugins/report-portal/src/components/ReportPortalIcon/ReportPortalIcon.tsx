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

import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

/** @public */
export const ReportPortalIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon viewBox="0 0 31 31" {...props}>
      <path d="M15.4885 6.22788L23.8044 10.8581V15.8268L29.5248 12.6418V8.20391C29.5248 7.87542 29.3431 7.57189 29.0481 7.40764L15.9652 0.123184C15.6702 -0.0410613 15.3068 -0.0410613 15.0118 0.123184L1.92885 7.40764C1.63387 7.57189 1.45215 7.87542 1.45215 8.20391V14.1728L15.4885 6.22788Z" />
      <path d="M1.45215 18.4086V22.7728C1.45215 23.1013 1.63387 23.4049 1.92885 23.5691L15.0118 30.8536C15.3068 31.0178 15.6702 31.0178 15.9652 30.8536L29.0481 23.5691C29.3431 23.4049 29.5248 23.1013 29.5248 22.7728V16.9057L15.4885 24.7489L7.17254 20.1186V15.2236L1.45215 18.4086Z" />
    </SvgIcon>
  );
};
