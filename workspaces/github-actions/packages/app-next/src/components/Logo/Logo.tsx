import { useTheme } from '@material-ui/core';
import React from 'react';
import defaultLogoLight from './black.png';
import defaultLogoDark from './white.png';
import { BACKSTAGE_HEADER_HEIGHT } from '../../App';

export default function Logo() {
  const theme = useTheme();

  return (
    <img
      alt="Logo"
      data-testid="spotify-backstage-logo"
      height={BACKSTAGE_HEADER_HEIGHT - 32}
      src={theme.palette.type === 'dark' ? defaultLogoDark : defaultLogoLight}
    />
  );
}
