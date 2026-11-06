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
import { useApi } from '@backstage/frontend-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Flex, Link, Text } from '@backstage/ui';
import { useEffect, useState } from 'react';

/**
 * Step content rendered by a React component instead of markdown. It is
 * loaded on demand and may use any API, here the catalog.
 */
export const CatalogHint = () => {
  const catalogApi = useApi(catalogApiRef);
  const [names, setNames] = useState<string[]>();

  useEffect(() => {
    catalogApi
      .getEntities({ filter: { kind: 'Component' } })
      .then(result => setNames(result.items.map(e => e.metadata.name)));
  }, [catalogApi]);

  return (
    <Flex direction="column" gap="2">
      <Text>
        Each row is an entity. This hint is a <strong>React component</strong>{' '}
        loaded on demand; it asked the catalog for the components:
      </Text>
      {/* a fixed height keeps the popover from resizing when the list arrives */}
      <Flex direction="column" gap="1" style={{ minHeight: 48 }}>
        {(names ?? []).map(name => (
          <Link key={name} href={`/catalog/default/component/${name}`}>
            {name}
          </Link>
        ))}
      </Flex>
    </Flex>
  );
};
