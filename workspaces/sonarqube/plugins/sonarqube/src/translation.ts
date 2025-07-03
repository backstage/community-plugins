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
import { createTranslationRef } from '@backstage/frontend-plugin-api';

/**
 * @public
 */
export const sonarqubeTranslationRef = createTranslationRef({
  id: 'sonarqube',
  messages: {
    title: 'SonarQube Dashboard',
    sonarQubeCard: {
      title: 'Code Quality',
      deepLinkTitle: 'View more',
      emptyState: {
        title: 'No information to display',
        description:
          "There is no SonarQube project with key '{{ projectTitle }}', check that project exists and permissions.",
      },
      noSonarQubeError: {
        hasAnnotation: "There is no SonarQube project with key '{{project}}'",
        noAnnotation: 'No SonarQube annotation found',
      },
      bugReportRatingCardTitle: 'Bugs',
      vulnerabilitiesRatingCardTitle: 'Vulnerabilities',
      codeSmellsRatingCardTitle: 'Code Smells',
      hotspotsReviewedTitle: 'Hotspots Reviewed',
      coverageRatingCardTitle: 'Coverage',
      duplicationsRatingCard: 'Duplications',
      qualityBadgeLabel: {
        notComputed: 'Not computed',
        gatePassed: 'Gate passed',
        gateFailed: 'Gate failed',
      },
      qualityBadgeTooltip: 'View SonarQube Dashboard',
    },
    sonarQubeTable: {
      columnsTitle: {
        name: 'Name',
        qualityGate: 'Quality Gate',
        lastAnalysis: 'Last Analysis',
        bugs: 'Bugs',
        vulnerabilities: 'Vulnerabilities',
        codeSmells: 'Code Smells',
        hotspotsReviewed: 'Hotspots Reviewed',
        coverage: 'Coverage',
        duplications: 'Duplications',
      },
    },
  },
});
