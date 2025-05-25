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
  boundsToDuration,
  guardTimeRange,
} from '@backstage-community/plugin-kiali-common/func';
import {
  AggregationModel,
  AllPromLabelsValues,
  DashboardModel,
  DurationInSeconds,
  Metric,
  MetricsQuery,
  PromLabel,
  SingleLabelValues,
  TimeRange,
} from '@backstage-community/plugin-kiali-common/types';
import { history, URLParam } from '../../app/History';
import { computePrometheusRateParams } from '../../services/Prometheus';
import { responseFlags } from '../../utils/ResponseFlags';
import {
  LabelSettings,
  LabelsSettings,
  MetricsSettings,
  Quantiles,
} from '../MetricsOptions/MetricsSettings';

// Default to 10 minutes. Showing timeseries to only 1 minute doesn't make so much sense.
export const defaultMetricsDuration: DurationInSeconds = 600;

export const combineLabelsSettings = (
  newSettings: LabelsSettings,
  stateSettings: LabelsSettings,
): LabelsSettings => {
  // Labels: keep existing on/off flag
  // This is allowed because the labels filters state is managed only from this component,
  // so we can override them in props from state
  // LabelsSettings received from props contains the names of the filters with only a default on/off flag.
  const result: LabelsSettings = new Map<PromLabel, LabelSettings>();
  newSettings.forEach(
    (
      lblObj: {
        values: { [s: string]: unknown } | ArrayLike<unknown>;
        checked: any;
      },
      promLabel: string,
    ) => {
      const resultValues: SingleLabelValues = {};
      const stateObj = stateSettings.get(promLabel);
      Object.entries(lblObj.values).forEach(e => {
        resultValues[e[0]] =
          stateObj && stateObj.defaultValue === false
            ? false
            : (e[1] as boolean);
      });
      if (stateObj) {
        lblObj.checked = stateObj.checked;
        Object.entries(stateObj.values).forEach(e => {
          resultValues[e[0]] = e[1];
        });
      }
      result.set(promLabel, {
        defaultValue: false,
        displayName: '',
        singleSelection: false,
        ...lblObj,
        values: resultValues,
      });
    },
  );
  return result;
};

export const extractLabelsSettingsOnSeries = (
  metrics: Metric[],
  aggregations: AggregationModel[],
  extracted: LabelsSettings,
): void => {
  metrics.forEach(m => {
    Object.keys(m.labels).forEach(k => {
      const agg = aggregations.find(a => a.label === k);
      if (agg) {
        const value = m.labels[k];
        let lblObj = extracted.get(agg.label);
        if (!lblObj) {
          lblObj = {
            checked: true,
            displayName: agg.displayName,
            values: {},
            defaultValue: true,
            singleSelection: agg.singleSelection,
          };
          extracted.set(agg.label, lblObj);
        } else {
          lblObj.checked = true;
        }
        if (!lblObj.values.hasOwnProperty(value)) {
          if (agg.singleSelection && Object.keys(lblObj.values).length > 0) {
            // In single-selection mode, do not activate more than one label value at a time
            lblObj.values[value] = false;
          } else {
            lblObj.values[value] = true;
          }
        }
      }
    });
  });
};

export const extractLabelsSettings = (
  dashboard: DashboardModel,
  stateSettings: Map<PromLabel, LabelSettings>,
): LabelsSettings => {
  // Find all labels on all series
  const newSettings: LabelsSettings = new Map();
  dashboard.aggregations.forEach(agg =>
    newSettings.set(agg.label, {
      checked: false,
      displayName: agg.displayName,
      values: {},
      defaultValue: true,
      singleSelection: agg.singleSelection,
    }),
  );
  dashboard.charts.forEach(chart =>
    extractLabelsSettingsOnSeries(
      chart.metrics,
      dashboard.aggregations,
      newSettings,
    ),
  );
  return combineLabelsSettings(newSettings, stateSettings);
};

