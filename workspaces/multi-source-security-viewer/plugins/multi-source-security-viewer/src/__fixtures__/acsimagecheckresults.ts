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
export const mockACSImageCheckResults = {
  results: [
    {
      metadata: {
        id: 'quay.io/jduimovich0/bootstrap:jenkins-5178c20223b3c643455efcc3a7e2540eedcd6ec4@sha256:3d4960366bebdf762c58599082ed8367e8af6697848cfe50a27d2b6cd14a2c01',
        additionalInfo: {
          name: 'quay.io/jduimovich0/bootstrap:jenkins-5178c20223b3c643455efcc3a7e2540eedcd6ec4@sha256:3d4960366bebdf762c58599082ed8367e8af6697848cfe50a27d2b6cd14a2c01',
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
            "Fixable RHSA-2023:6745 (CVSS 8.1) (severity Important) found in component 'curl-minimal' (version 7.76.1-23.el9_2.4.x86_64), resolved by version 0:7.76.1-26.el9_3.2",
            "Fixable RHSA-2023:6745 (CVSS 8.1) (severity Important) found in component 'libcurl-devel' (version 7.76.1-23.el9_2.4.x86_64), resolved by version 0:7.76.1-26.el9_3.2",
            "Fixable RHSA-2023:6745 (CVSS 8.1) (severity Important) found in component 'libcurl-minimal' (version 7.76.1-23.el9_2.4.x86_64), resolved by version 0:7.76.1-26.el9_3.2",
            "Fixable RHSA-2023:6746 (CVSS 7.5) (severity Important) found in component 'libnghttp2' (version 1.43.0-5.el9_2.1.x86_64), resolved by version 0:1.43.0-5.el9_3.1",
            "Fixable RHSA-2024:1438 (CVSS 7.5) (severity Important) found in component 'nodejs' (version 1:16.20.2-3.el9_2.x86_64), resolved by version 1:16.20.2-4.el9_3",
            "Fixable RHSA-2024:1438 (CVSS 7.5) (severity Important) found in component 'nodejs-docs' (version 1:16.20.2-3.el9_2.noarch), resolved by version 1:16.20.2-4.el9_3",
            "Fixable RHSA-2024:1438 (CVSS 7.5) (severity Important) found in component 'nodejs-full-i18n' (version 1:16.20.2-3.el9_2.x86_64), resolved by version 1:16.20.2-4.el9_3",
            "Fixable RHSA-2024:1438 (CVSS 7.5) (severity Important) found in component 'nodejs-libs' (version 1:16.20.2-3.el9_2.x86_64), resolved by version 1:16.20.2-4.el9_3",
            "Fixable RHSA-2024:1438 (CVSS 7.5) (severity Important) found in component 'npm' (version 1:8.19.4-1.16.20.2.3.el9_2.x86_64), resolved by version 1:8.19.4-1.16.20.2.4.el9_3",
            "Fixable RHSA-2024:1462 (CVSS 7.5) (severity Important) found in component 'go-toolset' (version 1.19.13-1.el9_2.x86_64), resolved by version 0:1.20.12-2.el9_3",
            "Fixable RHSA-2024:1462 (CVSS 7.5) (severity Important) found in component 'golang' (version 1.19.13-1.el9_2.x86_64), resolved by version 0:1.20.12-2.el9_3",
            "Fixable RHSA-2024:1462 (CVSS 7.5) (severity Important) found in component 'golang-bin' (version 1.19.13-1.el9_2.x86_64), resolved by version 0:1.20.12-2.el9_3",
            "Fixable RHSA-2024:1462 (CVSS 7.5) (severity Important) found in component 'golang-src' (version 1.19.13-1.el9_2.noarch), resolved by version 0:1.20.12-2.el9_3",
            "Fixable RHSA-2024:1963 (CVSS 7.5) (severity Important) found in component 'go-toolset' (version 1.19.13-1.el9_2.x86_64), resolved by version 0:1.20.12-4.el9_3",
            "Fixable RHSA-2024:1963 (CVSS 7.5) (severity Important) found in component 'golang' (version 1.19.13-1.el9_2.x86_64), resolved by version 0:1.20.12-4.el9_3",
            "Fixable RHSA-2024:1963 (CVSS 7.5) (severity Important) found in component 'golang-bin' (version 1.19.13-1.el9_2.x86_64), resolved by version 0:1.20.12-4.el9_3",
            "Fixable RHSA-2024:1963 (CVSS 7.5) (severity Important) found in component 'golang-src' (version 1.19.13-1.el9_2.noarch), resolved by version 0:1.20.12-4.el9_3",
            "Fixable RHSA-2024:2562 (CVSS 7.5) (severity Important) found in component 'go-toolset' (version 1.19.13-1.el9_2.x86_64), resolved by version 0:1.21.9-2.el9_4",
            "Fixable RHSA-2024:2562 (CVSS 7.5) (severity Important) found in component 'golang' (version 1.19.13-1.el9_2.x86_64), resolved by version 0:1.21.9-2.el9_4",
            "Fixable RHSA-2024:2562 (CVSS 7.5) (severity Important) found in component 'golang-bin' (version 1.19.13-1.el9_2.x86_64), resolved by version 0:1.21.9-2.el9_4",
            "Fixable RHSA-2024:2562 (CVSS 7.5) (severity Important) found in component 'golang-src' (version 1.19.13-1.el9_2.noarch), resolved by version 0:1.21.9-2.el9_4",
            "Fixable RHSA-2024:2910 (CVSS 7.5) (severity Important) found in component 'nodejs' (version 1:16.20.2-3.el9_2.x86_64), resolved by version 1:16.20.2-8.el9_4",
            "Fixable RHSA-2024:2910 (CVSS 7.5) (severity Important) found in component 'nodejs-docs' (version 1:16.20.2-3.el9_2.noarch), resolved by version 1:16.20.2-8.el9_4",
            "Fixable RHSA-2024:2910 (CVSS 7.5) (severity Important) found in component 'nodejs-full-i18n' (version 1:16.20.2-3.el9_2.x86_64), resolved by version 1:16.20.2-8.el9_4",
            "Fixable RHSA-2024:2910 (CVSS 7.5) (severity Important) found in component 'nodejs-libs' (version 1:16.20.2-3.el9_2.x86_64), resolved by version 1:16.20.2-8.el9_4",
            "Fixable RHSA-2024:2910 (CVSS 7.5) (severity Important) found in component 'npm' (version 1:8.19.4-1.16.20.2.3.el9_2.x86_64), resolved by version 1:8.19.4-1.16.20.2.8.el9_4",
            "Fixable RHSA-2024:3339 (CVSS 8.8) (severity Important) found in component 'glibc' (version 2.34-60.el9_2.7.x86_64), resolved by version 0:2.34-100.el9_4.2",
            "Fixable RHSA-2024:3339 (CVSS 8.8) (severity Important) found in component 'glibc-common' (version 2.34-60.el9_2.7.x86_64), resolved by version 0:2.34-100.el9_4.2",
            "Fixable RHSA-2024:3339 (CVSS 8.8) (severity Important) found in component 'glibc-devel' (version 2.34-60.el9_2.7.x86_64), resolved by version 0:2.34-100.el9_4.2",
            "Fixable RHSA-2024:3339 (CVSS 8.8) (severity Important) found in component 'glibc-gconv-extra' (version 2.34-60.el9_2.7.x86_64), resolved by version 0:2.34-100.el9_4.2",
            "Fixable RHSA-2024:3339 (CVSS 8.8) (severity Important) found in component 'glibc-headers' (version 2.34-60.el9_2.7.x86_64), resolved by version 0:2.34-100.el9_4.2",
            "Fixable RHSA-2024:3339 (CVSS 8.8) (severity Important) found in component 'glibc-langpack-en' (version 2.34-60.el9_2.7.x86_64), resolved by version 0:2.34-100.el9_4.2",
            "Fixable RHSA-2024:3339 (CVSS 8.8) (severity Important) found in component 'glibc-locale-source' (version 2.34-60.el9_2.7.x86_64), resolved by version 0:2.34-100.el9_4.2",
            "Fixable RHSA-2024:3339 (CVSS 8.8) (severity Important) found in component 'glibc-minimal-langpack' (version 2.34-60.el9_2.7.x86_64), resolved by version 0:2.34-100.el9_4.2",
            "Fixable RHSA-2024:3513 (CVSS 8.6) (severity Important) found in component 'less' (version 590-2.el9_2.x86_64), resolved by version 0:590-4.el9_4",
            "Fixable RHSA-2024:4078 (CVSS 7.8) (severity Important) found in component 'python3' (version 3.9.16-1.el9_2.2.x86_64), resolved by version 0:3.9.18-3.el9_4.1",
            "Fixable RHSA-2024:4078 (CVSS 7.8) (severity Important) found in component 'python3-libs' (version 3.9.16-1.el9_2.2.x86_64), resolved by version 0:3.9.18-3.el9_4.1",
            "Fixable RHSA-2024:4083 (CVSS 9) (severity Important) found in component 'git' (version 2.39.3-1.el9_2.x86_64), resolved by version 0:2.43.5-1.el9_4",
            "Fixable RHSA-2024:4083 (CVSS 9) (severity Important) found in component 'git-core' (version 2.39.3-1.el9_2.x86_64), resolved by version 0:2.43.5-1.el9_4",
            "Fixable RHSA-2024:4083 (CVSS 9) (severity Important) found in component 'git-core-doc' (version 2.39.3-1.el9_2.noarch), resolved by version 0:2.43.5-1.el9_4",
            "Fixable RHSA-2024:4083 (CVSS 9) (severity Important) found in component 'perl-Git' (version 2.39.3-1.el9_2.noarch), resolved by version 0:2.43.5-1.el9_4",
            "Fixable RHSA-2024:4312 (CVSS 8.1) (severity Important) found in component 'openssh' (version 8.7p1-30.el9_2.x86_64), resolved by version 0:8.7p1-38.el9_4.1",
            "Fixable RHSA-2024:4312 (CVSS 8.1) (severity Important) found in component 'openssh-clients' (version 8.7p1-30.el9_2.x86_64), resolved by version 0:8.7p1-38.el9_4.1",
            "Fixable RHSA-2024:5534 (CVSS 8.8) (severity Important) found in component 'python3-setuptools' (version 53.0.0-12.el9.noarch), resolved by version 0:53.0.0-12.el9_4.1",
            "Fixable RHSA-2024:5534 (CVSS 8.8) (severity Important) found in component 'python3-setuptools-wheel' (version 53.0.0-12.el9.noarch), resolved by version 0:53.0.0-12.el9_4.1",
            "Fixable RHSA-2024:6913 (CVSS 7.5) (severity Important) found in component 'go-toolset' (version 1.19.13-1.el9_2.x86_64), resolved by version 0:1.21.13-3.el9_4",
            "Fixable RHSA-2024:6913 (CVSS 7.5) (severity Important) found in component 'golang' (version 1.19.13-1.el9_2.x86_64), resolved by version 0:1.21.13-3.el9_4",
            "Fixable RHSA-2024:6913 (CVSS 7.5) (severity Important) found in component 'golang-bin' (version 1.19.13-1.el9_2.x86_64), resolved by version 0:1.21.13-3.el9_4",
            "Fixable RHSA-2024:6913 (CVSS 7.5) (severity Important) found in component 'golang-src' (version 1.19.13-1.el9_2.noarch), resolved by version 0:1.21.13-3.el9_4",
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
            "Image includes component 'dnf' (version 4.14.0-5.el9_2.noarch)",
            "Image includes component 'rpm' (version 4.16.1.3-22.el9.x86_64)",
            "Image includes component 'yum' (version 4.14.0-5.el9_2.noarch)",
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
