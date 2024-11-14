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
  securityDetails,
  v1securityDetails,
  v2securityDetails,
  v3securityDetails,
} from '../../dev/__data__/security_vulnerabilities';
import { tags } from '../../dev/__data__/tags';
import { Layer, VulnerabilitySeverity } from '../types';
import {
  securityScanComparator,
  SEVERITY_COLORS,
  vulnerabilitySummary,
} from './utils';
import { mockLayer } from './utils.data';

describe('SEVERITY_COLORS', () => {
  it('should return the correct hex color code', () => {
    const severity = VulnerabilitySeverity.Critical;

    const result = SEVERITY_COLORS[severity];

    expect(result).toBe('#7D1007');
  });

  it('should return the default color code if the severity is unknown', () => {
    const result = SEVERITY_COLORS[VulnerabilitySeverity.Unknown];

    expect(result).toBe('#8A8D90');
  });
});

describe('vulnerabilitySummary', () => {
  test('returns "Passed" when no vulnerabilities are present', () => {
    const layer: Layer = {
      Name: 'TestLayer',
      ParentName: 'ParentLayer',
      NamespaceName: 'Namespace',
      IndexedByVersion: 1,
      Features: [
        {
          Name: 'Feature1',
          VersionFormat: '1.0.0',
          NamespaceName: 'Namespace',
          AddedBy: 'Tester',
          Version: '1.0.0',
          Vulnerabilities: [],
        },
      ],
    };

    expect(vulnerabilitySummary(layer)).toBe('Passed');
  });

  test('returns a string with vulnerability counts in the correct order', () => {
    const result = vulnerabilitySummary(mockLayer as Layer);
    expect(result).toMatch('High: 3, Medium: 2, Low: 1');
  });
});

describe('compareSecurityScans', () => {
  const { tags: tagArray } = tags;

  const data = [
    {
      ...tagArray[0],
      securityStatus: 'scanned',
      securityDetails: mockLayer,
    },
    {
      ...tagArray[0],
      name: 'stable',
      securityStatus: 'scanned',
      securityDetails: securityDetails?.data?.Layer,
    },
    {
      ...tagArray[1],
      securityStatus: 'scanned',
      securityDetails: v3securityDetails?.data?.Layer,
    },
    {
      ...tagArray[2],
      securityStatus: 'scanned',
      securityDetails: {
        ...securityDetails?.data?.Layer,
        Features: [],
      },
    },
    {
      ...tagArray[3],
      securityStatus: 'queued',
      securityDetails: v2securityDetails?.data?.Layer,
    },
    {
      ...tagArray[4],
      securityStatus: 'unsupported',
      securityDetails: v1securityDetails?.data?.Layer,
    },
  ] as any[];

  it('should sort security scan values in the ascending order', () => {
    const expected = [
      'latest-linux-arm64', // High: 3, Medium: 2, Low: 1 ; High value
      'stable', // High: 2, Medium: 2, Low: 1 ; High value
      'v4', // Medium: 1;  No High, but has Medium and Low
      'v3', // Passed
      'v2', // Queued;
      'v1', // Unsupported
    ];

    const names = data
      .sort((a, b) => securityScanComparator(a, b, 'asc'))
      .map(tag => tag.name);
    expect(names).toEqual(expected);
  });
  it('should sort security scan values in the descending order', () => {
    const expected = [
      'v1', // Unsupported
      'v2', // Queued;
      'v4', // Passed
      'v3', // Medium: 1;  No High, but has Medium and Low
      'stable', // High: 2, Medium: 2, Low: 1 ; High value
      'latest-linux-arm64', // High: 3, Medium: 2, Low: 1 ; High value
    ];

    const names = data
      .sort((a, b) => securityScanComparator(a, b, 'desc'))
      .map(tag => tag.name);
    expect(names).toEqual(expected);
  });

  it('should not perform sort on the scanning row', () => {
    const mockData = [
      {
        ...tagArray[0],
        name: 'v1beta',
        securityStatus: 'scanning',
      },
      ...data,
    ];
    const expected = [
      'v1beta', // Scanning; Show loading indicator in UI.
      'v1', // Unsupported
      'v2', // Queued;
      'v4', // Passed
      'v3', // Medium: 1;  No High, but has Medium and Low
      'stable', // High: 2, Medium: 2, Low: 1 ; High value
      'latest-linux-arm64', // High: 3, Medium: 2, Low: 1 ; High value
    ];

    // Scanning row should not change the order
    const names = mockData
      .sort((a, b) => securityScanComparator(a, b, 'desc'))
      .map(tag => tag.name);
    expect(names).toEqual(expected);

    const mockData1 = [
      data[0], // v1
      {
        ...tagArray[0],
        name: 'v1beta',
        securityStatus: 'scanning',
      },
      data[1], // v2
    ];
    const expectedNames = [
      'v1', // Unsupported
      'v1beta', // Scanning; Show loading indicator in UI.
      'v2', // Queued;
    ];

    const tagNames = mockData1
      .sort((a, b) => securityScanComparator(a, b, 'desc'))
      .map(tag => tag.name);
    expect(tagNames).toEqual(expectedNames);
  });
});
