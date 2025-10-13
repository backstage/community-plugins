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
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { tektonTranslationRef } from '../../translations';

export type OutputResults = {
  name: string;
  value: string | string[] | Record<string, string>;
};

export interface OutputProps {
  results: {
    name: string;
    value: string | string[] | Record<string, string>;
  }[];
}

export const Output = ({ results }: OutputProps) => {
  const { t } = useTranslationRef(tektonTranslationRef);

  if (!results.length) return null;
  return (
    <Table data-testid="output-table" aria-label="output" data-codemods="true">
      <Thead>
        <Tr>
          <Th style={{ textAlign: 'left' }} width={25}>
            {t('pipelineRunParamsAndResults.outputTableColumn.name')}
          </Th>
          <Th style={{ textAlign: 'left' }}>
            {t('pipelineRunParamsAndResults.outputTableColumn.value')}
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {results.map(({ name, value }) => (
          <Tr key={`row-${name}`}>
            <Td>{name}</Td>
            <Td>
              {Array.isArray(value) && value.join(', ')}
              {!Array.isArray(value) && (
                <>{typeof value === 'object' ? JSON.stringify(value) : value}</>
              )}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};
