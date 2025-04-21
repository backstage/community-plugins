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
import { useEffect, useState } from 'react';

import { Progress } from '@patternfly/react-core';

import { ReplicaSet } from '../../../../../types/resources';
import RevisionImage from './RevisionImage';

const ProgressBar = ({
  revision,
  percentage,
  duration = 2000,
}: {
  revision: ReplicaSet;
  percentage: number;
  duration?: number;
}) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (currentValue === percentage) return undefined;

    const difference = percentage - (currentValue || 0);
    const safeDuration = duration > 0 ? duration : 1;
    // Calculate step per 30ms
    const step = difference / (safeDuration / 30);

    const interval = setInterval(() => {
      setCurrentValue(prevValue => {
        const newValue = prevValue + step;

        if (
          (step > 0 && newValue >= percentage) ||
          (step < 0 && newValue <= percentage)
        ) {
          clearInterval(interval);
          return Math.max(0, Math.min(percentage, 100));
        }

        return Math.max(0, Math.min(newValue, 100));
      });
    }, 10);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percentage, duration]);

  return (
    <Progress
      value={currentValue}
      min={0}
      max={100}
      title={<RevisionImage revision={revision} />}
    />
  );
};
export default ProgressBar;
