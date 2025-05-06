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
export interface LegendInfo {
  height: number;
  itemsPerRow: number;
  fontSizeLabels: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Style = any;

export type VCDataPoint = {
  name: string;
  x: number | Date | string;
  y: number;
  y0?: number;
  style?: Style;
};

export type LineInfo = {
  name: string;
  color: string;
  unit?: string;
  symbol?: string;
  size?: number;
  scaleFactor?: number;
};

export type RichDataPoint = VCDataPoint & LineInfo;

export type BucketDataPoint = {
  name: string;
  start: number | Date;
  end: number | Date;
  x: number | Date;
  y: number[];
  style?: Style;
};
export type RawOrBucket<T extends LineInfo> = T &
  (VCDataPoint | BucketDataPoint);

export type LegendItem = {
  name: string;
  symbol: { fill: string; type?: string };
};

export type VCLine<T extends RichDataPoint> = {
  datapoints: T[];
  color?: string;
  legendItem: LegendItem;
};

export type VCLines<T extends RichDataPoint> = VCLine<T>[];
