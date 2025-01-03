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
import { AppListItem } from '../types/AppList';
import { ServiceListItem } from '../types/ServiceList';
import { WorkloadListItem } from '../types/Workload';

type itemsType = AppListItem | ServiceListItem | WorkloadListItem;

export const isGateway = (labels: { [key: string]: string }): boolean => {
  return (
    labels &&
    'istio' in labels &&
    (labels.istio === 'ingressgateway' || labels.istio === 'egressgateway')
  );
};

export const isWaypoint = (labels: { [key: string]: string }): boolean => {
  return (
    labels &&
    'gateway.istio.io/managed' in labels &&
    labels['gateway.istio.io/managed'] === 'istio.io-mesh-controller'
  );
};

const getKeyAndValues = (
  filters: string[],
): { keys: string[]; keyValues: string[] } => {
  // keys => List of filters with only Label Presence
  // keyValues => List of filters with Label and value
  const keys = filters.filter(f => !f.includes('='));
  const keyValues = filters.filter(f => f.includes('='));
  return { keys, keyValues };
};

/*
 OR Operation for labels
*/
const orLabelOperation = (
  labels: { [key: string]: string },
  filters: string[],
): boolean => {
  const { keys, keyValues } = getKeyAndValues(filters);

  // Get all keys of labels
  const labelKeys = Object.keys(labels);

  // Check presence label
  let filterOkForLabel =
    labelKeys.filter(label => keys.some(key => label.startsWith(key))).length >
    0;

  if (filterOkForLabel) {
    return true;
  }
  // Check key and value
  keyValues.map(filter => {
    const [key, value] = filter.split('=');
    // Check if multiple values
    value.split(',').map(v => {
      if (key in labels && !filterOkForLabel) {
        // Split label values for serviceList Case where we can have multiple values for a label
        filterOkForLabel = labels[key]
          .trim()
          .split(',')
          .some(labelValue => labelValue.trim().startsWith(v.trim()));
      }
      return undefined;
    });
    return undefined;
  });
  return filterOkForLabel;
};

/*
 AND Operation for labels
*/

const andLabelOperation = (
  labels: { [key: string]: string },
  filters: string[],
): boolean => {
  // We expect this label is ok for the filters with And Operation
  let filterOkForLabel: boolean = true;

  const { keys, keyValues } = getKeyAndValues(filters);

  // Get all keys of labels
  const labelKeys = Object.keys(labels);

  // Start check label presence
  keys.map(k => {
    if (!labelKeys.includes(k) && filterOkForLabel) {
      filterOkForLabel = false;
    }
    return undefined;
  });

  // If label presence is validated we continue checking with key,value
  if (filterOkForLabel) {
    keyValues.map(filter => {
      const [key, value] = filter.split('=');
      if (key in labels && filterOkForLabel) {
        // We need to check if some value of filter match
        value.split(',').map(val => {
          // Split label values for serviceList Case where we can have multiple values for a label
          if (
            !labels[key]
              .split(',')
              .some(labelVal => labelVal.trim().startsWith(val.trim()))
          ) {
            filterOkForLabel = false;
          }
          return undefined;
        });
      } else {
        // The key is not in the labels so not match AND operation
        filterOkForLabel = false;
      }
      return undefined;
    });
  }

  return filterOkForLabel;
};

const filterLabelByOp = (
  labels: { [key: string]: string },
  filters: string[],
  op: string = 'or',
): boolean => {
  return op === 'or'
    ? orLabelOperation(labels, filters)
    : andLabelOperation(labels, filters);
};

export const filterByLabel = (
  items: itemsType[],
  filter: string[],
  op: string = 'or',
): itemsType[] => {
  return filter.length === 0
    ? items
    : items.filter(item => filterLabelByOp(item.labels, filter, op));
};
