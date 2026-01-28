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
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled, useTheme } from '@mui/material/styles';
import CustomTooltip from './CustomTooltip';

export interface ChartBoxProps {
  title: string;
  tooltip?: string;
  children: React.ReactNode;
  width?: string | number;
  height?: string | number;
  footer?: React.ReactNode;
  customHeader?: React.ReactNode;
  alignContent?: 'center' | 'flex-start' | 'flex-end';
}

const StyledChartBox = styled(Box)<{
  width?: string | number;
  height?: string | number;
}>(({ theme, width, height }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '12px',
  padding: '16px',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  width: width || 'fit-content',
  height: height || 'auto',
  margin: width === '100%' ? '0' : '0 auto',
  maxWidth: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
}));

const HeaderContainer = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '12px',
}));

const TitleContainer = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 400,
  fontSize: '16px',
  lineHeight: '24px',
  color: theme.palette.text.primary,
}));

const ContentContainer = styled(Box)<{ alignContent?: string }>(
  ({ alignContent }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: alignContent || 'center',
    width: '100%',
    flex: 1,
  }),
);

export const ChartBox = ({
  title,
  tooltip,
  children,
  width,
  height = '366px',
  footer,
  customHeader,
  alignContent,
}: ChartBoxProps) => {
  const theme = useTheme();
  return (
    <StyledChartBox width={width} height={height}>
      {customHeader || (
        <HeaderContainer>
          <TitleContainer>
            <StyledTitle>{title}</StyledTitle>
          </TitleContainer>
          {tooltip && (
            <CustomTooltip title={tooltip} placement="top">
              <div
                style={{
                  width: '15px',
                  height: '15px',
                  borderRadius: '50%',
                  border: `1px solid ${theme.palette.text.disabled}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: theme.palette.text.disabled,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                }}
              >
                i
              </div>
            </CustomTooltip>
          )}
        </HeaderContainer>
      )}

      <ContentContainer alignContent={alignContent}>
        {children}
      </ContentContainer>

      {footer && <Box>{footer}</Box>}
    </StyledChartBox>
  );
};

export default ChartBox;
