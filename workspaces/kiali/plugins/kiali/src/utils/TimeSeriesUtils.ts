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
import {
  AllPromLabelsValues,
  Labels,
  Metric,
} from '@backstage-community/plugin-kiali-common/types';

type KVMapper = (key: string, value: string) => string;
export type LabelsInfo = {
  values: AllPromLabelsValues;
  prettifier?: KVMapper;
};

const isVisibleMetric = (
  labels: Labels,
  labelValues: AllPromLabelsValues,
): boolean => {
  for (const promLabelName in labels) {
    if (Object.prototype.hasOwnProperty.call(labels, promLabelName)) {
      const actualValue = labels[promLabelName];
      const values = labelValues.get(promLabelName);
      if (
        values &&
        Object.prototype.hasOwnProperty.call(values, actualValue) &&
        !values[actualValue]
      ) {
        return false;
      }
    }
  }
  return true;
};

const getMultipleValuesLabels = (metrics: Metric[]): Set<string> => {
  const singleValueLabels = new Map<string, string>();
  const multipleValuesLabels = new Set<string>();
  metrics.forEach(m => {
    Object.entries(m.labels).forEach(e => {
      if (multipleValuesLabels.has(e[0])) {
        return;
      }
      const value = singleValueLabels.get(e[0]);
      if (value === undefined) {
        singleValueLabels.set(e[0], e[1]);
      } else if (value !== e[1]) {
        singleValueLabels.delete(e[0]);
        multipleValuesLabels.add(e[0]);
      }
    });
  });
  return multipleValuesLabels;
};

const mapStatForDisplay = (stat?: string): string | undefined => {
  switch (stat) {
    case '0.5':
      return 'p50';
    case '0.95':
      return 'p95';
    case '0.99':
      return 'p99';
    case '0.999':
      return 'p99.9';
    default:
      return stat;
  }
};

const renameMetrics = (
  metrics: Metric[],
  labelPrettifier?: KVMapper,
): Metric[] => {
  let hasSeveralFamilyNames = false;
  if (metrics.length > 0) {
    const firstName = metrics[0].name;
    hasSeveralFamilyNames = metrics.some(s => s.name !== firstName);
  }
  const multipleValuesLabels = getMultipleValuesLabels(metrics);
  return metrics.map(m => {
    const name = m.name;
    const stat = mapStatForDisplay(m.stat);
    const labelsNoReporter = { ...m.labels };
    delete labelsNoReporter.reporter;
    const otherLabels = Object.entries(labelsNoReporter)
      .filter(e => multipleValuesLabels.has(e[0]))
      .map(e => (labelPrettifier ? labelPrettifier(e[0], e[1]) : e[1]));
    const labels = (stat ? [stat] : []).concat(otherLabels).join(',');
    let finalName = '';
    if (labels === '') {
      // E.g. Serie A
      finalName = name;
    } else if (hasSeveralFamilyNames) {
      // E.g. Serie A [p99,another_label_value]
      finalName = `${name} [${labels}]`;
    } else {
      // E.g. p99,another_label_value
      // (since we only have a single serie name, it is considered implicit and we save some characters space)
      finalName = labels;
    }
    return {
      ...m,
      name: finalName,
    };
  });
};

export const filterAndRenameMetric = (
  metrics: Metric[],
  labels: LabelsInfo,
): Metric[] => {
  const filtered = metrics.filter(m =>
    isVisibleMetric(m.labels, labels.values),
  );
  return renameMetrics(filtered, labels.prettifier);
};

export const generateKey = (metrics: Metric[], chartName: string): string => {
  if (metrics.length === 0) {
    return 'blank';
  }

  const labelNames = Object.keys(metrics[0].labels);
  if (labelNames.length === 0) {
    return chartName;
  }

  return `${chartName}-${labelNames.join('-')}`;
};
