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
  ACSCheckResults,
  ACSImageScanResult,
} from '@aonic-ui/pipelines/dist/esm/types/components/Output/types';

export const acsImageScanResult: ACSImageScanResult = {
  result: {
    summary: {
      CRITICAL: 0,
      IMPORTANT: 1,
      LOW: 4,
      MODERATE: 4,
      'TOTAL-COMPONENTS': 6,
      'TOTAL-VULNERABILITIES': 9,
    },
    vulnerabilities: [
      {
        cveId: 'CVE-2005-2945',
        cveSeverity: 'LOW',
        cveInfo: 'https://nvd.nist.gov/vuln/detail/CVE-2005-2945',
        componentName: 'arc',
        componentVersion: '3.5.0',
        componentFixedVersion: '2.3.1',
      },
      {
        cveId: 'CVE-2005-2992',
        cveSeverity: 'LOW',
        cveInfo: 'https://nvd.nist.gov/vuln/detail/CVE-2005-2992',
        componentName: 'arc',
        componentVersion: '3.5.0',
        componentFixedVersion: '1.7.1',
      },
      {
        cveId: 'CVE-2021-3468',
        cveSeverity: 'MODERATE',
        cveInfo: 'https://access.redhat.com/security/cve/CVE-2021-3468',
        componentName: 'avahi-libs',
        componentVersion: '0.7-20.el8.aarch64',
        componentFixedVersion: '',
      },

      {
        cveId: 'RHSA-2023:7029',
        cveSeverity: 'MODERATE',
        cveInfo: 'https://access.redhat.com/errata/RHSA-2023:7029',
        componentName: 'libX11',
        componentVersion: '1.6.8-5.el8.aarch64',
        componentFixedVersion: '0:1.6.8-6.el8',
      },
      {
        cveId: 'CVE-2022-3555',
        cveSeverity: 'LOW',
        cveInfo: 'https://access.redhat.com/security/cve/CVE-2022-3555',
        componentName: 'libX11',
        componentVersion: '1.6.8-5.el8.aarch64',
        componentFixedVersion: '',
      },
      {
        cveId: 'CVE-2022-3554',
        cveSeverity: 'MODERATE',
        cveInfo: 'https://access.redhat.com/security/cve/CVE-2022-3554',
        componentName: 'libX11-common',
        componentVersion: '1.6.8-5.el8.noarch',
        componentFixedVersion: '',
      },
      {
        cveId: 'CVE-2023-43785',
        cveSeverity: 'MODERATE',
        cveInfo: 'https://access.redhat.com/security/cve/CVE-2023-43785',
        componentName: 'libX11-common',
        componentVersion: '1.6.8-5.el8.noarch',
        componentFixedVersion: '',
      },
      {
        cveId: 'CVE-2019-9923',
        cveSeverity: 'LOW',
        cveInfo: 'https://access.redhat.com/security/cve/CVE-2019-9923',
        componentName: 'tar',
        componentVersion: '2:1.30-9.el8.aarch64',
        componentFixedVersion: '',
      },
      {
        cveId: 'CVE-2023-4586',
        cveSeverity: 'IMPORTANT',
        cveInfo: 'https://nvd.nist.gov/vuln/detail/CVE-2023-4586',
        componentName: 'netty',
        componentVersion: '4.1.100.final',
        componentFixedVersion: '5.0.0',
      },
    ],
  },
};

export const acsImageCheckResults: ACSCheckResults = {
  results: [
    {
      metadata: {
        id: 'quay.io/bsutter/quarkus-demo:v2',
        additionalInfo: {
          name: 'quay.io/bsutter/quarkus-demo:v2',
          type: 'image',
        },
      },
      summary: {
        CRITICAL: 0,
        HIGH: 1,
        LOW: 1,
        MEDIUM: 0,
        TOTAL: 2,
      },
      violatedPolicies: [
        {
          name: 'Fixable Severity at least Important',
          severity: 'HIGH',
          description:
            'Alert on deployments with fixable vulnerabilities with a Severity Rating at least Important',
          violation: [
            "Fixable CVE-2023-6394 (CVSS 9.1) (severity Critical) found in component 'quarkus' (version 3.5.0), resolved by version 3.6.0",
          ],
          remediation:
            'Use your package manager to update to a fixed version in future builds or speak with your security team to mitigate the vulnerabilities.',
          failingCheck: true,
        },
        {
          name: 'Red Hat Package Manager in Image',
          severity: 'LOW',
          description:
            'Alert on deployments with components of the Red Hat/Fedora/CentOS package management system.',
          violation: [
            "Image includes component 'microdnf' (version 3.8.0-2.el8.aarch64)",
            "Image includes component 'rpm' (version 4.14.3-26.el8.aarch64)",
          ],
          remediation:
            "Run `rpm -e --nodeps $(rpm -qa '*rpm*' '*dnf*' '*libsolv*' '*hawkey*' 'yum*')` in the image build for production containers.",
          failingCheck: false,
        },
      ],
    },
  ],
  summary: {
    CRITICAL: 0,
    HIGH: 1,
    LOW: 1,
    MEDIUM: 0,
    TOTAL: 2,
  },
};

export const acsDeploymentCheck: ACSCheckResults = {
  results: [
    {
      metadata: {
        id: '2c4150a8-b7bf-46bb-89fc-84d09b345b2f',
        additionalInfo: {
          name: 'nodejs-ex',
          namespace: 'test-namespace',
          type: 'Deployment',
        },
      },
      summary: {
        CRITICAL: 0,
        HIGH: 0,
        LOW: 0,
        MEDIUM: 2,
        TOTAL: 2,
      },
      violatedPolicies: [
        {
          name: 'No resource requests or limits specified',
          severity: 'MEDIUM',
          description:
            'Alert on deployments that have containers without resource requests and limits',
          violation: [
            "CPU limit set to 0 cores for container 'nodejs-ex'",
            "CPU request set to 0 cores for container 'nodejs-ex'",
            "Memory limit set to 0 MB for container 'nodejs-ex'",
            "Memory request set to 0 MB for container 'nodejs-ex'",
          ],
          remediation:
            'Specify the requests and limits of CPU and Memory for your deployment.',
          failingCheck: true,
        },
        {
          name: 'Pod Service Account Token Automatically Mounted',
          severity: 'MEDIUM',
          description:
            'Protect pod default service account tokens from compromise by minimizing the mounting of the default service account token to only those pods whose application requires interaction with the Kubernetes API.',
          violation: [
            'Deployment mounts the service account tokens.',
            "Namespace has name 'prabhu'",
            "Service Account is set to 'default'",
          ],
          remediation:
            "Add `automountServiceAccountToken: false` or a value distinct from 'default' for the `serviceAccountName` key to the deployment's Pod configuration.",
          failingCheck: false,
        },
      ],
    },
  ],
  summary: {
    CRITICAL: 0,
    HIGH: 0,
    LOW: 0,
    MEDIUM: 2,
    TOTAL: 2,
  },
};
