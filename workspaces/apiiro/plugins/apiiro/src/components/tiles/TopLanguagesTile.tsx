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
import { styled, useTheme } from '@mui/material/styles';
import { getBlueColorVariants, getOtherColor } from '../../theme/themeUtils';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { languageIconMap, LanguageKey } from '../common/languageIcons';
import { CustomTooltip } from '../common';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChartBox } from '../common/ChartBox';
import PieChart, { PieChartData } from '../charts/PieChart';
import { ApiiroSmall } from '../../assets/apiiroLogo';
import { NotFound } from '../common';
import Divider from '@mui/material/Divider';

export interface TopLanguagesTileProps {
  title?: string;
  tooltip?: string;
  data?: Record<string, number> | undefined;
  width?: string | number;
  height?: string | number;
}

const LegendContainer = styled(Box)(() => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '6px',
}));

const LegendItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  color: theme.palette.text.secondary,
}));

const LegendColor = styled('div')<{ color: string }>(({ color }) => ({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: color,
  flexShrink: 0,
}));

const CustomHeader = styled(Box)(() => ({
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

const mapLanguagePercentagesToPieData = (
  languagePercentages: Record<string, number>,
): PieChartData[] =>
  Object.entries(languagePercentages)
    .map(([language, value], index) => {
      // Ensure value is a valid number, default to 0 if not
      const numericValue =
        typeof value === 'number' && !isNaN(value) ? value : 0;
      return {
        id: `${language.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index}`,
        label: language,
        value: numericValue,
      };
    })
    .filter(item => item.value > 0);

export const TopLanguagesTile = ({
  title = 'Top languages',
  data = {},
  width = '100%',
}: TopLanguagesTileProps) => {
  const theme = useTheme();
  const blueColorVariants = getBlueColorVariants(theme);
  const otherColor = getOtherColor(theme);

  const chartData = useMemo(() => {
    if (data && Object.keys(data).length > 0) {
      const mappedData = mapLanguagePercentagesToPieData(data);
      if (mappedData.length > 0) {
        return mappedData;
      }
    }

    return [];
  }, [data]);

  const [processedData, setProcessedData] = useState<PieChartData[]>(chartData);

  useEffect(() => {
    setProcessedData(chartData);
  }, [chartData]);

  const customHeader = (
    <CustomHeader>
      <TitleContainer>
        <StyledTitle>{title}</StyledTitle>
        <ApiiroSmall sx={{ width: 20, height: 20, color: 'text.primary' }} />
      </TitleContainer>
    </CustomHeader>
  );
  // Generate colors for legend items based on data length
  const generateColor = useCallback(
    (index: number, itemId: string): string => {
      // If item id is "other", always use the other color
      if (itemId === 'other') {
        return otherColor;
      }

      // If index is within blue variants, use blue colors
      if (index < blueColorVariants.length) {
        return blueColorVariants[index];
      }

      // For additional items beyond blue variants, use the other color
      return otherColor;
    },
    [blueColorVariants, otherColor],
  );

  const legend = (
    <LegendContainer>
      {processedData.slice(0, 5).map((item, index) => (
        <LegendItem key={item.id}>
          <LegendColor color={item.color || generateColor(index, item.id)} />
          <Typography variant="caption">{item.label}</Typography>
        </LegendItem>
      ))}
      {processedData.length > 5 && (
        <CustomTooltip
          title={
            <List dense disablePadding>
              {processedData.slice(5).map(item => {
                const LanguageIcon =
                  languageIconMap[item.label as LanguageKey] ||
                  languageIconMap['Unknown' as LanguageKey];

                return (
                  <ListItem
                    key={item.id}
                    disableGutters
                    disablePadding
                    sx={{ py: 0.5, px: 1, minWidth: 200 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <LanguageIcon />
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{ fontSize: '12px', color: 'text.primary' }}
                        >
                          {item.label}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '12px',
                          color: 'text.primary',
                          fontWeight: 400,
                        }}
                      >
                        {Math.round(item.value)}%
                      </Typography>
                    </Box>
                  </ListItem>
                );
              })}
              <Divider />
              <Typography
                variant="body2"
                sx={{ py: 1, fontSize: '12px', color: 'text.primary' }}
              >
                Less then 0.1%
              </Typography>
            </List>
          }
          placement="top"
        >
          <LegendItem>
            <LegendColor color={generateColor(-1, 'other')} />
            <Typography variant="caption">Other</Typography>
          </LegendItem>
        </CustomTooltip>
      )}
    </LegendContainer>
  );

  // Show message when no data is available
  if (Object.keys(data).length === 0 || processedData.length === 0) {
    return (
      <ChartBox title={title} width={width} customHeader={customHeader}>
        <NotFound />
      </ChartBox>
    );
  }

  return (
    <ChartBox
      title={title}
      width={width}
      footer={legend}
      customHeader={customHeader}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          flex: 1,
          minHeight: 0,
        }}
      >
        <PieChart
          data={chartData}
          width={310}
          height={310}
          generateColor={generateColor}
          onDataProcessed={setProcessedData}
        />
      </div>
    </ChartBox>
  );
};

export default TopLanguagesTile;
