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
import { LineInfo, VCDataPoint, VCLine } from './VictoryChartInfo';

export type OverlayInfo<T extends LineInfo> = {
  lineInfo: T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataStyle: any; // see "data" in https://formidable.com/open-source/victory/docs/common-props/#style
  buckets?: number;
};

export type Overlay<T extends LineInfo> = {
  vcLine: VCLine<VCDataPoint & T>;
  info: OverlayInfo<T>;
};
