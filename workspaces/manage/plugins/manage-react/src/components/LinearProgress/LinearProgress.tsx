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

/* eslint-disable react/forbid-elements */

export interface LinearProgressProps {
  style?: React.CSSProperties;
  /** Color of the progress bar */
  color: string;
  /** Percentage betwen 0 and 100 */
  value: number;
}

export function LinearProgress(props: LinearProgressProps) {
  const { style = {}, color, value } = props;

  style.position = 'relative';
  style.overflow = 'hidden';
  style.display = 'block';
  style.zIndex = 0;
  style.width ??= '100%';
  style.height ??= '4px';

  return (
    <span style={style}>
      <span
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateX(-${100 - value}%)`,
          backgroundColor: color,
          height: '100%',
        }}
      />
      <span
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          backgroundColor: color,
          opacity: 0.35,
          height: '100%',
        }}
      />
    </span>
  );
}
