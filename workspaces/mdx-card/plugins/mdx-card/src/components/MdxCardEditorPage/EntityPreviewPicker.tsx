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
import { useState } from 'react';
import useAsync from 'react-use/esm/useAsync';
import useDebounce from 'react-use/esm/useDebounce';
import { Combobox } from '@backstage/ui';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';

export const EntityPreviewPicker = ({
  onChange,
}: {
  onChange: (entity: Entity | undefined) => void;
}) => {
  const catalogApi = useApi(catalogApiRef);
  const [input, setInput] = useState('');
  const [term, setTerm] = useState('');
  const [selected, setSelected] = useState<string>();
  useDebounce(() => setTerm(input), 300, [input]);

  const { value: results = [] } = useAsync(async () => {
    const response = await catalogApi.queryEntities({
      limit: 20,
      fields: ['kind', 'metadata.name', 'metadata.namespace'],
      ...(term ? { fullTextFilter: { term, fields: ['metadata.name'] } } : {}),
    });
    return response.items.map(entity => stringifyEntityRef(entity));
  }, [catalogApi, term]);

  const options = [
    ...(selected && !results.includes(selected) ? [selected] : []),
    ...results,
  ].map(ref => ({ id: ref, label: ref }));

  return (
    <Combobox
      label="Preview with entity"
      description="Exposes the entity to the template as on an entity page"
      options={options}
      inputValue={input}
      onInputChange={setInput}
      defaultFilter={() => true}
      selectedKey={selected ?? null}
      onSelectionChange={async key => {
        const ref = key ? String(key) : undefined;
        setSelected(ref);
        setInput(ref ?? '');
        onChange(ref ? await catalogApi.getEntityByRef(ref) : undefined);
      }}
    />
  );
};
