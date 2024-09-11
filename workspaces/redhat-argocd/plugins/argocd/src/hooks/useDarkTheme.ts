import React from 'react';

import { useTheme } from '@material-ui/core/styles';

const THEME_DARK = 'dark';
const THEME_DARK_CLASS = 'pf-v5-theme-dark';

export const useDarkTheme = () => {
  const {
    palette: { type },
  } = useTheme();

  React.useEffect(() => {
    const htmlTagElement = document.documentElement;
    if (type === THEME_DARK) {
      htmlTagElement.classList.add(THEME_DARK_CLASS);
    } else {
      htmlTagElement.classList.remove(THEME_DARK_CLASS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);
};
