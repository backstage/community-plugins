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
import { useCallback, useMemo } from 'react';

import ResetIcon from '@mui/icons-material/RestartAlt';

import { Box, Button } from '@backstage/ui';

import { ReorderableTabs } from '@backstage-community/plugin-manage-react';

import { useSetTabsOrder, useRemoveTabsOrder } from '../../TabsOrder';
import { useSettings } from '../SettingsProvider';
import { SettingsCard } from '../SettingsCard/SettingsCard';
/**
 * The TabOrder card that is displayed in the default settings page.
 *
 * @public
 */
export function TabOrderCard() {
  const { tabs } = useSettings();

  const setTabOrder = useSetTabsOrder();
  const removeTabOrder = useRemoveTabsOrder();

  const onReset = useCallback(() => {
    removeTabOrder();
  }, [removeTabOrder]);

  const orderedTabs = useMemo(
    () => tabs.map(tab => ({ id: tab.path, title: tab.title })),
    [tabs],
  );

  return (
    <SettingsCard
      setting={{
        title: 'Tab order',
        subtitle: 'Reorder the tabs to your liking by dragging them',
        action: (
          <Button
            aria-label="reset"
            variant="secondary"
            iconStart={<ResetIcon />}
            onClick={onReset}
          >
            Reset
          </Button>
        ),
        element: (
          <Box>
            <ReorderableTabs tabs={orderedTabs} onChange={setTabOrder} />
          </Box>
        ),
      }}
    />
  );
}
