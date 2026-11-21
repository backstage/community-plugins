/*
 * Copyright 2026 The Backstage Authors
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
  RemixiconComponentType,
  RiCheckLine,
  RiCloseLine,
  RiFilter3Line,
  RiSubtractLine,
} from '@remixicon/react';
import { memo, useMemo } from 'react';

import { Focusable, Text, Tooltip, TooltipTrigger } from '@backstage/ui';

import { useTranslation } from '../../hooks/useTranslation';
import {
  MatrixCell,
  MatrixDecision,
} from '../../utils/permissions-matrix-utils';
import styles from './PermissionsMatrix.module.css';

const DECISION_ICONS: Record<MatrixDecision, RemixiconComponentType> = {
  allow: RiCheckLine,
  deny: RiCloseLine,
  conditional: RiFilter3Line,
  none: RiSubtractLine,
};

const DECISIONS: MatrixDecision[] = ['allow', 'deny', 'conditional', 'none'];

export type DecisionLabels = Record<MatrixDecision, string>;

export const useDecisionLabels = (): DecisionLabels => {
  const { t } = useTranslation();
  return useMemo(
    () => ({
      allow: t('permissionsMatrix.decisions.allow'),
      deny: t('permissionsMatrix.decisions.deny'),
      conditional: t('permissionsMatrix.decisions.conditional'),
      none: t('permissionsMatrix.decisions.none'),
    }),
    [t],
  );
};

/**
 * Decision icon. With a `label` it is announced as an image, so cells never
 * rely on color alone; without one it is decorative.
 */
const DecisionIcon = ({
  decision,
  label,
}: {
  decision: MatrixDecision;
  label?: string;
}) => {
  const Icon = DECISION_ICONS[decision];
  const a11yProps = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': true };
  return (
    <Icon
      size={16}
      className={`${styles.decision} ${styles[decision]}`}
      {...a11yProps}
    />
  );
};

/** Labels are passed in so large matrices do not resolve translations per cell. */
export const MatrixDecisionCell = memo(
  ({
    cell,
    labels,
    conditionalRulesLabel,
  }: {
    cell: MatrixCell;
    labels: DecisionLabels;
    conditionalRulesLabel: string;
  }) => {
    if (cell.decision !== 'conditional') {
      return (
        <DecisionIcon decision={cell.decision} label={labels[cell.decision]} />
      );
    }
    return (
      <TooltipTrigger delay={300}>
        <Focusable>
          <Text as="span" className={styles.tooltipTarget}>
            <DecisionIcon decision="conditional" label={labels.conditional} />
          </Text>
        </Focusable>
        <Tooltip>{`${conditionalRulesLabel}: ${cell.rules.join(', ')}`}</Tooltip>
      </TooltipTrigger>
    );
  },
);

export const MatrixLegend = ({ labels }: { labels: DecisionLabels }) => {
  const { t } = useTranslation();

  return (
    <ul className={styles.legend} aria-label={t('permissionsMatrix.legend')}>
      {DECISIONS.map(decision => (
        <li key={decision} className={styles.legendItem}>
          <DecisionIcon decision={decision} />
          <Text as="span" variant="body-small">
            {labels[decision]}
          </Text>
        </li>
      ))}
    </ul>
  );
};
