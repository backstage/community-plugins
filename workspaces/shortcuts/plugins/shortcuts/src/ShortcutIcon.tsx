/*
 * Copyright 2021 The Backstage Authors
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

import { CSSProperties } from 'react';
import styles from './ShortcutIcon.module.css';

type Props = {
  text: string;
  color: string;
};

export const ShortcutIcon = (props: Props) => {
  const contrastColor = isLight(props.color) ? '#000000' : '#ffffff';

  return (
    <div
      className={styles.avatar}
      style={
        {
          '--avatar-bg-color': props.color,
          '--avatar-contrast-text': contrastColor,
        } as CSSProperties
      }
    >
      {props.text}
    </div>
  );
};

function isLight(color: string): boolean {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
}
