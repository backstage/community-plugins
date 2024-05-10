import React, { useState, useEffect } from 'react';
import { Theme, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    fontSize: 12,
  },
  positive: {
    color: theme.palette.success.dark,
  },
  negative: {
    color: theme.palette.error.dark,
  },
}));

export const MetricCounter = ({
  number,
  suffix,
  lessIsMore,
}: {
  number: number;
  suffix: string;
  lessIsMore?: boolean;
}) => {
  const [currentNumber, setCurrentNumber] = useState(number);
  const [diff, setDiff] = useState(0);
  const styles = useStyles();

  const diffNumbers = (a: number, b: number) => {
    return a > b ? a - b : b - a;
  };

  useEffect(() => {
    setDiff(diffNumbers(currentNumber, number));
    setCurrentNumber(number);
  }, [currentNumber, number]);

  const generateDiff = () => {
    if (diff === 0) {
      return null;
    }

    if (diff > 0) {
      return `+${diff}`;
    }

    return `${diff}`;
  };

  const getClassName = () => {
    if (!lessIsMore) {
      return diff > 0 ? styles.positive : styles.negative;
    }

    return diff > 0 ? styles.negative : styles.positive;
  };

  return (
    <>
      <span className={getClassName()}>{generateDiff()}</span>
      <span>
        {currentNumber}
        {suffix}
      </span>
    </>
  );
};
