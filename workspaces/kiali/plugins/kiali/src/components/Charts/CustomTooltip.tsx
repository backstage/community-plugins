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
import type { VCDataPoint } from '@backstage-community/plugin-kiali-common/types';
import {
  ChartCursorFlyout,
  ChartLabel,
  ChartPoint,
  ChartTooltip,
  ChartTooltipProps,
} from '@patternfly/react-charts';
import { default as React } from 'react';
import { toLocaleStringWithConditionalDate } from '../../utils/Date';

const dy = 15;
const headSizeDefault = 2 * dy;
const yMargin = 8;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const canvasContext: any = document.createElement('canvas').getContext('2d');
canvasContext.font = '14px overpass';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomLabel = (props: any) => {
  const x = props.x - 11 - props.textWidth / 2;
  const textsWithHead = props.head
    ? [props.head, ' '].concat(props.text)
    : props.text;
  const headSize = props.head ? 2 * dy : 0;
  const startY = yMargin + props.y - (textsWithHead.length * dy) / 2 + headSize;

  return (
    <>
      {props.activePoints
        ?.filter((pt: any) => pt.color && !pt.hideLabel)
        .map((pt: any, idx: number) => {
          const symbol = pt.symbol || 'square';
          return (
            <ChartPoint
              key={`item-${pt.name}-${symbol}`}
              style={{ fill: pt.color, type: symbol }}
              x={x}
              y={startY + dy * idx}
              symbol={symbol}
              size={5.5}
            />
          );
        })}
      <ChartLabel {...props} text={textsWithHead} />
    </>
  );
};

const getHeader = (activePoints?: VCDataPoint[]): string | undefined => {
  if (activePoints && activePoints.length > 0) {
    const x = activePoints[0].x;
    if (typeof x === 'object') {
      // Assume date
      return toLocaleStringWithConditionalDate(x);
    }
  }
  return undefined;
};

export type HookedTooltipProps<T> = ChartTooltipProps & {
  activePoints?: (VCDataPoint & T)[];
  onOpen?: (items: VCDataPoint[]) => void;
  onClose?: () => void;
};

export class HookedChartTooltip<T> extends React.Component<
  HookedTooltipProps<T>
> {
  componentDidMount() {
    if (this.props.onOpen && this.props.activePoints) {
      this.props.onOpen(this.props.activePoints);
    }
  }

  componentWillUnmount() {
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  render() {
    return <ChartTooltip {...this.props} />;
  }
}

type Props = HookedTooltipProps<{}> & {
  showTime?: boolean;
};

export const CustomTooltip = (props: Props) => {
  const getDerivedStateFromProps = () => {
    const head = props.showTime ? getHeader(props.activePoints) : undefined;
    let texts: string[] = [];

    if (props.text && Array.isArray(props.text)) {
      texts = props.text as string[];
    } else if (props.text) {
      texts = [props.text as string];
    }

    let height = texts.length * dy + 2 * yMargin;
    if (head) {
      height += headSizeDefault;
    }
    const textWidth = Math.max(
      ...texts.map(t => canvasContext.measureText(t).width),
    );
    const width =
      50 +
      (head
        ? Math.max(textWidth, canvasContext.measureText(head).width)
        : textWidth);
    return {
      head: head,
      texts: texts,
      textWidth: textWidth,
      width: width,
      height: height,
    };
  };

  const initialState = getDerivedStateFromProps();

  return (
    <HookedChartTooltip
      {...props}
      text={initialState.texts}
      flyoutWidth={initialState.width}
      flyoutHeight={initialState.height}
      flyoutComponent={
        <ChartCursorFlyout
          style={{ stroke: 'none', fillOpacity: 0.6, zIndex: 9999 }}
        />
      }
      labelComponent={
        <CustomLabel
          head={initialState.head}
          textWidth={initialState.textWidth}
        />
      }
      constrainToVisibleArea
    />
  );
};
