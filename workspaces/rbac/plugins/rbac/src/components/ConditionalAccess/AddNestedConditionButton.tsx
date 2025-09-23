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
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { MarkdownContent } from '@backstage/core-components';
import { TranslationFunction } from '@backstage/core-plugin-api/alpha';
import { useTranslation } from '../../hooks/useTranslation';
import { rbacTranslationRef } from '../../translations';

export const tooltipTitle = (
  t: TranslationFunction<typeof rbacTranslationRef.T>,
) => (
  <div>
    <Typography variant="body1" component="p" align="center">
      <MarkdownContent
        content={t('conditionalAccess.nestedConditionTooltip')}
      />
    </Typography>
    <Typography variant="body1" component="p" align="center">
      {t('conditionalAccess.nestedConditionExample')}
    </Typography>
  </div>
);

export const AddNestedConditionButton = () => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Typography variant="body1" component="span">
        {t('conditionalAccess.addNestedCondition')}
      </Typography>
      <Tooltip title={tooltipTitle(t)} placement="top">
        <HelpOutlineIcon fontSize="inherit" style={{ marginLeft: '0.25rem' }} />
      </Tooltip>
    </Box>
  );
};
