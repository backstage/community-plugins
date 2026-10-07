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

import { useApi } from '@backstage/core-plugin-api';
import { Text, Tooltip, TooltipTrigger } from '@backstage/ui';
import { Focusable } from 'react-aria-components';
import { CheckResult } from '@backstage-community/plugin-tech-insights-common';
import { MarkdownContent } from '@backstage/core-components';
import { Entity } from '@backstage/catalog-model';
import {
  ResultCheckIcon,
  techInsightsApiRef,
} from '@backstage-community/plugin-tech-insights-react';
import styles from './ScorecardsList.module.css';

export const ScorecardsList = (props: {
  checkResults: CheckResult[];
  entity?: Entity;
  dense?: boolean;
  hideDescription?: boolean;
}) => {
  const { checkResults, entity, dense, hideDescription } = props;

  const api = useApi(techInsightsApiRef);

  const types = [...new Set(checkResults.map(({ check }) => check.type))];
  const checkResultRenderers = api.getCheckResultRenderers(types);

  return (
    <ul className={styles.list} data-dense={dense || undefined}>
      {checkResults.map(result => {
        const checkResultRenderer = checkResultRenderers.find(
          renderer => renderer.type === result.check.type,
        );
        const renderer = checkResultRenderer?.description;
        const description = renderer ? (
          renderer(result)
        ) : (
          <MarkdownContent content={result.check.description} />
        );

        const name = <Text as="span">{result.check.name}</Text>;

        return (
          <li key={result.check.id} className={styles.item}>
            <div className={styles.text}>
              {hideDescription ? (
                <TooltipTrigger>
                  <Focusable>
                    {/* Focusable so keyboard users can reach the tooltip */}
                    {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
                    <span className={styles.tooltipTarget} tabIndex={0}>
                      {name}
                    </span>
                  </Focusable>
                  <Tooltip>{description}</Tooltip>
                </TooltipTrigger>
              ) : (
                <>
                  {name}
                  <Text as="div" variant="body-small" color="secondary">
                    {description}
                  </Text>
                </>
              )}
            </div>
            <ResultCheckIcon
              result={result}
              entity={entity}
              checkResultRenderer={checkResultRenderer}
            />
          </li>
        );
      })}
    </ul>
  );
};
