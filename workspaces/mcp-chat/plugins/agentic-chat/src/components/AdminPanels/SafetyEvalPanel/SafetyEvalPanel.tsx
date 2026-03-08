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
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ShieldIcon from '@mui/icons-material/Shield';
import WarningIcon from '@mui/icons-material/Warning';
import { SafetyShieldsSection } from './SafetyShieldsSection';
import { SafetyPatternsSection } from './SafetyPatternsSection';

const TABS_SX = {
  minHeight: 32,
  '& .MuiTab-root': {
    minHeight: 32,
    textTransform: 'none',
    fontSize: '0.8125rem',
    minWidth: 'auto',
    px: 2,
    mr: 0.5,
  },
} as const;

type SubTab = 'shields' | 'patterns';

interface Props {
  providerName?: string;
  effectiveConfig?: Record<string, unknown> | null;
  onConfigSaved?: () => void;
}

export const SafetyEvalPanel = ({
  providerName = 'Agent Platform',
  effectiveConfig,
  onConfigSaved,
}: Props) => {
  const [activeTab, setActiveTab] = useState<SubTab>('shields');

  return (
    <Box
      sx={{
        p: 3,
        width: '100%',
        maxWidth: 960,
        mx: 'auto',
      }}
    >
      <Typography variant="h5" gutterBottom>
        Safety
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        {`Configure ${providerName} safety shields and keyword-based guardrails.`}
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v as SubTab)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={TABS_SX}
        >
          <Tab
            icon={<ShieldIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Shields"
            value="shields"
          />
          <Tab
            icon={<WarningIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Patterns"
            value="patterns"
          />
        </Tabs>
      </Box>

      {activeTab === 'shields' && (
        <SafetyShieldsSection
          providerName={providerName}
          effectiveConfig={effectiveConfig}
          onConfigSaved={onConfigSaved}
        />
      )}
      {activeTab === 'patterns' && (
        <SafetyPatternsSection
          effectiveConfig={effectiveConfig}
          onConfigSaved={onConfigSaved}
        />
      )}
    </Box>
  );
};
