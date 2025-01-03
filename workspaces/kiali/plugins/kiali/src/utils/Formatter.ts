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
type D3FormatFunc = (
  specifier: string,
) => (n: number | { valueOf(): number }) => string;

const formatSI = (
  d3Format: D3FormatFunc,
  val: number,
  suffix: string,
  withUnit: boolean,
): string => {
  const fmt = d3Format('~s')(val);
  let si = '';
  // Insert space before SI
  // "fmt" can be something like:
  // - "9k" => we want "9 kB"
  // - "9" => we want "9 B"
  for (let i = fmt.length - 1; i >= 0; i--) {
    const c = fmt.charAt(i);
    if (c >= '0' && c <= '9') {
      const res = fmt.substr(0, i + 1);
      return withUnit ? `${res} ${si}${suffix}` : res;
    }
    si = c + si;
  }
  // Weird: no number found?
  return withUnit ? fmt + suffix : fmt;
};

const formatData = (
  d3Format: D3FormatFunc,
  val: number,
  threshold: number,
  units: string[],
  withUnit: boolean,
): string => {
  if (Math.abs(val) < threshold) {
    return `${val} `;
  }
  let u = -1;
  let value = val;
  do {
    value /= threshold;
    ++u;
  } while (Math.abs(value) >= threshold && u < units.length - 1);
  const unit = d3Format('~r')(value);
  return withUnit ? `${unit} ${units[u]}` : unit;
};

const formatDataSI = (
  d3Format: D3FormatFunc,
  val: number,
  suffix: string,
  withUnit: boolean,
): string => {
  const formD = formatData(
    d3Format,
    val,
    1000,
    ['k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'],
    withUnit,
  );
  return withUnit ? formD + suffix : formD;
};

const formatDataIEC = (
  d3Format: D3FormatFunc,
  val: number,
  suffix: string,
  withUnit: boolean,
): string => {
  const formD = formatData(
    d3Format,
    val,
    1024,
    ['Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi', 'Yi'],
    withUnit,
  );
  return withUnit ? formD + suffix : formD;
};

export const getUnit = (
  d3Format: D3FormatFunc,
  unit: string,
  value: number,
) => {
  // Round to dismiss float imprecision
  const val = Math.round(value * 10000) / 10000;
  let unitResult = '';
  switch (unit) {
    case 'seconds':
      unitResult = formatSI(d3Format, val, 's', true);
      break;
    case 'bytes':
    case 'bytes-si':
      unitResult = formatDataSI(d3Format, val, 'B', true);
      break;
    case 'bytes-iec':
      unitResult = formatDataIEC(d3Format, val, 'B', true);
      break;
    case 'bitrate':
    case 'bitrate-si':
      unitResult = formatDataSI(d3Format, val, 'bit/s', true);
      break;
    case 'bitrate-iec':
      unitResult = formatDataIEC(d3Format, val, 'bit/s', true);
      break;
    case 'connrate':
      unitResult = formatDataSI(d3Format, val, 'conn/s', true);
      break;
    case 'msgrate':
      unitResult = formatDataSI(d3Format, val, 'msg/s', true);
      break;
    default:
      // Fallback to default SI scaler:
      unitResult = formatDataSI(d3Format, val, unit, true);
      break;
  }
  return unitResult.split(' ')[1];
};

export const getFormatter = (
  d3Format: D3FormatFunc,
  unit: string,
  withUnit: boolean = false,
) => {
  return (val: number): string => {
    // Round to dismiss float imprecision
    const value = Math.round(val * 10000) / 10000;
    switch (unit) {
      case 'seconds':
        return formatSI(d3Format, value, 's', withUnit);
      case 'bytes':
      case 'bytes-si':
        return formatDataSI(d3Format, value, 'B', withUnit);
      case 'bytes-iec':
        return formatDataIEC(d3Format, value, 'B', withUnit);
      case 'bitrate':
      case 'bitrate-si':
        return formatDataSI(d3Format, value, 'bit/s', withUnit);
      case 'bitrate-iec':
        return formatDataIEC(d3Format, value, 'bit/s', withUnit);
      case 'connrate':
        return formatDataSI(d3Format, value, 'conn/s', withUnit);
      case 'msgrate':
        return formatDataSI(d3Format, value, 'msg/s', withUnit);
      default:
        // Fallback to default SI scaler:
        return formatDataSI(d3Format, value, unit, withUnit);
    }
  };
};
