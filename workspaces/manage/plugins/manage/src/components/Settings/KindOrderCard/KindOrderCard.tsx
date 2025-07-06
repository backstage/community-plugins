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

import { capitalize } from '@mui/material/utils';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';

import {
  pluralizeKind,
  ReorderableTabs,
  useKindOrder,
  useOwnedKinds,
  useSetKindOrder,
} from '@backstage-community/plugin-manage-react';

/**
 * The KindOrder card that is displayed in the default settings page.
 *
 * @public
 */
export function KindOrderCard() {
  const setTabOrder = useSetKindOrder();

  const onReset = useCallback(() => {
    setTabOrder([]);
  }, [setTabOrder]);

  const kinds = useOwnedKinds();
  const orderedKinds = useKindOrder(kinds);

  const orderedTabs = useMemo(
    () =>
      orderedKinds.map(kind => ({
        id: kind,
        title: capitalize(pluralizeKind(kind)),
      })),
    [orderedKinds],
  );

  return (
    <Card>
      <CardHeader
        title="Kind order"
        subheader="Reorder the entity kinds to your liking by dragging them"
        action={
          <Button aria-label="reset" onClick={onReset}>
            Reset
          </Button>
        }
      />
      <CardContent>
        <Box>
          <ReorderableTabs tabs={orderedTabs} onChange={setTabOrder} />
        </Box>
      </CardContent>
    </Card>
  );
}
