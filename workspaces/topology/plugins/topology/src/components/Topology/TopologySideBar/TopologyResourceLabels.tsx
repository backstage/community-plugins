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
import React from 'react';

import { Label } from '@patternfly/react-core';

import './TopologyResourceLabels.css';

type TopologyResourceLabelsProps = {
  labels: { [key: string]: string };
  dataTest?: string;
};

const TopologyResourceLabels = ({
  labels,
  dataTest,
}: TopologyResourceLabelsProps) => {
  return (
    <ul className="topology-resource-labels-list" data-testid={dataTest}>
      {Object.keys(labels ?? {}).map((key: string) => (
        <li key={key}>
          <Label className="topology-resource-labels-list-item" color="blue">
            <span className="pf-v5-c-label__content">
              <span className="label-key">{key}</span>
              <span>=</span>
              <span className="label-value">{labels[key]}</span>
            </span>
          </Label>
        </li>
      ))}
    </ul>
  );
};

export default TopologyResourceLabels;
