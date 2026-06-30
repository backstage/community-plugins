/*
 * Copyright 2020 The Backstage Authors
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

import { Circle } from 'rc-progress';
import styles from './Percentage.module.css';

export const Percentage = ({ value }: { value?: string }) => {
  // Use theme tokens from CSS variables, fallback to SonarQube default colors
  const getStyleValue = (propertyName: string, fallback: string): string => {
    if (typeof window === 'undefined') return fallback;
    const colorValue = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue(propertyName)
      .trim();
    return colorValue || fallback;
  };

  const okColor = getStyleValue('--sonarqube-percentage-ok', '#1db679');
  const errorColor = getStyleValue('--sonarqube-percentage-error', '#e82c3c');

  return (
    <Circle
      strokeLinecap="butt"
      percent={+(value || 0)}
      strokeWidth={16}
      strokeColor={okColor}
      trailColor={errorColor}
      trailWidth={16}
      className={styles.root}
    />
  );
};
