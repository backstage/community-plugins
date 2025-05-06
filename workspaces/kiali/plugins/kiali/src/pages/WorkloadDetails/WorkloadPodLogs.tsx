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
  AccessLog,
  LogEntry,
  Pod,
  PodLogs,
  Span,
  TimeInMilliseconds,
  TimeInSeconds,
  TimeRange,
  TracingQuery,
} from '@backstage-community/plugin-kiali-common/types';
import { useApi } from '@backstage/core-plugin-api';
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  Input,
  List,
  Select,
  Toolbar,
  Tooltip,
} from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import { Alert } from '@material-ui/lab';
import memoize from 'micro-memoize';
import moment from 'moment';
import { default as React } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useAsyncFn, useDebounce } from 'react-use';
import screenfull, { Screenfull } from 'screenfull';
import { history, URLParam } from '../../app/History';
import { AccessLogModal } from '../../components/Envoy/AccessLogModal';
import { RenderComponentScroll } from '../../components/Nav/Page/RenderComponentScroll';
import { PFBadge, PFBadges } from '../../components/Pf/PfBadges';
import { PFColors, PFColorVal } from '../../components/Pf/PfColors';
import { ToolbarDropdown } from '../../components/ToolbarDropdown/ToolbarDropdown';
import { KialiIcon } from '../../config/KialiIcon';
import { kialiApiRef } from '../../services/Api';
import { kialiStyle } from '../../styles/StyleUtils';
import { PromisesRegistry } from '../../utils/CancelablePromises';
import { formatDuration } from '../../utils/tracing/TracingHelper';

const appContainerColors = [
  PFColors.Blue300,
  PFColors.Green300,
  PFColors.Purple100,
  PFColors.Orange400,
];
const proxyContainerColor = PFColors.Gold400;
const spanColor = PFColors.Cyan300;

type ReduxProps = {
  timeRange: TimeRange;
};

export type WorkloadPodLogsProps = ReduxProps & {
  cluster?: string;
  lastRefreshAt: TimeInMilliseconds;
  namespace: string;
  pods: Pod[];
  workload: string;
};

type ContainerOption = {
  color: PFColorVal;
  displayName: string;
  isProxy: boolean;
  isSelected: boolean;
  name: string;
};

type Entry = {
  logEntry?: LogEntry;
  span?: Span;
  timestamp: string;
  timestampUnix: TimeInSeconds;
};

interface WorkloadPodLogsState {
  accessLogModals: Map<string, AccessLog>;
  containerOptions?: ContainerOption[];
  entries: Entry[];
  fullscreen: boolean;
  hideError?: string;
  hideLogValue: string;
  isTimeOptionsOpen: boolean;
  kebabOpen: boolean;
  linesTruncatedContainers: string[];
  loadingLogs: boolean;
  loadingLogsError?: string;
  logWindowSelections: any[];
  maxLines: number;
  podValue?: number;
  showClearHideLogButton: boolean;
  showClearShowLogButton: boolean;
  showError?: string;
  showLogValue: string;
  showSpans: boolean;
  showTimestamps: boolean;
  showToolbar: boolean;
  useRegex: boolean;
}

const NoLogsFoundMessage = 'No container logs found for the time period.';

const MaxLinesOptions = {
  '-1': 'All lines',
  '100': '100 lines',
  '500': '500 lines',
  '1000': '1000 lines',
  '3000': '3000 lines',
  '5000': '5000 lines',
  '10000': '10000 lines',
  '25000': '25000 lines',
};

const alInfoIcon = kialiStyle({
  display: 'flex',
  width: '0.75rem',
});

const infoIcons = kialiStyle({
  marginLeft: '0.5em',
  marginTop: '30%',
  width: '1.5rem',
});

const toolbarTail = kialiStyle({
  marginTop: '0.125rem',
});

const logsDiv = kialiStyle({
  marginRight: '0.5rem',
  overflowX: 'scroll',
  overflowY: 'hidden',
});

const logsDisplay = kialiStyle({
  fontFamily: 'monospace',
  margin: 0,
  padding: 0,
  resize: 'none',
  width: '100%',
});

const iconStyle = kialiStyle({
  marginLeft: '0.5rem',
});

const checkboxStyle = kialiStyle({
  marginRight: '0rem',
  marginLeft: '1rem',
});

