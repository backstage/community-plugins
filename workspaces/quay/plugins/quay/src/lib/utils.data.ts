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
export const mockLayer = {
  Name: 'TestLayer',
  ParentName: 'ParentLayer',
  NamespaceName: 'Namespace',
  IndexedByVersion: 1,
  Features: [
    {
      Name: 'openssl-libs',
      VersionFormat: '',
      NamespaceName: '',
      AddedBy:
        'sha256:2fe2b9e85b7c384f07f3665132f448c43aa7a5a600f89b5adde70258bc22e5f2',
      Version: '1:1.1.1k-6.el8_5',
      Vulnerabilities: [
        {
          Severity: 'Medium',
          NamespaceName: 'RHEL8-rhel-8',
          Link: 'https://access.redhat.com/errata/RHSA-2022:5818 https://access.redhat.com/security/cve/CVE-2022-1292 https://access.redhat.com/security/cve/CVE-2022-2068 https://access.redhat.com/security/cve/CVE-2022-2097',
          FixedBy: '1:1.1.1k-7.el8_6',
          Description:
            'OpenSSL is a toolkit that implements the Secure Sockets Layer (SSL) and Transport Layer Security (TLS) protocols, as well as a full-strength general-purpose cryptography library.\n\nSecurity Fix(es):\n\n* openssl: c_rehash script allows command injection (CVE-2022-1292)\n\n* openssl: the c_rehash script allows command injection (CVE-2022-2068)\n\n* openssl: AES OCB fails to encrypt some bytes (CVE-2022-2097)\n\nFor more details about the security issue(s), including the impact, a CVSS score, acknowledgments, and other related information, refer to the CVE page(s) listed in the References section.',
          Name: 'RHSA-2022:5818: openssl security update (Moderate)',
          Metadata: {
            UpdatedBy: 'RHEL8-rhel-8',
            RepoName: 'cpe:/o:redhat:enterprise_linux:8::baseos',
            RepoLink: null,
            DistroName: 'Red Hat Enterprise Linux Server',
            DistroVersion: '8',
            NVD: {
              CVSSv3: {
                Vectors: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
                Score: 9.8,
              },
            },
          },
        },
        {
          Severity: 'High',
          NamespaceName: 'RHEL8-rhel-8',
          Link: 'https://access.redhat.com/errata/RHSA-2023:1405 https://access.redhat.com/security/cve/CVE-2022-4304 https://access.redhat.com/security/cve/CVE-2022-4450 https://access.redhat.com/security/cve/CVE-2023-0215 https://access.redhat.com/security/cve/CVE-2023-0286',
          FixedBy: '1:1.1.1k-9.el8_7',
          Description:
            'OpenSSL is a toolkit that implements the Secure Sockets Layer (SSL) and Transport Layer Security (TLS) protocols, as well as a full-strength general-purpose cryptography library.\n\nSecurity Fix(es):\n\n* openssl: X.400 address type confusion in X.509 GeneralName (CVE-2023-0286)\n\n* openssl: timing attack in RSA Decryption implementation (CVE-2022-4304)\n\n* openssl: double free after calling PEM_read_bio_ex (CVE-2022-4450)\n\n* openssl: use-after-free following BIO_new_NDEF (CVE-2023-0215)\n\nFor more details about the security issue(s), including the impact, a CVSS score, acknowledgments, and other related information, refer to the CVE page(s) listed in the References section.',
          Name: 'RHSA-2023:1405: openssl security update (Important)',
          Metadata: {
            UpdatedBy: 'RHEL8-rhel-8',
            RepoName: 'cpe:/o:redhat:enterprise_linux:8::baseos',
            RepoLink: null,
            DistroName: 'Red Hat Enterprise Linux Server',
            DistroVersion: '8',
            NVD: {
              CVSSv3: {
                Vectors: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H',
                Score: 7.5,
              },
            },
          },
        },
        {
          Severity: 'Low',
          NamespaceName: 'RHEL8-rhel-8-including-unpatched',
          Link: 'https://access.redhat.com/errata/RHSA-2023:7877 https://access.redhat.com/security/cve/CVE-2023-3446 https://access.redhat.com/security/cve/CVE-2023-3817 https://access.redhat.com/security/cve/CVE-2023-5678',
          FixedBy: '1:1.1.1k-12.el8_9',
          Description:
            'OpenSSL is a toolkit that implements the Secure Sockets Layer (SSL) and Transport Layer Security (TLS) protocols, as well as a full-strength general-purpose cryptography library.\n\nSecurity Fix(es):\n\n* openssl: Excessive time spent checking DH keys and parameters (CVE-2023-3446)\n\n* OpenSSL: Excessive time spent checking DH q parameter value (CVE-2023-3817)\n\n* openssl: Generating excessively long X9.42 DH keys or checking excessively long X9.42 DH keys or parameters may be very slow (CVE-2023-5678)\n\nFor more details about the security issue(s), including the impact, a CVSS score, acknowledgments, and other related information, refer to the CVE page(s) listed in the References section.',
          Name: 'RHSA-2023:7877: openssl security update (Low)',
          Metadata: {
            UpdatedBy: 'RHEL8-rhel-8-including-unpatched',
            RepoName: 'cpe:/o:redhat:enterprise_linux:8::baseos',
            RepoLink: null,
            DistroName: 'Red Hat Enterprise Linux Server',
            DistroVersion: '8',
            NVD: {
              CVSSv3: {
                Vectors: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L',
                Score: 5.3,
              },
            },
          },
        },
      ],
    },
    {
      Name: 'ncurses-base',
      VersionFormat: '',
      NamespaceName: '',
      AddedBy:
        'sha256:2fe2b9e85b7c384f07f3665132f448c43aa7a5a600f89b5adde70258bc22e5f2',
      Version: '6.1-9.20180224.el8',
      Vulnerabilities: [
        {
          Severity: 'Medium',
          NamespaceName: 'RHEL8-rhel-8',
          Link: 'https://access.redhat.com/errata/RHSA-2023:5249 https://access.redhat.com/security/cve/CVE-2023-29491',
          FixedBy: '0:6.1-9.20180224.el8_8.1',
          Description:
            'The ncurses (new curses) library routines are a terminal-independent method of updating character screens with reasonable optimization. The ncurses packages contain support utilities including a terminfo compiler tic, a decompiler infocmp, clear, tput, tset, and a termcap conversion tool captoinfo.\n\nSecurity Fix(es):\n\n* ncurses: Local users can trigger security-relevant memory corruption via malformed data (CVE-2023-29491)\n\nFor more details about the security issue(s), including the impact, a CVSS score, acknowledgments, and other related information, refer to the CVE page(s) listed in the References section.',
          Name: 'RHSA-2023:5249: ncurses security update (Moderate)',
          Metadata: {
            UpdatedBy: 'RHEL8-rhel-8',
            RepoName: 'cpe:/o:redhat:enterprise_linux:8::baseos',
            RepoLink: null,
            DistroName: 'Red Hat Enterprise Linux Server',
            DistroVersion: '8',
            NVD: {
              CVSSv3: {
                Vectors: 'CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H',
                Score: 7.8,
              },
            },
          },
        },
      ],
    },
    {
      Name: 'Feature1',
      VersionFormat: '1.0.0',
      NamespaceName: 'Namespace',
      AddedBy: 'Tester',
      Version: '1.0.0',
      Vulnerabilities: [
        {
          Severity: 'High',
          NamespaceName: 'Namespace',
          Link: 'https://example.com',
          FixedBy: 'Fixer',
          Description: 'Sample vulnerability',
          Name: 'Vuln1',
          Metadata: {
            UpdatedBy: 'Updater',
            RepoName: 'Repo',
            RepoLink: 'https://repo.example.com',
            DistroName: 'Ubuntu',
            DistroVersion: '18.04',
            NVD: {
              CVSSv3: {
                Vectors: 'CVSSv3 Vectors',
                Score: 7.5,
              },
            },
          },
        },
      ],
    },
    {
      Name: 'Feature2',
      VersionFormat: '2.0.0',
      NamespaceName: 'Namespace',
      AddedBy: 'Tester',
      Version: '2.0.0',
      Vulnerabilities: [
        {
          Severity: 'High',
          NamespaceName: 'Namespace',
          Link: 'https://example.com',
          FixedBy: 'Fixer',
          Description: 'Another vulnerability',
          Name: 'Vuln2',
          Metadata: {
            UpdatedBy: 'Updater',
            RepoName: 'Repo',
            RepoLink: 'https://repo.example.com',
            DistroName: 'Ubuntu',
            DistroVersion: '20.04',
            NVD: {
              CVSSv3: {
                Vectors: 'CVSSv3 Vectors',
                Score: 5.0,
              },
            },
          },
        },
      ],
    },
  ],
};
