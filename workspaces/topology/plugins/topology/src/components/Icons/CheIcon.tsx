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
import type { CSSProperties, ReactElement } from 'react';

const CheIcon = ({ style }: { style: CSSProperties }): ReactElement => {
  return (
    <svg
      height="1em"
      width="1em"
      version="1.1"
      viewBox="0 0 47 57"
      style={style}
    >
      <g fillRule="evenodd" stroke="none" strokeWidth="1" fill="none">
        <path
          d="M0.032227,30.88l-0.032227-17.087,23.853-13.793,23.796,13.784-14.691,8.51-9.062-5.109-23.864,13.695z"
          fill="#fdb940"
        />
        <path
          d="M0,43.355l23.876,13.622,23.974-13.937v-16.902l-23.974,13.506-23.876-13.506v17.217z"
          fill="#525c86"
        />
      </g>
    </svg>
  );
};

export default CheIcon;