const noLogsStyle = kialiStyle({
  paddingTop: '0.75rem',
  paddingLeft: '0.75rem',
});

const logLineStyle = kialiStyle({
  display: 'flex',
  lineHeight: '1.5rem',
  paddingLeft: '0.75rem',
});

const logInfoStyleIcon = kialiStyle({
  paddingLeft: 0,
  width: '0.75rem',
  height: '0.75rem',
  fontFamily: 'monospace',
  fontSize: '0.75rem',
  padding: '10px 10px 0 5px !important',
  minWidth: '0 !important',
});

const logMessaageStyle = kialiStyle({
  fontSize: '0.75rem',
  paddingRight: '1rem',
});

const logsBackground = (enabled: boolean): React.CSSProperties => ({
  backgroundColor: enabled ? PFColors.Black1000 : PFColors.Black500,
  display: 'table',
});

const logsHeight = (
  showToolbar: boolean,
  fullscreen: boolean,
  showMaxLinesWarning: boolean,
): React.CSSProperties => {
  const toolbarHeight = showToolbar ? '0px' : '49px';
  const maxLinesWarningHeight = showMaxLinesWarning ? '27px' : '0px';

  return {
    height: fullscreen
      ? `calc(100vh - 130px + ${toolbarHeight} - ${maxLinesWarningHeight})`
      : `calc(var(--kiali-details-pages-tab-content-height) - 155px + ${toolbarHeight} - ${maxLinesWarningHeight})`,
  };
};

const formatDate = (timestamp: string): string => {
  const entryTimestamp = moment(timestamp).format('YYYY-MM-DD HH:mm:ss.SSS');

  return entryTimestamp;
};

