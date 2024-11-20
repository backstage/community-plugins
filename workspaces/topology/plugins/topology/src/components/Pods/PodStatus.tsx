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

import { ChartDonut } from '@patternfly/react-charts';
import { Tooltip } from '@patternfly/react-core';
import * as _ from 'lodash';

import { useForceUpdate } from '../../hooks/useForceUpdate';
import { getSize } from '../../utils/pod-ring-utils';
import {
  calculateRadius,
  getPodStatus,
  podStatus,
} from '../../utils/workload-node-utils';
import { AllPodStatus, podColor } from './pod';

import './PodStatus.css';

const ANIMATION_DURATION = 350;
const MAX_POD_TITLE_LENGTH = 14;

type PodData = {
  x: string;
  y: number;
};

interface PodStatusProps {
  innerRadius?: number;
  outerRadius?: number;
  size?: number;
  standalone?: boolean;
  x?: number;
  y?: number;
  data: any[];
  showTooltip?: boolean;
  title?: string;
  titleComponent?: React.ReactElement;
  subTitle?: string;
  subTitleComponent?: React.ReactElement;
}

const { podStatusInnerRadius, podStatusOuterRadius } = calculateRadius(130); // default value of size is 130

const podStatusIsNumeric = (podStatusValue: string) => {
  return (
    podStatusValue !== AllPodStatus.ScaledTo0 &&
    podStatusValue !== AllPodStatus.AutoScaledTo0 &&
    podStatusValue !== AllPodStatus.Idle &&
    podStatusValue !== AllPodStatus.ScalingUp
  );
};

const PodStatus = ({
  innerRadius = podStatusInnerRadius,
  outerRadius = podStatusOuterRadius,
  x,
  y,
  size = 130,
  standalone = false,
  showTooltip = true,
  title,
  subTitle = '',
  titleComponent,
  subTitleComponent,
  data,
}: PodStatusProps) => {
  const [updateOnEnd, setUpdateOnEnd] = React.useState<boolean>(false);
  const forceUpdate = useForceUpdate();
  const prevVData = React.useRef<PodData[] | null>(null);
  const chartTriggerRef = React.useRef<SVGGElement | null>(null);

  const vData = React.useMemo(() => {
    const updateVData: PodData[] = podStatus.map((pod: any) => ({
      x: pod,
      y: _.sumBy(data, (d: any) => +(getPodStatus(d) === pod)) || 0,
    }));

    if (_.isEmpty(data)) {
      _.update(
        updateVData,
        `[${_.findKey(updateVData, { x: AllPodStatus.ScaledTo0 })}]['y']`,
        () => 1,
      );
    }

    const prevDataPoints = getSize(
      prevVData?.current?.filter(nextData => nextData.y !== 0),
    );
    const dataPoints = getSize(
      updateVData?.filter(nextData => nextData.y !== 0),
    );
    setUpdateOnEnd(dataPoints === 1 && prevDataPoints > 1);

    if (!_.isEqual(prevVData.current, updateVData)) {
      prevVData.current = updateVData;
      return updateVData;
    }
    return prevVData.current;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
  const truncTitle = title
    ? _.truncate(title, { length: MAX_POD_TITLE_LENGTH })
    : undefined;
  const truncSubTitle = subTitle
    ? _.truncate(subTitle, { length: MAX_POD_TITLE_LENGTH })
    : undefined;
  const chartDonut = React.useMemo(() => {
    return (
      <ChartDonut
        ariaTitle={`${title}${subTitle && ` ${subTitle}`}`}
        animate={{
          duration: prevVData.current ? ANIMATION_DURATION : 0,
          onEnd: updateOnEnd ? forceUpdate : undefined,
        }}
        standalone={standalone}
        innerRadius={innerRadius}
        radius={outerRadius}
        groupComponent={
          x && y ? <g transform={`translate(${x}, ${y})`} /> : undefined
        }
        data={vData as any[] | undefined}
        height={size}
        width={size}
        title={truncTitle}
        titleComponent={titleComponent}
        subTitleComponent={subTitleComponent}
        subTitle={truncSubTitle}
        allowTooltip={false}
        labels={() => null}
        padAngle={({ datum }) => (datum.y > 0 ? 2 : 0)}
        style={{
          data: {
            fill: ({ datum }) => podColor[datum.x as AllPodStatus],
            stroke: ({ datum }) =>
              !podStatusIsNumeric(datum.x) && datum.y > 0 ? '#BBBBBB' : 'none',
            strokeWidth: 1,
          },
        }}
      />
    );
  }, [
    forceUpdate,
    innerRadius,
    outerRadius,
    size,
    standalone,
    subTitle,
    title,
    truncSubTitle,
    subTitleComponent,
    truncTitle,
    titleComponent,
    updateOnEnd,
    vData,
    x,
    y,
  ]);

  if (!vData) {
    return null;
  }

  if (showTooltip) {
    const tipContent = (
      <div className="tp-pod-status-tooltip">
        {vData.map(d => {
          return d.y > 0 ? (
            <div key={d.x} className="tp-pod-status-tooltip__content">
              <span
                className="tp-pod-status-tooltip__status-box"
                style={{ background: podColor[d.x as AllPodStatus] }}
              />
              {podStatusIsNumeric(d.x) && (
                <span key={3} className="tp-pod-status-tooltip__status-count">
                  {`${Math.round(d.y)}`}
                </span>
              )}
              {d.x}
            </div>
          ) : null;
        })}
      </div>
    );
    return (
      <Tooltip content={tipContent} triggerRef={chartTriggerRef}>
        <g ref={chartTriggerRef}>{chartDonut}</g>
      </Tooltip>
    );
  }
  return chartDonut;
};

export default React.memo((props: PodStatusProps) => <PodStatus {...props} />);
