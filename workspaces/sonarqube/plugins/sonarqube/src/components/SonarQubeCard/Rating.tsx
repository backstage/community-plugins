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

import { useMemo } from 'react';
import styles from './Rating.module.css';

export const Rating = ({
  rating,
  hideValue,
}: {
  rating?: string;
  hideValue?: boolean;
}) => {
  const ratingProp = useMemo(() => {
    switch (rating) {
      case '1.0':
        return {
          name: 'A',
          className: styles.ratingA,
        };

      case '2.0':
        return {
          name: 'B',
          className: styles.ratingB,
        };

      case '3.0':
        return {
          name: 'C',
          className: styles.ratingC,
        };

      case '4.0':
        return {
          name: 'D',
          className: styles.ratingD,
        };

      case '5.0':
        return {
          name: 'E',
          className: styles.ratingE,
        };

      default:
        return {
          name: '',
          className: styles.ratingDefault,
        };
    }
  }, [rating]);

  return (
    <div className={ratingProp.className}>{!hideValue && ratingProp.name}</div>
  );
};