export const WorkloadPodLogs = (props: WorkloadPodLogsProps) => {
  const promises: PromisesRegistry = new PromisesRegistry();
  const podOptions = (): string[] => {
    const toRet: string[] = [];
    if (props.pods.length > 0) {
      for (let i = 0; i < props.pods.length; ++i) {
        toRet[`${i}`] = props.pods[i].name;
      }
    }
    return toRet;
  };
  const kialiClient = useApi(kialiApiRef);
  const getContainerOptions = (pod: Pod): ContainerOption[] => {
    // sort containers by name, consistently positioning proxy container first.
    let containers = [...(pod.istioContainers ?? [])];
    containers.push(...(pod.containers ?? []));

    containers = containers.sort((c1, c2) => {
      if (c1.isProxy !== c2.isProxy) {
        return c1.isProxy ? 0 : 1;
      }
      return c1.name < c2.name ? 0 : 1;
    });

    let appContainerCount = 0;
    const containerOptions = containers.map(c => {
      const name = c.name;

      if (c.isProxy) {
        return {
          color: proxyContainerColor,
          displayName: name,
          isProxy: true,
          isSelected: true,
          name: name,
        };
      }

      const color =
        appContainerColors[appContainerCount++ % appContainerColors.length];
      return {
        color: color,
        displayName: name,
        isProxy: false,
        isSelected: true,
        name: name,
      };
    });

    return containerOptions;
  };
  const pod = props.pods[0];
  const initState: WorkloadPodLogsState = {
    accessLogModals: new Map<string, AccessLog>(),
    containerOptions: getContainerOptions(pod),
    entries: [],
    fullscreen: false,
    hideLogValue: '',
    isTimeOptionsOpen: false,
    kebabOpen: false,
    linesTruncatedContainers: [],
    loadingLogs: false,
    logWindowSelections: [],
    podValue: 0,
    maxLines: 100,
    showClearHideLogButton: true,
    showClearShowLogButton: true,
    showSpans: false,
    showTimestamps: false,
    showToolbar: true,
    showLogValue: '',
    useRegex: false,
  };

  const [workloadPodLogsState, setWorkloadPodLogsState] =
    React.useState<WorkloadPodLogsState>(initState);

  const fetchEntries = (
    namespace: string,
    podName: string,
    containerOptions: ContainerOption[],
    showSpans: boolean,
    maxLines: number,
    timeRange: TimeRange,
    cluster?: string,
  ): void => {
    const now: TimeInMilliseconds = Date.now();
    const timeRangeDates = evalTimeRange(timeRange);
    const sinceTime: TimeInSeconds = Math.floor(
      timeRangeDates[0].getTime() / 1000,
    );
    const endTime: TimeInMilliseconds = timeRangeDates[1].getTime();

    // to save work on the server-side, only supply duration when time range is in the past
    let duration = 0;

    if (endTime < now) {
      duration = Math.floor(timeRangeDates[1].getTime() / 1000) - sinceTime;
    }

    const selectedContainers = containerOptions.filter(c => c.isSelected);
    const podPromises: Promise<PodLogs | Span[]>[] = selectedContainers.map(
      c => {
        return kialiClient.getPodLogs(
          namespace,
          podName,
          c.name,
          maxLines,
          sinceTime,
          duration,
          c.isProxy,
          cluster,
        );
      },
    );

    if (showSpans) {
      // Convert seconds to microseconds
      const params: TracingQuery = {
        endMicros: endTime * 1000,
        startMicros: sinceTime * 1000000,
      };

      podPromises.unshift(
        kialiClient.getWorkloadSpans(
          namespace,
          props.workload,
          params,
          props.cluster,
        ),
      );
    }

    promises
      .registerAll('logs', podPromises)
      .then(responses => {
        let entries = [] as Entry[];
        if (showSpans) {
          const spans = showSpans ? (responses[0] as Span[]) : ([] as Span[]);

          entries = spans.map(span => {
            const startTimeU = Math.floor(span.startTime / 1000);

            return {
              timestamp: moment(startTimeU)
                .utc()
                .format('YYYY-MM-DD HH:mm:ss.SSS'),
              timestampUnix: startTimeU,
              span: span,
            } as Entry;
          });
          responses.shift();
        }
        const linesTruncatedContainers: string[] = [];

        for (let i = 0; i < responses.length; i++) {
          const response = responses[i] as PodLogs;
          const containerLogEntries = response.entries as LogEntry[];

          if (!containerLogEntries) {
            continue;
          }

          const color = selectedContainers[i].color;
          containerLogEntries.forEach(le => {
            le.color = color;
            entries.push({
              timestamp: le.timestamp,
              timestampUnix: le.timestampUnix,
              logEntry: le,
            } as Entry);
          });

          if (response.linesTruncated) {
            // linesTruncatedContainers.push(new URL(responses[i].responseURL).searchParams.get('container')!);
          }
        }

        const sortedEntries = entries.sort((a, b) => {
          return a.timestampUnix - b.timestampUnix;
        });

        const updatedState = {
          ...workloadPodLogsState,
          entries: sortedEntries,
          linesTruncatedContainers: linesTruncatedContainers,
          loadingLogs: false,
          showSpans: showSpans,
          maxLines: maxLines,
        };
        setWorkloadPodLogsState(updatedState);

        return;
      })
      .catch(error => {
        if (error.isCanceled) {
          const updatedState = {
            ...workloadPodLogsState,
            loadingLogs: false,
          };
          setWorkloadPodLogsState(updatedState);
          return;
        }

        const errorMsg = error.response?.data?.error ?? error.message;
        const nowDate = Date.now();

        const updatedState = {
          ...workloadPodLogsState,
          loadingLogs: false,
          entries: [
            {
              timestamp: nowDate.toString(),
              timestampUnix: nowDate,
              logEntry: {
                severity: 'Error',
                timestamp: nowDate.toString(),
                timestampUnix: nowDate,
                message: `Failed to fetch workload logs: ${errorMsg}`,
              },
            },
          ],
        };
        setWorkloadPodLogsState(updatedState);
      });
  };

  const toggleSpans = (checked: boolean): void => {
    const urlParams = new URLSearchParams(history.location.search);
    urlParams.set(URLParam.SHOW_SPANS, String(checked));
    history.replace(`${history.location.pathname}?${urlParams.toString()}`);

    const updatedState = {
      ...workloadPodLogsState,
      showSpans: !workloadPodLogsState.showSpans,
    };
    setWorkloadPodLogsState(updatedState);
    const podL = props.pods[workloadPodLogsState.podValue!];
    fetchEntries(
      props.namespace,
      podL.name,
      workloadPodLogsState.containerOptions
        ? workloadPodLogsState.containerOptions
        : [],
      updatedState.showSpans,
      updatedState.maxLines,
      props.timeRange,
      props.cluster,
    );
  };

  const toggleSelected = (c: ContainerOption): void => {
    c.isSelected = !c.isSelected;

    const updatedState = {
      ...workloadPodLogsState,
      containerOptions: [...workloadPodLogsState.containerOptions!],
    };
    setWorkloadPodLogsState(updatedState);
    const podL = props.pods[workloadPodLogsState.podValue!];
    fetchEntries(
      props.namespace,
      podL.name,
      [...workloadPodLogsState.containerOptions!],
      updatedState.showSpans,
      updatedState.maxLines,
      props.timeRange,
      props.cluster,
    );
  };

  const getContainerLegend = (): React.ReactNode => {
    return (
      <div
        data-test="workload-logs-pod-containers"
        style={{ marginTop: '0.375rem' }}
      >
        <div id="container-log-selection">
          <PFBadge
            badge={{ badge: PFBadges.Container.badge, tt: 'Containers' }}
            style={{ marginRight: '0.75rem', height: '1.25rem' }}
            position="top"
          />

          {workloadPodLogsState.containerOptions!.map((c, i) => {
            return (
              <FormControlLabel
                control={
                  <Checkbox
                    id={`container-${c.displayName}`}
                    key={`c-d-${i}`}
                    className={checkboxStyle}
                    checked={c.isSelected}
                    onChange={() => toggleSelected(c)}
                  />
                }
                label={
                  <span
                    style={{
                      color: c.color,
                      fontWeight: 'bold',
                    }}
                  >
                    {c.displayName}
                  </span>
                }
              />
            );
          })}
        </div>
      </div>
    );
  };

  // filteredEntries is a memoized function which returns the set of entries that should be visible in the
  // logs pane, given the values of show and hide filter, and given the "use regex" configuration.
  // When the function is called for the first time with certain combination of parameters, the set of filtered
  // entries is calculated, cached and returned. Thereafter, if the function is called with the same values, the
  // cached set is returned; otherwise, a new set is re-calculated, re-cached and returned, and the old
  // set is discarded.
  const filteredEntries = memoize(
    (
      entries: Entry[],
      showValue: string,
      hideValue: string,
      useRegex: boolean,
    ) => {
      let filteredEntriesM = entries;

      if (!!showValue) {
        if (useRegex) {
          try {
            const regexp = RegExp(showValue);
            filteredEntriesM = filteredEntriesM.filter(
              e => !e.logEntry || regexp.test(e.logEntry.message),
            );

            if (!!workloadPodLogsState.showError) {
              const updatedState = {
                ...workloadPodLogsState,
                showError: undefined,
              };
              setWorkloadPodLogsState(updatedState);
            }
          } catch (e) {
            if (e instanceof Error) {
              const updatedState = {
                ...workloadPodLogsState,
                showError: `Show: ${e.message}`,
              };
              setWorkloadPodLogsState(updatedState);
            }
          }
        } else {
          filteredEntriesM = filteredEntriesM.filter(
            e => !e.logEntry || e.logEntry.message.includes(showValue),
          );
        }
      }

      if (!!hideValue) {
        if (useRegex) {
          try {
            const regexp = RegExp(hideValue);
            filteredEntriesM = filteredEntriesM.filter(
              e => !e.logEntry || !regexp.test(e.logEntry.message),
            );

            if (!!workloadPodLogsState.hideError) {
              const updatedState = {
                ...workloadPodLogsState,
                hideError: undefined,
              };
              setWorkloadPodLogsState(updatedState);
            }
          } catch (e) {
            if (e instanceof Error) {
              const updatedState = {
                ...workloadPodLogsState,
                hideError: `Hide: ${e.message}`,
              };
              setWorkloadPodLogsState(updatedState);
            }
          }
        } else {
          filteredEntriesM = filteredEntriesM.filter(
            e => !e.logEntry || !e.logEntry.message.includes(hideValue),
          );
        }
      }

      return filteredEntriesM;
    },
  );

  const gotoSpan = (span: Span): void => {
    const link =
      `/namespaces/${props.namespace}/workloads/${props.workload}` +
      `?tab=traces&${URLParam.TRACING_TRACE_ID}=${span.traceID}&${URLParam.TRACING_SPAN_ID}=${span.spanID}`;
    history.push(link);
  };

  const entryToString = (entry: Entry): string => {
    if (entry.logEntry) {
      const le = entry.logEntry;
      return workloadPodLogsState.showTimestamps
        ? `${formatDate(entry.timestamp)} ${le.message}`
        : le.message;
    }

    const { duration, operationName } = entry.span!;
    return `duration: ${formatDuration(
      duration,
    )}, operationName: ${operationName}`;
  };

  const addAccessLogModal = (k: string, v: AccessLog): void => {
    const accessLogModals = new Map<string, AccessLog>(
      workloadPodLogsState.accessLogModals,
    );
    accessLogModals.set(k, v);
    const updatedState = {
      ...workloadPodLogsState,
      accessLogModals: accessLogModals,
    };
    setWorkloadPodLogsState(updatedState);
  };

  const renderLogLine = ({
    index,
    style,
    showTimestamps,
  }: {
    index: number;
    style?: React.CSSProperties;
    showTimestamps: boolean;
  }): React.ReactNode => {
    const e = filteredEntries(
      workloadPodLogsState.entries,
      workloadPodLogsState.showLogValue,
      workloadPodLogsState.hideLogValue,
      workloadPodLogsState.useRegex,
    )[index];

    if (e.span) {
      return (
        <div key={`s-${index}`} className={logLineStyle} style={{ ...style }}>
          {showTimestamps && (
            <span
              key={`al-s-${index}`}
              className={logMessaageStyle}
              style={{ color: spanColor }}
            >
              {e.timestamp}
            </span>
          )}
          <Tooltip
            key={`al-tt-${index}`}
            title="Click to navigate to span detail"
          >
            <Button
              key={`s-b-${index}`}
              className={logInfoStyleIcon}
              onClick={() => {
                gotoSpan(e.span!);
              }}
            >
              <KialiIcon.Info
                key={`al-i-${index}`}
                className={alInfoIcon}
                color={spanColor}
              />
            </Button>
          </Tooltip>
          <p
            key={`al-p-${index}`}
            className={logMessaageStyle}
            style={{ color: spanColor }}
          >
            {entryToString(e)}
          </p>
        </div>
      );
    }

    const le = e.logEntry!;
    const messageColor = le.color! ?? PFColors.Color200;

    return !le.accessLog ? (
      <div key={`le-d-${index}`} className={logLineStyle} style={{ ...style }}>
        <p
          key={`le-${index}`}
          className={logMessaageStyle}
          style={{ color: messageColor }}
        >
          {entryToString(e)}
        </p>
      </div>
    ) : (
      <div
        key={`al-${index}`}
        className={logLineStyle}
        style={{ ...style, minWidth: 0, padding: '10px 12px' }}
      >
        {showTimestamps && (
          <span
            key={`al-s-${index}`}
            className={logMessaageStyle}
            style={{ color: messageColor }}
          >
            {formatDate(le.timestamp)}
          </span>
        )}

        <Tooltip
          key={`al-tt-${index}`}
          title="Click for Envoy Access Log details"
        >
          <Button
            key={`al-b-${index}`}
            className={logInfoStyleIcon}
            onClick={() => {
              addAccessLogModal(le.message, le.accessLog!);
            }}
          >
            <KialiIcon.Info
              key={`al-i-${index}`}
              className={alInfoIcon}
              color={messageColor}
            />
          </Button>
        </Tooltip>

        <p
          key={`al-p-${index}`}
          className={logMessaageStyle}
          style={{ color: messageColor }}
        >
          {le.message}
        </p>
      </div>
    );
  };

  const getLogsDiv = (): React.ReactNode => {
    const toggleToolbar = (): void => {
      const updatedState = {
        ...workloadPodLogsState,
        showToolbar: !workloadPodLogsState.showToolbar,
        kebabOpen: false,
      };
      setWorkloadPodLogsState(updatedState);
    };

    const toggleShowTimestamps = (): void => {
      const updatedState = {
        ...workloadPodLogsState,
        showTimestamps: !workloadPodLogsState.showTimestamps,
        kebabOpen: false,
      };
      setWorkloadPodLogsState(updatedState);
    };

    const toggleUseRegex = (): void => {
      const updatedState = {
        ...workloadPodLogsState,
        useRegex: !workloadPodLogsState.useRegex,
        kebabOpen: false,
      };
      setWorkloadPodLogsState(updatedState);
    };

    const kebabActions = () => (
      <Select id="kebab-actions" value="toggleToolbar">
        <MenuItem value="toggleToolbar" onClick={toggleToolbar}>
          {`${
            workloadPodLogsState.showToolbar ? 'Collapse' : 'Expand'
          } Toolbar`}
        </MenuItem>

        <MenuItem value="toggleRegex" onClick={toggleUseRegex}>
          {`Match via ${workloadPodLogsState.useRegex ? 'Substring' : 'Regex'}`}
        </MenuItem>

        <MenuItem value="toggleTimestamps" onClick={toggleShowTimestamps}>
          {`${
            workloadPodLogsState.showTimestamps ? 'Remove' : 'Show'
          } Timestamps`}
        </MenuItem>
      </Select>
    );

    const logEntries = workloadPodLogsState.entries
      ? filteredEntries(
          workloadPodLogsState.entries,
          workloadPodLogsState.showLogValue,
          workloadPodLogsState.hideLogValue,
          workloadPodLogsState.useRegex,
        )
      : [];

    const entriesToString = (entries: Entry[]): string => {
      return entries.map(entry => entryToString(entry)).join('\n');
    };

    const toggleFullscreen = (): void => {
      const screenFullAlias = screenfull as Screenfull; // this casting was necessary

      if (screenFullAlias.isFullscreen) {
        screenFullAlias.exit();
      } else {
        const element = document.getElementById('logs');

        if (screenFullAlias.isEnabled) {
          if (element) {
            screenFullAlias.request(element);
          }
        }
      }
    };

    const hasEntries = (entries: Entry[]): boolean =>
      !!entries && entries.length > 0;

    const renderLogs = (showTimestamps: boolean): React.ReactElement => {
      return (
        <>
          {filteredEntries(
            workloadPodLogsState.entries,
            workloadPodLogsState.showLogValue,
            workloadPodLogsState.hideLogValue,
            workloadPodLogsState.useRegex,
          ).map((_, index) => {
            return renderLogLine({
              index: index,
              showTimestamps: showTimestamps,
            });
          })}
        </>
      );
    };

    return (
      <div key="logsDiv" id="logsDiv" className={logsDiv}>
        <Toolbar style={{ padding: '0.25rem 0' }}>
          {getContainerLegend()}

          <div style={{ marginLeft: 'auto' }}>
            <Tooltip key="copy_logs" title="Copy logs to clipboard">
              <CopyToClipboard
                text={entriesToString(workloadPodLogsState.entries)}
              >
                <Button>
                  <KialiIcon.Copy />
                  <span className={iconStyle}>Copy</span>
                </Button>
              </CopyToClipboard>
            </Tooltip>

            <Tooltip key="fullscreen_logs" title="Expand logs full screen">
              <Button
                onClick={toggleFullscreen}
                disabled={!hasEntries(workloadPodLogsState.entries)}
              >
                <KialiIcon.Expand />
                <span className={iconStyle}>Expand</span>
              </Button>
            </Tooltip>

            {kebabActions()}
          </div>
        </Toolbar>

        {workloadPodLogsState.linesTruncatedContainers.length > 0 && (
          <div style={{ marginBottom: '0.5rem' }}>
            <Alert
              title={`Max lines exceeded for containers: ${workloadPodLogsState.linesTruncatedContainers.join(
                ', ',
              )}. Increase maxLines for more lines, or decrease time period.`}
            />
          </div>
        )}

        <div
          key="logsText"
          id="logsText"
          className={logsDisplay}
          // note - for some reason the callable typescript needs to be applied as "style" and
          // not as a "className".  Otherwise the initial scroillHeight is incorrectly set
          // (to max) and when we try to assign scrollTop to scrollHeight (above),it stays at 0
          // and we fail to set the scroll correctly. So, don't change this!
          style={{
            ...logsHeight(
              workloadPodLogsState.showToolbar,
              workloadPodLogsState.fullscreen,
              workloadPodLogsState.linesTruncatedContainers.length > 0,
            ),
            ...logsBackground(hasEntries(workloadPodLogsState.entries)),
          }}
        >
          <List component="ul">
            {logEntries.length === 0 ? (
              <div className={noLogsStyle}>{NoLogsFoundMessage}</div>
            ) : (
              renderLogs(workloadPodLogsState.showTimestamps)
            )}
          </List>
        </div>
      </div>
    );
  };

  const removeAccessLogModal = (_: string): void => {
    const accessLogModals = new Map<string, AccessLog>(
      workloadPodLogsState.accessLogModals,
    );
    const updatedState = {
      ...workloadPodLogsState,
      accessLogModals: accessLogModals,
      kebabOpen: !workloadPodLogsState.kebabOpen,
    };
    setWorkloadPodLogsState(updatedState);
  };

  const getAccessLogModals = (): React.ReactNode[] => {
    const modals: React.ReactNode[] = [];
    let i = 0;

    workloadPodLogsState.accessLogModals.forEach((v, k) => {
      modals.push(
        <AccessLogModal
          key={`alm-${i++}`}
          accessLog={v}
          accessLogMessage={k}
          onClose={() => removeAccessLogModal(k)}
        />,
      );
    });

    return modals;
  };

  const setPod = (podValue: string): void => {
    const podL = props.pods[Number(podValue)];
    const containerNames = getContainerOptions(podL);

    const updatedState = {
      ...workloadPodLogsState,
      containerOptions: containerNames,
      podValue: Number(podValue),
    };
    setWorkloadPodLogsState(updatedState);
  };

  const setMaxLines = (maxLines: number): void => {
    workloadPodLogsState.maxLines = maxLines;
    const updatedState = {
      ...workloadPodLogsState,
      maxLines: maxLines,
    };
    setWorkloadPodLogsState(updatedState);
    const podL = props.pods[workloadPodLogsState.podValue!];
    fetchEntries(
      props.namespace,
      podL.name,
      workloadPodLogsState.containerOptions
        ? workloadPodLogsState.containerOptions
        : [],
      updatedState.showSpans,
      updatedState.maxLines,
      props.timeRange,
      props.cluster,
    );
  };

  const checkSubmitShow = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter') {
      event.preventDefault();

      const updatedState = {
        ...workloadPodLogsState,
        showClearShowLogButton: !!(event.target as HTMLInputElement).value,
        showLogValue: (event.target as HTMLInputElement).value,
      };
      setWorkloadPodLogsState(updatedState);
    }
  };

  const clearShow = (): void => {
    // TODO: when TextInput refs are fixed in PF4 then use the ref and remove the direct HTMLElement usage
    // this.showInputRef.value = '';
    const htmlInputElement: HTMLInputElement = document.getElementById(
      'log_show',
    ) as HTMLInputElement;
    if (htmlInputElement !== null) {
      htmlInputElement.value = '';
    }

    const updatedState = {
      ...workloadPodLogsState,
      showError: undefined,
      showLogValue: '',
      showClearShowLogButton: false,
    };
    setWorkloadPodLogsState(updatedState);
  };

  const checkSubmitHide = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const updatedState = {
        ...workloadPodLogsState,
        showClearHideLogButton: !!(event.target as HTMLInputElement).value,
        hideLogValue: (event.target as HTMLInputElement).value,
      };
      setWorkloadPodLogsState(updatedState);
    }
  };

  const clearHide = (): void => {
    // TODO: when TextInput refs are fixed in PF4 then use the ref and remove the direct HTMLElement usage
    // this.hideInputRef.value = '';
    const htmlInputElement: HTMLInputElement = document.getElementById(
      'log_hide',
    ) as HTMLInputElement;

    if (htmlInputElement !== null) {
      htmlInputElement.value = '';
    }

    const updatedState = {
      ...workloadPodLogsState,
      hideError: undefined,
      hideLogValue: '',
      showClearHideLogButton: false,
    };
    setWorkloadPodLogsState(updatedState);
  };

  const [{ loading }, refresh] = useAsyncFn(
    async () => {
      const podL = props.pods[workloadPodLogsState.podValue!];
      // Check if the config is loaded
      fetchEntries(
        props.namespace,
        podL.name,
        workloadPodLogsState.containerOptions
          ? workloadPodLogsState.containerOptions
          : [],
        workloadPodLogsState.showSpans,
        workloadPodLogsState.maxLines,
        props.timeRange,
        props.cluster,
      );
    },
    [],
    { loading: true },
  );
  useDebounce(refresh, 10);

  if (loading) {
    return <CircularProgress />;
  }

  // @ts-ignore
  const maxLines = MaxLinesOptions[workloadPodLogsState.maxLines];

  // @ts-ignore
  return (
    <>
      <RenderComponentScroll>
        <>
          {workloadPodLogsState.containerOptions && (
            <Grid key="logs" id="logs" style={{ height: '100%' }}>
              <Grid xs={12}>
                <Card>
                  <CardContent>
                    {workloadPodLogsState.showToolbar && (
                      <Toolbar style={{ padding: 0, width: '100%' }}>
                        <div style={{ display: 'inline' }}>
                          <PFBadge
                            badge={PFBadges.Pod}
                            position="top"
                            style={{ marginTop: '30%' }}
                          />
                        </div>
                        <div
                          style={{ marginRight: '10px', marginLeft: '10px' }}
                        >
                          <ToolbarDropdown
                            id="wpl_pods"
                            tooltip="Display logs for the selected pod"
                            handleSelect={(key: string) => setPod(key)}
                            value={workloadPodLogsState.podValue}
                            label={
                              props.pods[workloadPodLogsState.podValue!]?.name
                            }
                            options={podOptions()}
                          />
                        </div>
                        <Input
                          id="log_show"
                          name="log_show"
                          style={{ width: '10em' }}
                          autoComplete="on"
                          type="text"
                          onKeyDown={checkSubmitShow}
                          defaultValue={workloadPodLogsState.showLogValue}
                          aria-label="show log text"
                          placeholder="Show..."
                        />

                        {workloadPodLogsState.showClearShowLogButton && (
                          <Tooltip
                            key="clear_show_log"
                            title="Clear Show Log Entries..."
                          >
                            <Button onClick={clearShow}>
                              <KialiIcon.Close />
                            </Button>
                          </Tooltip>
                        )}

                        <Input
                          id="log_hide"
                          name="log_hide"
                          style={{ width: '10em' }}
                          autoComplete="on"
                          type="text"
                          onKeyDown={checkSubmitHide}
                          defaultValue={workloadPodLogsState.hideLogValue}
                          aria-label="hide log text"
                          placeholder="Hide..."
                        />

                        {workloadPodLogsState.showClearHideLogButton && (
                          <Tooltip
                            key="clear_hide_log"
                            title="Clear Hide Log Entries..."
                          >
                            <Button onClick={clearHide}>
                              <KialiIcon.Close />
                            </Button>
                          </Tooltip>
                        )}

                        {workloadPodLogsState.showError && (
                          <div style={{ color: 'red' }}>
                            {workloadPodLogsState.showError}
                          </div>
                        )}
                        {workloadPodLogsState.hideError && (
                          <div style={{ color: 'red' }}>
                            {workloadPodLogsState.hideError}
                          </div>
                        )}

                        <div style={{ display: 'inline' }}>
                          <Tooltip
                            key="show_hide_log_help"
                            title="Show only, or Hide all, matching log entries. Match by case-sensitive substring (default) or regular expression (as set in the kebab menu)."
                          >
                            <div>
                              <KialiIcon.Info className={infoIcons} />
                            </div>
                          </Tooltip>
                        </div>

                        <FormControlLabel
                          control={
                            <Checkbox
                              id="log-spans"
                              className={checkboxStyle}
                              checked={workloadPodLogsState.showSpans}
                              onChange={(_event, checked) =>
                                toggleSpans(checked)
                              }
                            />
                          }
                          label={
                            <span
                              style={{
                                color: spanColor,
                                fontWeight: 'bold',
                              }}
                            >
                              spans
                            </span>
                          }
                        />
                        <div style={{ marginLeft: 'auto' }}>
                          <ToolbarDropdown
                            id="wpl_maxLines"
                            handleSelect={(key: any) =>
                              setMaxLines(Number(key))
                            }
                            value={workloadPodLogsState.maxLines}
                            label={maxLines}
                            options={MaxLinesOptions}
                            tooltip="Truncate after N log lines"
                            className={toolbarTail}
                          />
                        </div>
                      </Toolbar>
                    )}
                    {getLogsDiv()}
                    {getAccessLogModals()}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          {workloadPodLogsState.loadingLogsError && (
            <div>{workloadPodLogsState.loadingLogsError}</div>
          )}
        </>
      </RenderComponentScroll>
    </>
  );
};
