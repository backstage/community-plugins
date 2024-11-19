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
  SecurityDetailsResponse,
  VulnerabilitySeverity,
} from '../../src/types';

export const securityDetails: SecurityDetailsResponse = {
  status: 'scanned',
  data: {
    Layer: {
      Name: 'sha256:69c96c750aa532d92d9cb56cad59159b7cc26b10e39ff4a895c28345d2cd775c',
      ParentName: '',
      NamespaceName: '',
      IndexedByVersion: 4,
      Features: [
        {
          Name: 'libmodulemd',
          VersionFormat: '',
          NamespaceName: '',
          AddedBy:
            'sha256:27844678c499cd28d128544604c99a91d5d692bc905f931297048c44c1764c63',
          Version: '2.13.0-2.el9',
          BaseScores: [],
          CVEIds: [],
          Vulnerabilities: [],
        },
        {
          Name: 'libunistring',
          VersionFormat: '',
          NamespaceName: '',
          AddedBy:
            'sha256:27844678c499cd28d128544604c99a91d5d692bc905f931297048c44c1764c63',
          Version: '0.9.10-15.el9',
          BaseScores: [],
          CVEIds: [],
          Vulnerabilities: [],
        },
        {
          Name: 'gdbm-libs',
          VersionFormat: '',
          NamespaceName: '',
          AddedBy:
            'sha256:27844678c499cd28d128544604c99a91d5d692bc905f931297048c44c1764c63',
          Version: '1:1.19-4.el9',
          BaseScores: [],
          CVEIds: [],
          Vulnerabilities: [],
        },
        {
          Name: 'librepo',
          VersionFormat: '',
          NamespaceName: '',
          AddedBy:
            'sha256:27844678c499cd28d128544604c99a91d5d692bc905f931297048c44c1764c63',
          Version: '1.14.5-1.el9',
          BaseScores: [],
          CVEIds: [],
          Vulnerabilities: [],
        },
        {
          Name: 'rpm',
          VersionFormat: '',
          NamespaceName: '',
          AddedBy:
            'sha256:27844678c499cd28d128544604c99a91d5d692bc905f931297048c44c1764c63',
          Version: '4.16.1.3-22.el9',
          BaseScores: [6.7],
          CVEIds: ['CVE-2021-35937', 'CVE-2021-35938', 'CVE-2021-35939'],
          Vulnerabilities: [
            {
              Severity: VulnerabilitySeverity.Medium,
              NamespaceName: 'RHEL9-rhel-9',
              Link: 'https://access.redhat.com/errata/RHSA-2024:0463 https://access.redhat.com/security/cve/CVE-2021-35937 https://access.redhat.com/security/cve/CVE-2021-35938 https://access.redhat.com/security/cve/CVE-2021-35939',
              FixedBy: '0:4.16.1.3-27.el9_3',
              Description:
                'The RPM Package Manager (RPM) is a command-line driven package management system capable of installing, uninstalling, verifying, querying, and updating software packages.\n\nSecurity Fix(es):\n\n* rpm: TOCTOU race in checks for unsafe symlinks (CVE-2021-35937)\n\n* rpm: races with chown/chmod/capabilities calls during installation (CVE-2021-35938)\n\n* rpm: checks for unsafe symlinks are not performed for intermediary directories (CVE-2021-35939)\n\nFor more details about the security issue(s), including the impact, a CVSS score, acknowledgments, and other related information, refer to the CVE page(s) listed in the References section.',
              Name: 'RHSA-2024:0463: rpm security update (Moderate)',
              Metadata: {
                UpdatedBy: 'RHEL9-rhel-9',
                RepoName: 'cpe:/o:redhat:enterprise_linux:9::baseos',
                RepoLink: null,
                DistroName: 'Red Hat Enterprise Linux Server',
                DistroVersion: '9',
                NVD: {
                  CVSSv3: {
                    Vectors: 'CVSS:3.1/AV:L/AC:L/PR:H/UI:N/S:U/C:H/I:H/A:H',
                    Score: 6.7,
                  },
                },
              },
            },
          ],
        },
        {
          Name: 'libnghttp2',
          VersionFormat: '',
          NamespaceName: '',
          AddedBy:
            'sha256:27844678c499cd28d128544604c99a91d5d692bc905f931297048c44c1764c63',
          Version: '1.43.0-5.el9',
          BaseScores: [7.5, 7.5],
          CVEIds: ['CVE-2023-44487', 'CVE-2024-28182'],
          Vulnerabilities: [
            {
              Severity: VulnerabilitySeverity.Medium,
              NamespaceName: 'RHEL9-rhel-9',
              Link: 'https://access.redhat.com/errata/RHSA-2024:3501 https://access.redhat.com/security/cve/CVE-2024-28182',
              FixedBy: '0:1.43.0-5.el9_4.3',
              Description:
                'libnghttp2 is a library implementing the Hypertext Transfer Protocol version 2 (HTTP/2) protocol in C.\n\nSecurity Fix(es):\n\n* nghttp2: CONTINUATION frames DoS (CVE-2024-28182)\n\nFor more details about the security issue(s), including the impact, a CVSS score, acknowledgments, and other related information, refer to the CVE page(s) listed in the References section.',
              Name: 'RHSA-2024:3501: nghttp2 security update (Moderate)',
              Metadata: {
                UpdatedBy: 'RHEL9-rhel-9',
                RepoName: 'cpe:/o:redhat:enterprise_linux:9::baseos',
                RepoLink: null,
                DistroName: 'Red Hat Enterprise Linux Server',
                DistroVersion: '9',
                NVD: {
                  CVSSv3: {
                    Vectors: '',
                    Score: '',
                  },
                },
              },
            },
            {
              Severity: VulnerabilitySeverity.High,
              NamespaceName: 'RHEL9-rhel-9',
              Link: 'https://access.redhat.com/errata/RHSA-2023:5838 https://access.redhat.com/security/cve/CVE-2023-44487',
              FixedBy: '0:1.43.0-5.el9_2.1',
              Description:
                'libnghttp2 is a library implementing the Hypertext Transfer Protocol version 2 (HTTP/2) protocol in C.\n\nSecurity Fix(es):\n\n* HTTP/2: Multiple HTTP/2 enabled web servers are vulnerable to a DDoS attack (Rapid Reset Attack) (CVE-2023-44487)\n\nFor more details about the security issue(s), including the impact, a CVSS score, acknowledgments, and other related information, refer to the CVE page(s) listed in the References section.',
              Name: 'RHSA-2023:5838: nghttp2 security update (Important)',
              Metadata: {
                UpdatedBy: 'RHEL9-rhel-9',
                RepoName: 'cpe:/o:redhat:enterprise_linux:9::baseos',
                RepoLink: null,
                DistroName: 'Red Hat Enterprise Linux Server',
                DistroVersion: '9',
                NVD: {
                  CVSSv3: {
                    Vectors: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H',
                    Score: 7.5,
                  },
                },
              },
            },
            {
              Severity: VulnerabilitySeverity.High,
              NamespaceName: 'RHEL9-rhel-9',
              Link: 'https://access.redhat.com/errata/RHSA-2023:6746 https://access.redhat.com/security/cve/CVE-2023-44487',
              FixedBy: '0:1.43.0-5.el9_3.1',
              Description:
                'libnghttp2 is a library implementing the Hypertext Transfer Protocol version 2 (HTTP/2) protocol in C.\n\nSecurity Fix(es):\n\n* HTTP/2: Multiple HTTP/2 enabled web servers are vulnerable to a DDoS attack (Rapid Reset Attack) (CVE-2023-44487)\n\nFor more details about the security issue(s), including the impact, a CVSS score, acknowledgments, and other related information, refer to the CVE page(s) listed in the References section.',
              Name: 'RHSA-2023:6746: nghttp2 security update (Important)',
              Metadata: {
                UpdatedBy: 'RHEL9-rhel-9',
                RepoName: 'cpe:/o:redhat:enterprise_linux:9::baseos',
                RepoLink: null,
                DistroName: 'Red Hat Enterprise Linux Server',
                DistroVersion: '9',
                NVD: {
                  CVSSv3: {
                    Vectors: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H',
                    Score: 7.5,
                  },
                },
              },
            },
          ],
        },
        {
          Name: 'libselinux',
          VersionFormat: '',
          NamespaceName: '',
          AddedBy:
            'sha256:27844678c499cd28d128544604c99a91d5d692bc905f931297048c44c1764c63',
          Version: '3.5-1.el9',
          BaseScores: [],
          CVEIds: [],
          Vulnerabilities: [],
        },
        {
          Name: 'glib2',
          VersionFormat: '',
          NamespaceName: '',
          AddedBy:
            'sha256:27844678c499cd28d128544604c99a91d5d692bc905f931297048c44c1764c63',
          Version: '2.68.4-6.el9',
          BaseScores: [7.5],
          CVEIds: ['CVE-2023-29499', 'CVE-2023-32611', 'CVE-2023-32665'],
          Vulnerabilities: [
            {
              Severity: VulnerabilitySeverity.Low,
              NamespaceName: 'RHEL9-rhel-9',
              Link: 'https://access.redhat.com/errata/RHSA-2023:6631 https://access.redhat.com/security/cve/CVE-2023-29499 https://access.redhat.com/security/cve/CVE-2023-32611 https://access.redhat.com/security/cve/CVE-2023-32665',
              FixedBy: '0:2.68.4-11.el9',
              Description:
                'GLib provides the core application building blocks for libraries and applications written in C. It provides the core object system used in GNOME, the main loop implementation, and a large set of utility functions for strings and common data structures.\n\nSecurity Fix(es):\n\n* glib: GVariant offset table entry size is not checked in is_normal() (CVE-2023-29499)\n\n* glib: g_variant_byteswap() can take a long time with some non-normal inputs (CVE-2023-32611)\n\n* glib: GVariant deserialisation does not match spec for non-normal data (CVE-2023-32665)\n\nFor more details about the security issue(s), including the impact, a CVSS score, acknowledgments, and other related information, refer to the CVE page(s) listed in the References section.\n\nAdditional Changes:\n\nFor detailed information on changes in this release, see the Red Hat Enterprise Linux 9.3 Release Notes linked from the References section.',
              Name: 'RHSA-2023:6631: glib2 security and bug fix update (Low)',
              Metadata: {
                UpdatedBy: 'RHEL9-rhel-9',
                RepoName: 'cpe:/o:redhat:enterprise_linux:9::baseos',
                RepoLink: null,
                DistroName: 'Red Hat Enterprise Linux Server',
                DistroVersion: '9',
                NVD: {
                  CVSSv3: {
                    Vectors: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H',
                    Score: 7.5,
                  },
                },
              },
            },
          ],
        },
        {
          Name: 'p11-kit-trust',
          VersionFormat: '',
          NamespaceName: '',
          AddedBy:
            'sha256:27844678c499cd28d128544604c99a91d5d692bc905f931297048c44c1764c63',
          Version: '0.24.1-2.el9',
          BaseScores: [],
          CVEIds: [],
          Vulnerabilities: [],
        },
        {
          Name: 'setup',
          VersionFormat: '',
          NamespaceName: '',
          AddedBy:
            'sha256:27844678c499cd28d128544604c99a91d5d692bc905f931297048c44c1764c63',
          Version: '2.13.7-9.el9',
          BaseScores: [],
          CVEIds: [],
          Vulnerabilities: [],
        },
        {
          Name: 'nettle',
          VersionFormat: '',
          NamespaceName: '',
          AddedBy:
            'sha256:27844678c499cd28d128544604c99a91d5d692bc905f931297048c44c1764c63',
          Version: '3.8-3.el9_0',
          BaseScores: [],
          CVEIds: [],
          Vulnerabilities: [],
        },
        {
          Name: 'pcre2',
          VersionFormat: '',
          NamespaceName: '',
          AddedBy:
            'sha256:27844678c499cd28d128544604c99a91d5d692bc905f931297048c44c1764c63',
          Version: '10.40-2.el9',
          BaseScores: [],
          CVEIds: [],
          Vulnerabilities: [],
        },
        {
          Name: 'ubi9/',
          VersionFormat: '',
          NamespaceName: '',
          AddedBy:
            'sha256:1a251b642c47a50df3cba23758292a935dbfaaedd06c46d6ec3c7b183366e4e1',
          Version: '1-51',
          BaseScores: [],
          CVEIds: [],
          Vulnerabilities: [],
        },
        {
          Name: 'fonts-filesystem',
          VersionFormat: '',
          NamespaceName: '',
          AddedBy:
            'sha256:27844678c499cd28d128544604c99a91d5d692bc905f931297048c44c1764c63',
          Version: '1:2.0.5-7.el9.1',
          BaseScores: [],
          CVEIds: [],
          Vulnerabilities: [],
        },
        {
          Name: 'readline',
          VersionFormat: '',
          NamespaceName: '',
          AddedBy:
            'sha256:27844678c499cd28d128544604c99a91d5d692bc905f931297048c44c1764c63',
          Version: '8.1-4.el9',
          BaseScores: [],
          CVEIds: [],
          Vulnerabilities: [],
        },
        {
          Name: 'lua-libs',
          VersionFormat: '',
          NamespaceName: '',
          AddedBy:
            'sha256:27844678c499cd28d128544604c99a91d5d692bc905f931297048c44c1764c63',
          Version: '5.4.4-3.el9',
          BaseScores: [],
          CVEIds: [],
          Vulnerabilities: [],
        },
        {
          Name: 'popt',
          VersionFormat: '',
          NamespaceName: '',
          AddedBy:
            'sha256:27844678c499cd28d128544604c99a91d5d692bc905f931297048c44c1764c63',
          Version: '1.18-8.el9',
          BaseScores: [],
          CVEIds: [],
          Vulnerabilities: [],
        },
        {
          Name: 'gzip',
          VersionFormat: '',
          NamespaceName: '',
          AddedBy:
            'sha256:0e0603c707af046d0e20d0a759ace11ade1810dd01aa01ca093e5641668c1df2',
          Version: '1.12-1.el9',
          BaseScores: [],
          CVEIds: [],
          Vulnerabilities: [],
        },
      ],
    },
  },
};

export const v1securityDetails: SecurityDetailsResponse = {
  ...securityDetails,
  status: 'unsupported',
  data: {
    ...securityDetails.data,
    Layer: {
      ...(securityDetails?.data?.Layer ?? {}),
      Features: [],
    } as Layer,
  },
};

export const v2securityDetails: SecurityDetailsResponse = {
  ...securityDetails,
  status: 'queued',
  data: {
    ...securityDetails.data,
    Layer: {
      ...(securityDetails?.data?.Layer ?? {}),
      Features: securityDetails.data?.Layer?.Features?.slice(0, 5) ?? [],
    } as Layer,
  },
};

export const v3securityDetails: SecurityDetailsResponse = {
  ...securityDetails,
  data: {
    ...securityDetails.data,
    Layer: {
      ...(securityDetails?.data?.Layer ?? {}),
      Features: [],
    } as Layer,
  },
};
export const v4securityDetails: SecurityDetailsResponse = {
  ...securityDetails,
  data: {
    ...securityDetails.data,
    Layer: {
      ...(securityDetails?.data?.Layer ?? {}),
      Features: securityDetails.data?.Layer?.Features?.slice(0, 5) ?? [],
    } as Layer,
  },
};
