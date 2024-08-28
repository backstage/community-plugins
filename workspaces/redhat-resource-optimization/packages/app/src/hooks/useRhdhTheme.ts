import { getThemes } from '@redhat-developer/red-hat-developer-hub-theme';
import LogoFull from '../components/rhdh-logo/RhdhLogoFull';
import RhdhLogoIcon from '../components/rhdh-logo/RhdhLogoIcon';

/**
 * Change this value to `true` if you want to use the RHDH theme.
 */
const ENABLE_RHDH_THEME = false;

export function useRhdhTheme() {
  return ENABLE_RHDH_THEME
    ? ({
        RhdhLogoFull: LogoFull,
        RhdhLogoIcon: RhdhLogoIcon,
        get themes() {
          return getThemes();
        },
      } as const)
    : null;
}
