/*
 * Copyright 2026 The Backstage Authors
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

/**
 *
 * TAB ORDER:
 *   Tab 1 — Friction Score Card (default — opens first)
 *   Tab 2 — Friction Heatmap
 *
 * HOW TO ADD A NEW TAB:
 *   1. Create src/components/MyFeature/MyFeature.tsx
 *   2. Import it below in the FEATURE IMPORTS section
 *   3. Add it to HEALERT_TABS — nothing else changes
 *
 * VISIBILITY RULES:
 *   Component kind → renders all features
 *   Service kind   → renders all features
 *   API kind       → returns null
 *   Other kinds    → renders only with healert.io/enabled: 'true'
 */

import { useState } from 'react';
import { Box, Tab, Tabs, makeStyles } from '@material-ui/core';
import { useEntity } from '@backstage/plugin-catalog-react';
import { FrictionScoreCard } from '../FrictionScoreCard/FrictionScoreCard';
import { FrictionHeatmap } from '../FrictionHeatmap/FrictionHeatmap';

// =============================================================================
// FEATURE IMPORTS
// Add one import per new feature here.
// =============================================================================
//
// Example:
//   import { MyFeature } from '../MyFeature/MyFeature';

// =============================================================================
// FEATURE TABS
// Add one entry per new feature — rendered as sub-tabs in order.
// First entry = default tab that opens when user enters the Healert section.
// =============================================================================
//
// Example:
//   { key: 'myfeature', label: 'My Feature', component: <MyFeature /> },

const HEALERT_TABS = [
  {
    key: 'friction',
    label: 'Friction Score',
    component: <FrictionScoreCard />,
  },
  { key: 'heatmap', label: 'Heatmap', component: <FrictionHeatmap /> },
];

// =============================================================================
// STYLES
// =============================================================================

const useStyles = makeStyles(theme => ({
  tabsRoot: {
    borderBottom: '1px solid #E2E8F0',
    marginBottom: theme.spacing(2),
    minHeight: 40,
  },
  tabRoot: {
    minHeight: 40,
    minWidth: 100,
    fontSize: '0.75rem',
    fontWeight: 700,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#64748B',
    padding: '6px 16px',
    '&.Mui-selected': {
      color: '#00B4B4',
    },
  },
  tabIndicator: {
    backgroundColor: '#00B4B4',
    height: 2,
  },
  tabPanel: {
    width: '100%',
  },
}));

// =============================================================================
// CONTAINER
// Do not edit below this line.
// =============================================================================

/** @public */
export function EntityHealertContent() {
  const { entity } = useEntity();
  const classes = useStyles();
  const [activeTab, setActiveTab] = useState(0);

  const kind = entity.kind?.toLowerCase();

  // Never show on API entities, consistent with conditions.ts
  if (kind === 'api') {
    return null;
  }

  const hasOptInAnnotation =
    entity.metadata?.annotations?.['healert.io/enabled'] === 'true';
  const shouldRender =
    kind === 'component' || kind === 'service' || hasOptInAnnotation;
  if (!shouldRender) {
    return null;
  }

  return (
    <Box style={{ width: '100%' }}>
      {/* ── Sub-tabs navigation ── */}
      <Tabs
        value={activeTab}
        onChange={(_e, v) => setActiveTab(v)}
        classes={{ root: classes.tabsRoot, indicator: classes.tabIndicator }}
        aria-label="Healert feature tabs"
      >
        {HEALERT_TABS.map((tab, i) => (
          <Tab
            key={tab.key}
            label={tab.label}
            id={`healert-tab-${i}`}
            aria-controls={`healert-tabpanel-${i}`}
            classes={{ root: classes.tabRoot }}
          />
        ))}
      </Tabs>

      {/* ── Active tab content ── */}
      {HEALERT_TABS.map((tab, i) => (
        <Box
          key={tab.key}
          role="tabpanel"
          id={`healert-tabpanel-${i}`}
          aria-labelledby={`healert-tab-${i}`}
          className={classes.tabPanel}
          style={{ display: activeTab === i ? 'block' : 'none' }}
        >
          {/* Only mount when active — prevents hidden components fetching data */}
          {activeTab === i && tab.component}
        </Box>
      ))}
    </Box>
  );
}
