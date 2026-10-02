/*
 * Copyright 2023 The Backstage Authors
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

import { Card, CardBody, List, ListRow } from '@backstage/ui';
import { RiAlertLine } from '@remixicon/react';

const Warnings = ({ warnings }) => {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardBody>
        <List
          aria-label="Warnings"
          items={warnings.map((warn, i) => ({ ...warn, id: String(i) }))}
          selectionMode="none"
        >
          {item => (
            <ListRow
              id={item.id}
              icon={<RiAlertLine size={20} />}
              description={item.secondary}
            >
              {item.primary}
            </ListRow>
          )}
        </List>
      </CardBody>
    </Card>
  );
};

export default Warnings;