export const mergeLabelFilter = (
  lblSettings: LabelsSettings,
  label: PromLabel,
  value: string,
  checked: boolean,
  singleSelection: boolean,
): LabelsSettings => {
  // Note: we don't really care that the new map references same objects as the old one (at least at the moment) so shallow copy is fine
  const newSettings = new Map(lblSettings);
  const objLbl = newSettings.get(label);
  if (objLbl) {
    if (singleSelection) {
      // @ts-ignore
      for (const v of Object.keys(objLbl.values)) {
        // @ts-ignore
        objLbl.values[v] = false;
      }
    }
    // @ts-ignore
    objLbl.values[value] = checked;
  }
  return newSettings;
};

export const convertAsPromLabels = (
  lblSettings: LabelsSettings,
): AllPromLabelsValues => {
  const promLabels = new Map<PromLabel, SingleLabelValues>();
  lblSettings.forEach((objLbl: { values: SingleLabelValues }, k: string) => {
    promLabels.set(k, objLbl.values);
  });
  return promLabels;
};

export const settingsToOptions = (
  settings: MetricsSettings,
  opts: MetricsQuery,
  defaultLabels: string[],
) => {
  opts.avg = settings.showAverage;
  opts.quantiles = settings.showQuantiles;
  let byLabels = defaultLabels;
  if (settings.labelsSettings.size > 0) {
    // Labels have been fetched, so use what comes from labelsSettings
    byLabels = [];
    settings.labelsSettings.forEach((objLbl: { checked: any }, k: string) => {
      if (objLbl.checked) {
        byLabels.push(k);
      }
    });
  }
  opts.byLabels = byLabels;
};

export const timeRangeToOptions = (range: TimeRange, opts: MetricsQuery) => {
  delete opts.queryTime;
  opts.duration = guardTimeRange(
    range,
    d => d,
    ft => {
      opts.queryTime = ft.to && Math.floor(ft.to / 1000);
      return boundsToDuration(ft);
    },
  );
  const intervalOpts = computePrometheusRateParams(opts.duration);
  opts.step = intervalOpts.step;
  opts.rateInterval = intervalOpts.rateInterval;
};

export const retrieveMetricsSettings = (): MetricsSettings => {
  const urlParams = new URLSearchParams(history.location.search);
  const settings: MetricsSettings = {
    showSpans: false,
    showTrendlines: false,
    showAverage: true,
    showQuantiles: [],
    labelsSettings: new Map(),
  };
  const avg = urlParams.get(URLParam.SHOW_AVERAGE);
  if (avg !== null) {
    settings.showAverage = avg === 'true';
  }
  const spans = urlParams.get(URLParam.SHOW_SPANS);
  if (spans !== null) {
    settings.showSpans = spans === 'true';
  }
  const trendlines = urlParams.get(URLParam.SHOW_TRENDLINES);
  if (trendlines !== null) {
    settings.showTrendlines = trendlines === 'true';
  }
  const quantiles = urlParams.get(URLParam.QUANTILES);
  if (quantiles !== null) {
    if (quantiles.trim().length !== 0) {
      settings.showQuantiles = quantiles
        .split(' ')
        .map(val => val.trim() as Quantiles);
    } else {
      settings.showQuantiles = [];
    }
  }
  const byLabels = urlParams.getAll(URLParam.BY_LABELS);
  // E.g.: bylbl=version=v1,v2,v4
  if (byLabels.length !== 0) {
    byLabels.forEach(val => {
      const kvpair = val.split('=', 2);
      const lblObj: LabelSettings = {
        displayName: '',
        checked: true,
        values: {},
        defaultValue: true,
        singleSelection: false,
      };
      if (kvpair[1]) {
        kvpair[1].split(',').forEach(v => {
          lblObj.values[v] = true;
        });
        // When values filters are provided by URL, other filters should be false by default
        lblObj.defaultValue = false;
      }
      settings.labelsSettings.set(kvpair[0], lblObj);
    });
  }
  return settings;
};

export const prettyLabelValues = (promName: PromLabel, val: string): string => {
  if (promName === 'response_flags') {
    if (val === '-') {
      return 'None';
    }
    // @ts-ignore
    const flagObj = responseFlags[val];
    if (flagObj) {
      const text = flagObj.short ? flagObj.short : flagObj.help;
      return `${text} (${val})`;
    }
  }
  return val;
};
