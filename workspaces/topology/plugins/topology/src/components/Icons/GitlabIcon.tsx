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

const GitlabIcon = ({
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
          d="M105.2 24.9c-3.1-8.9-15.7-8.9-18.9 0L29.8 199.7h132c-.1 0-56.6-174.8-56.6-174.8zM.9 287.7c-2.6 8 .3 16.9 7.1 22l247.9 184-226.2-294zm160.8-88l94.3 294 94.3-294zm349.4 88l-28.8-88-226.3 294 247.9-184c6.9-5.1 9.7-14 7.2-22zM425.7 24.9c-3.1-8.9-15.7-8.9-18.9 0l-56.6 174.8h132z"
          fill="var(--pf-t--global--icon--color--subtle)"
        />
      </g>
    </svg>
  );
};

export default GitlabIcon;
