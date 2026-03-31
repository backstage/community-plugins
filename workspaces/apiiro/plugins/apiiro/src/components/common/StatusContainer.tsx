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
import { ComponentType, Fragment, ReactNode } from 'react';
import Box from '@mui/material/Box';
import { styled, useTheme } from '@mui/material/styles';
import { ApiiroLogo } from '../../assets/apiiroLogo';
import { getLogoContainerColors } from '../../theme/themeUtils';
import { NotFound } from './NotFound';
import { SomethingWentWrong } from './SomethingWentWrong';
import { LogoSpinner } from './logoSpinner';

const LogoContainer = styled(Box)(({ theme }) => {
  const logoColors = getLogoContainerColors(theme);
  return {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '12px 15px',
    gap: '10px',
    width: '109px',
    height: '40px',
    background: logoColors.background,
    borderRadius: '10px',
    '& svg': {
      width: '79px',
      height: '22px',
      '& path': {
        fill: logoColors.logoFill,
      },
    },
  };
});

type StatusContainerProps = {
  isLoading: boolean;
  error?: { details?: { status?: number } } | null;
  isEmpty: boolean;
  notFoundMessage?: string;
  wrapper?: ComponentType<{ children: ReactNode }>;
  children: ReactNode;
  showLogo?: boolean;
};

export const StatusContainer = ({
  isLoading,
  error,
  isEmpty,
  notFoundMessage = 'No results found.',
  wrapper: Wrapper = Fragment,
  children,
  showLogo = true,
}: StatusContainerProps) => {
  const theme = useTheme();

  const containerSx = {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '12px',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
  };

  if (isLoading) {
    return (
      <Wrapper>
        <Box
          display="flex"
          justifyContent={showLogo ? 'flex-start' : 'center'}
          alignItems="center"
          flexDirection="column"
          minHeight="300px"
          sx={containerSx}
        >
          {showLogo && (
            <LogoContainer sx={{ alignSelf: 'flex-end' }}>
              <ApiiroLogo />
            </LogoContainer>
          )}
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={showLogo ? '250px' : '300px'}
          >
            <LogoSpinner />
          </Box>
        </Box>
      </Wrapper>
    );
  }

  if (error) {
    return (
      <Wrapper>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          minHeight="300px"
          sx={containerSx}
        >
          {showLogo && (
            <LogoContainer sx={{ alignSelf: 'flex-end' }}>
              <ApiiroLogo />
            </LogoContainer>
          )}
          <SomethingWentWrong statusCode={error?.details?.status} />
        </Box>
      </Wrapper>
    );
  }

  if (isEmpty) {
    return (
      <Wrapper>
        <Box
          display="flex"
          justifyContent={showLogo ? 'flex-start' : 'center'}
          alignItems="center"
          flexDirection="column"
          minHeight="300px"
          sx={containerSx}
        >
          {showLogo && (
            <LogoContainer sx={{ alignSelf: 'flex-end' }}>
              <ApiiroLogo />
            </LogoContainer>
          )}
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={showLogo ? '250px' : '300px'}
          >
            <NotFound message={notFoundMessage} />
          </Box>
        </Box>
      </Wrapper>
    );
  }

  return <>{children}</>;
};
