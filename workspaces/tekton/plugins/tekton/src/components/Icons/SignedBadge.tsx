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
import type { HTMLProps, FC, ReactElement } from 'react';

const SignedBadgeIcon: FC<HTMLProps<SVGElement>> = ({
  style,
}): ReactElement => {
  return (
    <svg version="1.1" viewBox="0 0 24 24" style={style}>
      <g fillRule="evenodd" stroke="none" strokeWidth="1" fill="none">
        <path
          d="M10.9 15.1L16.6 9.39998L15.55 8.37498L10.975 12.95L8.45 10.425L7.35 11.525L10.9 15.1ZM12 21.975C9.66667 21.3916 7.75 20.0375 6.25 17.9125C4.75 15.7875 4 13.4583 4 10.925V4.97498L12 1.97498L20 4.97498V10.925C20 13.4583 19.25 15.7875 17.75 17.9125C16.25 20.0375 14.3333 21.3916 12 21.975Z"
          fill="#757575"
        />
      </g>
    </svg>
  );
};

export default SignedBadgeIcon;
