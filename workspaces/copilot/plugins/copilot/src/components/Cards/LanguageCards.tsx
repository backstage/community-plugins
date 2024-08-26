import React, { PropsWithChildren } from 'react';
import LanguageIcon from '@mui/icons-material/Language';
import Box from '@mui/material/Box';
import { Card } from './Card';
import { getLanguageStats } from '../../utils';
import { CardsProps } from '../../types';
import { styled } from '@mui/material/styles';

const CardBox = styled(Box)(() => ({
  flex: '1 1 0',
  maxWidth: 354,
}));

export const LanguageCards = ({
  metrics,
  startDate,
  endDate,
}: PropsWithChildren<CardsProps>) => {
  const languageStats = getLanguageStats(metrics);

  return (
    <Box display="flex" flexWrap="wrap" gap={2}>
      <CardBox>
        <Card
          title="Nº of Languages"
          value={metrics.length ? languageStats.length : 'N/A'}
          startDate={startDate}
          endDate={endDate}
          icon={() => (
            <LanguageIcon style={{ color: '#007acc' }} fontSize="large" />
          )}
        />
      </CardBox>
    </Box>
  );
};
