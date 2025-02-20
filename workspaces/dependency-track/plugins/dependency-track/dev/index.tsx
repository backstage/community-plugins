/*
 * Copyright 2025 The Backstage Authors
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
import React from 'react';
import { Entity } from '@backstage/catalog-model';
import { createDevApp } from '@backstage/dev-utils';
import { dependencytrackPlugin } from '../src';
import { Content, Header, Page } from '@backstage/core-components';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { TestApiProvider } from '@backstage/test-utils';
import Grid from '@material-ui/core/Grid';
import {
  EntityDependencytrackSummaryCard,
  EntityDependencytrackFindingCard,
  DependencytrackApi,
  dependencytrackApiRef,
  DependencytrackProject,
  ProjectMetrics,
} from '../src';
import {
  ANALYZER_IDENTITY,
  CLASSIFIER,
  Finding,
  SEVERITY,
} from '../src/api/dependencytrack-types';

const entity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'trimm-website',
    description: 'TRIMM Website',
    annotations: {
      'dependencytrack/project-id': '',
    },
  },
  spec: {
    type: 'website',
  },
};

const projectMetrics: ProjectMetrics = {
  critical: 3,
  high: 9,
  medium: 15,
  low: 1,
  unassigned: 5,
  vulnerabilities: 33,
  vulnerableComponents: 19,
  components: 813,
  suppressed: 0,
  findingsTotal: 33,
  findingsAudited: 0,
  findingsUnaudited: 33,
  inheritedRiskScore: 146.0,
  firstOccurrence: 1716873880720,
  lastOccurrence: 1717143880224,
};

const baseFindings: Finding[] = [
  {
    component: {
      uuid: '7d0210e9-4dd1-459b-85e5-cdba7dfd385f',
      name: 'json-io',
      version: '4.14.0',
      purl: 'pkg:maven/com.cedarsoftware/json-io@4.14.0',
      project: 'd7605a97-3038-4580-ac67-68096ca1707e',
    },
    vulnerability: {
      uuid: '1bbb1afa-55fa-4c40-8751-e1d61e177bb8',
      source: 'NVD',
      vulnId: 'CVE-2023-34610',
      cvssV3BaseScore: 7.5,
      severity: SEVERITY.HIGH,
      severityRank: 1,
      epssScore: 0.00052,
      epssPercentile: 0.19933,
      cweId: 787,
      cweName: 'Out-of-bounds Write',
      cwes: [
        {
          cweId: 787,
          name: 'Out-of-bounds Write',
        },
      ],
      aliases: [],
      description:
        'An issue was discovered json-io thru 4.14.0 allows attackers to cause a denial of service or other unspecified impacts via crafted object that uses cyclic dependencies.',
      recommendation: null,
    },
    analysis: {
      isSuppressed: false,
    },
    attribution: {
      analyzerIdentity: ANALYZER_IDENTITY.OSSINDEX_ANALYZER,
      attributedOn: 1715847506437,
      alternateIdentifier: 'CVE-2023-34610',
      referenceUrl:
        'https://ossindex.sonatype.org/vulnerability/CVE-2023-34610?component-type=maven&component-name=com.cedarsoftware%2Fjson-io&utm_source=dependency-track&utm_medium=integration&utm_content=v4.6.3',
    },
    matrix:
      'd7605a97-3038-4580-ac67-68096ca1707e:7d0210e9-4dd1-459b-85e5-cdba7dfd385f:1bbb1afa-55fa-4c40-8751-e1d61e177bb8',
  },
  {
    component: {
      uuid: 'a9fa6098-7fd1-4dfb-a948-25116364d82d',
      name: 'h2',
      version: '2.1.214',
      purl: 'pkg:maven/com.h2database/h2@2.1.214',
      project: 'd7605a97-3038-4580-ac67-68096ca1707e',
    },
    vulnerability: {
      uuid: '66f2919b-01ad-4ad8-a275-0093c55cb3e6',
      source: 'NVD',
      vulnId: 'CVE-2018-14335',
      cvssV2BaseScore: 4.0,
      cvssV3BaseScore: 6.5,
      severity: SEVERITY.MEDIUM,
      severityRank: 2,
      epssScore: 0.0121,
      epssPercentile: 0.85228,
      cweId: 59,
      cweName: "Improper Link Resolution Before File Access ('Link Following')",
      cwes: [
        {
          cweId: 59,
          name: "Improper Link Resolution Before File Access ('Link Following')",
        },
      ],
      aliases: [],
      description:
        'An issue was discovered in H2 1.4.197. Insecure handling of permissions in the backup function allows attackers to read sensitive files (outside of their permissions) via a symlink to a fake database file.',
      recommendation: null,
    },
    analysis: {
      isSuppressed: false,
    },
    attribution: {
      analyzerIdentity: ANALYZER_IDENTITY.OSSINDEX_ANALYZER,
      attributedOn: 1715847509973,
      alternateIdentifier: 'CVE-2018-14335',
      referenceUrl:
        'https://ossindex.sonatype.org/vulnerability/CVE-2018-14335?component-type=maven&component-name=com.h2database%2Fh2&utm_source=dependency-track&utm_medium=integration&utm_content=v4.6.3',
    },
    matrix:
      'd7605a97-3038-4580-ac67-68096ca1707e:a9fa6098-7fd1-4dfb-a948-25116364d82d:66f2919b-01ad-4ad8-a275-0093c55cb3e6',
  },
];

const findings: Finding[] = [];
for (let i = 0; i < 10; i++) {
  findings.push(...baseFindings);
}

const mockedApi: DependencytrackApi = {
  fetchProject(): Promise<DependencytrackProject> {
    const data: DependencytrackProject = {
      author: '',
      publisher: '',
      group: '',
      name: '',
      description: '',
      version: '',
      classifier: CLASSIFIER.APPLICATION,
      cpe: '',
      swidTagId: '',
      directDependencies: '',
      uuid: '',
      lastBomImport: '',
      lastBomImportFormat: '',
      lastInheritedRiskScore: 0,
      active: false,
      metrics: projectMetrics,
      findings: [],
    };
    return Promise.resolve(data);
  },
  fetchFindings(): Promise<Finding[]> {
    return Promise.resolve(findings);
  },
  fetchMetrics(): Promise<ProjectMetrics> {
    return Promise.resolve(projectMetrics);
  },
};

createDevApp()
  .registerPlugin(dependencytrackPlugin)
  .addPage({
    element: (
      <TestApiProvider apis={[[dependencytrackApiRef, mockedApi]]}>
        <EntityProvider entity={entity}>
          <Page themeId="tool">
            <Header title="Dependency-Track" />
            <Content>
              <Grid>
                <Grid item md={6}>
                  <EntityDependencytrackSummaryCard />
                </Grid>
                <Grid item md={12}>
                  <EntityDependencytrackFindingCard />
                </Grid>
              </Grid>
            </Content>
          </Page>
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Dependency-Track',
  })
  .render();
