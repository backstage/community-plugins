/*
 * Copyright 2021 The Backstage Authors
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

import { ReactElement, ReactNode } from 'react';
import {
  Accordion,
  AccordionPanel,
  AccordionTrigger,
  Alert,
  Flex,
  Text,
} from '@backstage/ui';
import { CheckResult } from '@backstage-community/plugin-tech-insights-common';
import { ScorecardsList } from '../ScorecardsList';
import { useApi } from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';
import { MarkdownContent } from '@backstage/core-components';
import { techInsightsApiRef } from '@backstage-community/plugin-tech-insights-react';
import styles from './ScorecardInfo.module.css';

const infoCard = (
  title: ReactNode,
  description: string | undefined,
  element: ReactElement,
  expanded: boolean,
  summary?: string,
) => (
  <Accordion defaultExpanded={expanded}>
    <AccordionTrigger className={styles.trigger}>
      <Flex justify="between" align="center" className={styles.triggerContent}>
        <Text as="span" variant="title-small">
          {title}
        </Text>
        {summary && <Text as="span">{summary}</Text>}
      </Flex>
    </AccordionTrigger>
    <AccordionPanel>
      {description && (
        <Text as="div" className={styles.description}>
          <MarkdownContent content={description} />
        </Text>
      )}
      {element}
    </AccordionPanel>
  </Accordion>
);

export const ScorecardInfo = (props: {
  checkResults: CheckResult[];
  title: ReactNode;
  entity?: Entity;
  description?: string;
  noWarning?: boolean;
  expanded?: boolean;
  dense?: boolean;
  hideDescription?: boolean;
}) => {
  const {
    checkResults,
    title,
    entity,
    description,
    noWarning,
    expanded = true,
    dense,
    hideDescription = dense,
  } = props;
  const api = useApi(techInsightsApiRef);

  if (!checkResults.length) {
    if (noWarning) {
      return infoCard(
        title,
        description,
        <Alert
          status="info"
          title="All checks passed, or no checks have been performed yet"
        />,
        expanded,
      );
    }
    return infoCard(
      title,
      description,
      <Alert status="warning" title="No checks have any data yet." />,
      expanded,
    );
  }

  return infoCard(
    title,
    description,
    <ScorecardsList
      checkResults={checkResults}
      entity={entity}
      dense={dense}
      hideDescription={hideDescription}
    />,
    expanded,
    `${
      checkResults.filter(checkResult => !api.isCheckResultFailed(checkResult))
        .length
    }/${checkResults.length}`,
  );
};
