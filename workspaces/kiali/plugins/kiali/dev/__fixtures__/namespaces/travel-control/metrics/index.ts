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

import inbound60 from './inbound/metrics_inbound_60.json';
import inbound120 from './inbound/metrics_inbound_120.json';
import inbound300 from './inbound/metrics_inbound_300.json';
import inbound600 from './inbound/metrics_inbound_600.json';
import inbound1800 from './inbound/metrics_inbound_1800.json';
import inbound3600 from './inbound/metrics_inbound_3600.json';
/* Outbound Metrics */

import outbound60 from './outbound/metrics_outbound_60.json';
import outbound120 from './outbound/metrics_outbound_120.json';
import outbound300 from './outbound/metrics_outbound_300.json';
import outbound600 from './outbound/metrics_outbound_600.json';
import outbound1800 from './outbound/metrics_outbound_1800.json';
import outbound3600 from './outbound/metrics_outbound_3600.json';

export const travelControlMetrics = {
  inbound: {
    60: inbound60,
    120: inbound120,
    300: inbound300,
    600: inbound600,
    1800: inbound1800,
    3600: inbound3600,
  },
  outbound: {
    60: outbound60,
    120: outbound120,
    300: outbound300,
    600: outbound600,
    1800: outbound1800,
    3600: outbound3600,
  },
};

export default travelControlMetrics;
