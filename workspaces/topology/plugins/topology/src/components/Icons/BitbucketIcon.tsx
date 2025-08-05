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

const BitbucketIcon = ({
  style,
  title,
}: {
  style: CSSProperties;
  title: string;
}): ReactElement => {
  return (
    <svg
      height="1em"
      width="1em"
      version="1.1"
      viewBox="0 0 512 512"
      style={style}
    >
      <g fillRule="evenodd" stroke="none" strokeWidth="1" fill="none">
        {title && <title>{title}</title>}
        <path
          d="M22.2 32A16 16 0 0 0 6 47.8a26.35 26.35 0 0 0 .2 2.8l67.9 412.1a21.77 21.77 0 0 0 21.3 18.2h325.7a16 16 0 0 0 16-13.4L505 50.7a16 16 0 0 0-13.2-18.3 24.58 24.58 0 0 0-2.8-.2L22.2 32zm285.9 297.8h-104l-28.1-147h157.3l-25.2 147z"
          fill="var(--pf-t--global--icon--color--subtle)"
        />
      </g>
    </svg>
  );
};

export default BitbucketIcon;
