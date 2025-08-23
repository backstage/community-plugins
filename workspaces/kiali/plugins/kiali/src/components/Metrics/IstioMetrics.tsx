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
import { evalTimeRange } from '@backstage-community/plugin-kiali-common/func';
import {
  ChartModel,
  DashboardModel,
  Direction,
  ExternalLink,
  GrafanaInfo,
  IstioMetricsOptions,
  KialiCrippledFeatures,
  MetricsObjectTypes,
  Overlay,
  RawOrBucket,
  Reporter,
  TimeInMilliseconds,
  TimeRange,
} from '@backstage-community/plugin-kiali-common/types';
import { useApi } from '@backstage/core-plugin-api';
import { Checkbox, FormControlLabel, Toolbar } from '@material-ui/core';
import { default as React } from 'react';
import { useAsyncFn, useDebounce } from 'react-use';
import { history, URLParam } from '../../app/History';
import { Dashboard } from '../../components/Charts/Dashboard';
import { kialiApiRef } from '../../services/Api';
import { KialiAppState, KialiContext } from '../../store';
import { kialiStyle } from '../../styles/StyleUtils';
import { MetricsReporter } from '../MetricsOptions/MetricsReporter';
import {
  LabelsSettings,
  MetricsSettings,
} from '../MetricsOptions/MetricsSettings';
import { MetricsSettingsDropdown } from '../MetricsOptions/MetricsSettingsDropdown';
import { GrafanaLinks } from './GrafanaLinks';
import * as MetricsHelper from './Helper';
import { JaegerLineInfo, SpanOverlay } from './SpanOverlay';

type ObjectId = {
  cluster?: string;
  namespace: string;
  object: string;
};

type IstioMetricsProps = ObjectId & {
  direction: Direction;
  objectType: MetricsObjectTypes;
} & {
  lastRefreshAt: TimeInMilliseconds;
};

type Props = IstioMetricsProps;

const fullHeightStyle = kialiStyle({
  height: '100%',
});

