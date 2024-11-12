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
  Layer,
  QuayTagData,
  VulnerabilityOrder,
  VulnerabilitySeverity,
} from '../types';

export const SEVERITY_COLORS = new Proxy(
  new Map([
    [VulnerabilitySeverity.Critical, '#7D1007'],
    [VulnerabilitySeverity.High, '#C9190B'],
    [VulnerabilitySeverity.Medium, '#EC7A08'],
    [VulnerabilitySeverity.Low, '#F0AB00'],
    [VulnerabilitySeverity.None, '#3E8635'],
  ]) as any,
  {
    get: (o: Map<VulnerabilitySeverity, string>, k: VulnerabilitySeverity) =>
      o.has(k) ? o.get(k) : '#8A8D90',
  },
);

export const vulnerabilitySummary = (layer: Layer): string => {
  const summary: Record<string, number> = {};

  layer?.Features.forEach(feature => {
    feature.Vulnerabilities?.forEach(vulnerability => {
      const { Severity } = vulnerability;
      if (!summary[Severity]) {
        summary[Severity] = 0;
      }
      summary[Severity]++;
    });
  });

  const scanResults = Object.entries(summary)
    .sort((a, b) => {
      const severityA = VulnerabilityOrder[a[0] as VulnerabilitySeverity];
      const severityB = VulnerabilityOrder[b[0] as VulnerabilitySeverity];

      return severityA - severityB;
    })
    .map(([severity, count]) => `${severity}: ${count}`)
    .join(', ');
  return scanResults.trim() !== '' ? scanResults : 'Passed';
};

const securityScanOrder = [
  'High',
  'Medium',
  'Low',
  'Passed',
  'Scanning',
  'Queued',
  'Unscanned',
  'Unsupported',
];

export const capitalizeFirstLetter = (s: string): string => {
  return s.charAt(0).toLocaleUpperCase('en-US') + s.slice(1);
};

export const securityScanComparator = (
  ar: QuayTagData,
  br: QuayTagData,
  order: 'asc' | 'desc' = 'desc',
) => {
  const a = vulnerabilitySummary(ar.securityDetails);
  const b = vulnerabilitySummary(br.securityDetails);

  const parseScan = (scan: string) => {
    const values: { [key: string]: number } = {
      High: 0,
      Medium: 0,
      Low: 0,
    };
    scan.split(', ').forEach((part: string) => {
      const [key, value] = part.split(': ');
      if (values[key] !== undefined) {
        values[key] = parseInt(value, 10);
      }
    });
    return values;
  };

  const aParts = a.split(', ');
  const bParts = b.split(', ');

  const multiplier = order === 'asc' ? 1 : -1;

  if (
    aParts.length >= 1 &&
    bParts.length >= 1 &&
    aParts[0] !== 'Passed' &&
    bParts[0] !== 'Passed'
  ) {
    const aParsed = parseScan(a);
    const bParsed = parseScan(b);

    if (aParsed.High !== bParsed.High) {
      return (bParsed.High - aParsed.High) * multiplier;
    }
    if (aParsed.Medium !== bParsed.Medium) {
      return (bParsed.Medium - aParsed.Medium) * multiplier;
    }
    if (aParsed.Low !== bParsed.Low) {
      return (bParsed.Low - aParsed.Low) * multiplier;
    }
  }

  const finalAValue = capitalizeFirstLetter(
    ar.securityStatus === 'scanned'
      ? aParts[0].split(':')[0]
      : (ar.securityStatus ?? 'scanning'),
  );

  const finalBValue = capitalizeFirstLetter(
    br.securityStatus === 'scanned'
      ? bParts[0].split(':')[0]
      : (br.securityStatus ?? 'scanning'),
  );

  if (finalAValue === 'Scanning' || finalBValue === 'Scanning') return 1;

  return (
    (securityScanOrder.indexOf(finalAValue) -
      securityScanOrder.indexOf(finalBValue)) *
    multiplier
  );
};
