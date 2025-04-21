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
import { useContext, useState } from 'react';

import { PipelineRunKind } from '@janus-idp/shared-react';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { OpenRowStatus } from '../../types/types';
import { PipelineRunRow } from './PipelineRunRow';

type PipelineRunTableBodyProps = {
  rows: PipelineRunKind[];
};

export const PipelineRunTableBody = ({ rows }: PipelineRunTableBodyProps) => {
  const { isExpanded } = useContext(TektonResourcesContext);
  const [open, setOpen] = useState<OpenRowStatus>(
    rows.reduce((acc, row) => {
      if (row.metadata?.uid) {
        acc[row.metadata?.uid] = isExpanded ?? false;
      }
      return acc;
    }, {} as OpenRowStatus),
  );

  return (
    <>
      {rows.map((row: PipelineRunKind) => {
        const startTime = row.status?.startTime || '';

        return (
          <PipelineRunRow
            row={row}
            startTime={startTime}
            isExpanded={isExpanded}
            key={row.metadata?.uid}
            open={row.metadata?.uid ? open[row.metadata.uid] : false}
            setOpen={setOpen}
          />
        );
      })}
    </>
  );
};
