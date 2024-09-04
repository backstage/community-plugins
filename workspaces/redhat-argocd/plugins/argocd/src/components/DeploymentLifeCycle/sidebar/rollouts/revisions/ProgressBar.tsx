import React, { useEffect, useState } from 'react';

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