export const IstioMetrics = (props: Props) => {
  const initTimeRange = () => {
    const now = new Date();
    const lastdate = now.getTime() - props.lastRefreshAt * 60 * 1000;
    const tr: TimeRange = {
      from: lastdate,
      to: now.getTime(),
    };
    return tr;
  };
  const toolbarRef = React.createRef<HTMLDivElement>();
  let grafanaInfoPromise: Promise<GrafanaInfo | undefined> | undefined;
  const settings = MetricsHelper.retrieveMetricsSettings();
  const kialiClient = useApi(kialiApiRef);
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const [crippledFeatures, setCrippledFeatures] =
    React.useState<KialiCrippledFeatures>();
  const [dashboard, setDashboard] = React.useState<DashboardModel>();
  const [grafanaLinks, setGrafanaLinks] = React.useState<ExternalLink[]>([]);
  const [labelsSettings, setLabelsSettings] = React.useState<LabelsSettings>(
    settings.labelsSettings,
  );
  const [showSpans, setShowSpans] = React.useState<boolean>(settings.showSpans);
  const [showTrendlines, setShowTrendLines] = React.useState<boolean>(
    settings.showTrendlines,
  );
  const [spanOverlayState, setSpanOverlayState] =
    React.useState<Overlay<JaegerLineInfo>>();
  const [tabHeight, _setter] = React.useState<number>(500);
  const spanOverlay = new SpanOverlay(changed => setSpanOverlayState(changed));
  const tracingIntegration = kialiState.tracingState?.info
    ? kialiState.tracingState.info.integration
    : true;
  const [timeRange, setTimeRange] = React.useState<TimeRange>(initTimeRange());
  const prevDirection = React.useRef(props.direction);
  const prevLastRefreshAt = React.useRef(props.lastRefreshAt);

  const initOptions = (settingsI: MetricsSettings): IstioMetricsOptions => {
    const options: IstioMetricsOptions = {
      reporter: MetricsReporter.initialReporter(props.direction),
      direction: props.direction,
    };

    const defaultLabels = [
      props.direction === 'inbound'
        ? 'source_canonical_service'
        : 'destination_canonical_service',
      props.direction === 'inbound'
        ? 'source_workload_namespace'
        : 'destination_workload_namespace',
    ];

    MetricsHelper.settingsToOptions(settingsI, options, defaultLabels);

    return options;
  };

  const options = initOptions(settings);

  const fetchMetrics = async (): Promise<void> => {
    // Time range needs to be reevaluated everytime fetching
    MetricsHelper.timeRangeToOptions(timeRange, options);
    const opts = { ...options };

    if (opts.reporter === 'both') {
      opts.byLabels = (opts.byLabels ?? []).concat('reporter');
    }

    let promise: Promise<DashboardModel>;

    switch (props.objectType) {
      case MetricsObjectTypes.WORKLOAD:
        promise = kialiClient.getWorkloadDashboard(
          props.namespace,
          props.object,
          opts,
          props.cluster,
        );
        break;
      case MetricsObjectTypes.APP:
        promise = kialiClient.getAppDashboard(
          props.namespace,
          props.object,
          opts,
          props.cluster,
        );
        break;
      case MetricsObjectTypes.SERVICE:
      default:
        promise = kialiClient.getServiceDashboard(
          props.namespace,
          props.object,
          opts,
          props.cluster,
        );
        break;
    }

    return promise
      .then(response => {
        const labelsSettingsUpdated = MetricsHelper.extractLabelsSettings(
          response,
          labelsSettings,
        );
        setDashboard(response);
        setLabelsSettings(labelsSettingsUpdated);
      })
      .catch(error => {
        kialiState.alertUtils!.add(`Could not fetch metrics, ${error}`);
        throw error;
      });
  };

  const fetchGrafanaInfo = (): void => {
    if (
      typeof grafanaInfoPromise === 'undefined' ||
      grafanaInfoPromise === null
    ) {
      grafanaInfoPromise = kialiClient.getGrafanaInfo().then(response => {
        return response;
      });
    }

    grafanaInfoPromise
      .then(grafanaInfo => {
        if (grafanaInfo) {
          setGrafanaLinks(grafanaInfo.externalLinks);
        } else {
          setGrafanaLinks([]);
        }
      })
      .catch(err => {
        kialiState.alertUtils!.add(
          `Could not fetch Grafana info. Turning off links to Grafana., ${err}`,
        );
      });
  };

  const refresh = (): void => {
    fetchMetrics();
    if (tracingIntegration) {
      spanOverlay.fetch(
        {
          namespace: props.namespace,
          cluster: props.cluster,
          target: props.object,
          targetKind: props.objectType,
          range: timeRange,
        },
        kialiClient,
        kialiState,
      );
    }
  };

  const fetchCripledFeatures = () => {
    kialiClient.getCrippledFeatures().then(response => {
      setCrippledFeatures(response);
    });

    fetchGrafanaInfo();
    refresh();
  };

  React.useEffect(() => {
    if (props.direction !== prevDirection.current) {
      refresh();
      prevDirection.current = props.direction;
    }
    if (props.lastRefreshAt !== prevLastRefreshAt.current) {
      setTimeRange(initTimeRange());
      prevLastRefreshAt.current = props.lastRefreshAt;
    }
    /* eslint-disable-next-line */
  }, [props.direction, props.lastRefreshAt]);

  const [_, refreshy] = useAsyncFn(
    async () => {
      // Check if the config is loaded
      await fetchCripledFeatures();
    },
    [],
    { loading: true },
  );
  useDebounce(refreshy, 10);

  const onMetricsSettingsChanged = (settingsM: MetricsSettings): void => {
    const defaultLabels = [
      props.direction === 'inbound'
        ? 'source_canonical_service'
        : 'destination_canonical_service',
    ];

    MetricsHelper.settingsToOptions(settingsM, options, defaultLabels);
    fetchMetrics();
  };

  const onLabelsFiltersChanged = (labelsFilters: LabelsSettings): void => {
    setLabelsSettings(labelsFilters);
  };

  const onReporterChanged = (reporter: Reporter): void => {
    options.reporter = reporter;
    fetchMetrics();
  };

  const onDomainChange = (dates: [Date, Date]): void => {
    if (dates && dates[0] && dates[1]) {
      const range: TimeRange = {
        from: dates[0].getTime(),
        to: dates[1].getTime(),
      };

      setTimeRange(range);
    }
  };

  const onClickDataPoint = (
    _chart: ChartModel,
    datum: RawOrBucket<JaegerLineInfo>,
  ): void => {
    if ('start' in datum && 'end' in datum) {
      // Zoom-in bucket
      onDomainChange([datum.start as Date, datum.end as Date]);
    } else if ('traceId' in datum) {
      const traceId = datum.traceId;
      const spanId = datum.spanId;

      const domain =
        // eslint-disable-next-line no-nested-ternary
        props.objectType === MetricsObjectTypes.APP
          ? 'applications'
          : props.objectType === MetricsObjectTypes.SERVICE
          ? 'services'
          : 'workloads';

      history.push(
        `/namespaces/${props.namespace}/${domain}/${props.object}?tab=traces&${URLParam.TRACING_TRACE_ID}=${traceId}&${URLParam.TRACING_SPAN_ID}=${spanId}`,
      );
    }
  };

  const onSpans = (checked: boolean): void => {
    const urlParams = new URLSearchParams(history.location.search);
    urlParams.set(URLParam.SHOW_SPANS, String(checked));
    history.replace(`${history.location.pathname}?${urlParams.toString()}`);
    setShowSpans(!showSpans);
  };

  const onTrendlines = (checked: boolean): void => {
    const urlParams = new URLSearchParams(history.location.search);
    urlParams.set(URLParam.SHOW_TRENDLINES, String(checked));
    history.replace(`${history.location.pathname}?${urlParams.toString()}`);
    setShowTrendLines(!showTrendlines);
  };

  const renderOptionsBar = (): React.ReactNode => {
    const hasHistogramsAverage =
      !crippledFeatures?.requestSizeAverage ||
      !crippledFeatures?.responseSizeAverage ||
      !crippledFeatures?.responseTimeAverage;

    const hasHistogramsPercentiles =
      !crippledFeatures?.requestSizePercentiles ||
      !crippledFeatures?.responseSizePercentiles ||
      !crippledFeatures?.responseTimePercentiles;

    return (
      <div ref={toolbarRef}>
        <Toolbar style={{ padding: 0, marginBottom: '1.25rem' }}>
          <MetricsSettingsDropdown
            onChanged={onMetricsSettingsChanged}
            onLabelsFiltersChanged={onLabelsFiltersChanged}
            direction={props.direction}
            labelsSettings={labelsSettings}
            hasHistograms
            hasHistogramsAverage={hasHistogramsAverage}
            hasHistogramsPercentiles={hasHistogramsPercentiles}
          />

          <MetricsReporter
            onChanged={onReporterChanged}
            direction={props.direction}
            reporter={options.reporter}
          />

          <FormControlLabel
            control={
              <Checkbox
                id="spans-show-"
                checked={showSpans}
                key="spans-show-chart"
                onChange={(_event, checked) => onSpans(checked)}
              />
            }
            label="Spans"
          />

          <FormControlLabel
            control={
              <Checkbox
                id="trendlines-show-"
                checked={showTrendlines}
                key="trendlines-show-chart"
                onChange={(_event, checked) => onTrendlines(checked)}
              />
            }
            label="Trendlines"
          />

          <GrafanaLinks
            links={grafanaLinks}
            namespace={props.namespace}
            object={props.object}
            objectType={props.objectType}
          />
        </Toolbar>
      </div>
    );
  };

  const expandHandler = (expandedChart?: string): void => {
    const urlParams = new URLSearchParams(history.location.search);
    urlParams.delete('expand');

    if (expandedChart) {
      urlParams.set('expand', expandedChart);
    }

    history.push(`${history.location.pathname}?${urlParams.toString()}`);
  };

  const urlParams = new URLSearchParams(history.location.search);
  const expandedChart = urlParams.get('expand') ?? undefined;

  // 20px (card margin) + 24px (card padding) + 51px (toolbar) + 15px (toolbar padding) + 24px (card padding) + 20px (card margin)
  const toolbarHeight = toolbarRef?.current
    ? toolbarRef.current.clientHeight
    : 15;
  const toolbarSpace = 20 + 24 + toolbarHeight + 15 + 24 + 20;
  const dashboardHeight = tabHeight - toolbarSpace;

  return (
    <>
      <div className={fullHeightStyle}>
        {renderOptionsBar()}
        {dashboard && (
          <Dashboard
            dashboard={dashboard}
            labelValues={MetricsHelper.convertAsPromLabels(labelsSettings)}
            maximizedChart={expandedChart}
            expandHandler={expandHandler}
            onClick={onClickDataPoint}
            labelPrettifier={MetricsHelper.prettyLabelValues}
            overlay={spanOverlayState}
            showSpans={showSpans}
            showTrendlines={showTrendlines}
            dashboardHeight={dashboardHeight}
            timeWindow={evalTimeRange(timeRange)}
            brushHandlers={{
              onDomainChangeEnd: (__, propsD) =>
                onDomainChange(propsD.currentDomain.x),
            }}
          />
        )}
      </div>
    </>
  );
};
