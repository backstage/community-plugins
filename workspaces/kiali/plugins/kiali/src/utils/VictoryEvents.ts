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
  LineInfo,
  RawOrBucket,
} from '@backstage-community/plugin-kiali-common/types';

interface EventItem {
  legendName: string;
  idx: number;
  serieID: string[];
  onClick?: (
    props: RawOrBucket<LineInfo>,
  ) => Partial<RawOrBucket<LineInfo>> | null;
  onMouseOver?: (
    props: RawOrBucket<LineInfo>,
  ) => Partial<RawOrBucket<LineInfo>> | null;
  onMouseOut?: (
    props: RawOrBucket<LineInfo>,
  ) => Partial<RawOrBucket<LineInfo>> | null;
}

export type VCEvent = {
  childName?: string[];
  target: string;
  eventKey?: string;
  eventHandlers: EventHandlers;
};

type EventHandlers = {
  onClick?: (event: MouseEvent) => EventMutation[];
  onMouseOver?: (event: MouseEvent) => EventMutation[];
  onMouseOut?: (event: MouseEvent) => EventMutation[];
};

type EventMutation = {
  childName: string[];
  target: string;
  mutation: (
    props: RawOrBucket<LineInfo>,
  ) => Partial<RawOrBucket<LineInfo>> | null;
};

export const addLegendEvent = (events: VCEvent[], item: EventItem): void => {
  const eventHandlers: EventHandlers = {};
  if (item.onClick) {
    eventHandlers.onClick = e => {
      e.stopPropagation();
      return [
        {
          childName: [item.serieID[0]],
          target: 'data',
          mutation: props => item.onClick!(props),
        },
        {
          childName: [item.serieID[0]],
          target: 'data',
          eventKey: 'all',
          mutation: () => null,
        },
      ];
    };
  }
  if (item.onMouseOver) {
    eventHandlers.onMouseOver = () => {
      return [
        {
          childName: item.serieID,
          target: 'data',
          eventKey: 'all',
          mutation: props => item.onMouseOver!(props),
        },
      ];
    };
    eventHandlers.onMouseOut = () => {
      return [
        {
          childName: item.serieID,
          target: 'data',
          eventKey: 'all',
          mutation: props => (item.onMouseOut ? item.onMouseOut(props) : null),
        },
      ];
    };
  }
  events.push({
    childName: [item.legendName],
    target: 'data',
    eventKey: String(item.idx),
    eventHandlers: eventHandlers,
  });
  events.push({
    childName: [item.legendName],
    target: 'labels',
    eventKey: String(item.idx),
    eventHandlers: eventHandlers,
  });
};
