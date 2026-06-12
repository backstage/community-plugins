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
import { useMemo } from 'react';
import { Tag, Text, Tooltip } from '@backstage/ui';
import { TooltipTrigger } from 'react-aria-components';
import {
  RiBugLine,
  RiLockLine,
  RiLockUnlockLine,
  RiCheckLine,
  RiAlertLine,
  RiShieldLine,
  RiExternalLinkLine,
} from '@remixicon/react';
import { defaultDuplicationRatings } from '../SonarQubeTable/types';
import { DateTime } from 'luxon';
import { Percentage } from './Percentage';
import { Rating } from './Rating';
import { RatingCard } from './RatingCard';
import { Value } from './Value';
import { FindingSummary } from '@backstage-community/plugin-sonarqube-react';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { sonarqubeTranslationRef } from '../../translation';
import styles from './MetricInsights.module.css';

type MetricInsightsProps = {
  value: FindingSummary | any;
  compact?: boolean;
  title?: string;
  sonarQubeComponentKey?: string;
};

export const QualityBadge = (props: MetricInsightsProps) => {
  const { t } = useTranslationRef(sonarqubeTranslationRef);

  const { value } = props;
  let gateLabel: string = t('sonarQubeCard.qualityBadgeLabel.notComputed');
  let badgeClass = styles.badgeUnknown;
  const gateLinkToolTip = '';
  if (value?.metrics.alert_status) {
    const gatePassed = value?.metrics.alert_status === 'OK';
    gateLabel = gatePassed
      ? t('sonarQubeCard.qualityBadgeLabel.gatePassed')
      : t('sonarQubeCard.qualityBadgeLabel.gateFailed');
    badgeClass = gatePassed ? styles.badgeSuccess : styles.badgeError;
  }

  const qualityBadge = (
    <Tag
      className={`${badgeClass} ${props.compact ? styles.badgeCompact : ''}`}
    >
      {value.projectUrl ? <RiExternalLinkLine size={16} /> : null}
      {gateLabel}
    </Tag>
  );

  if (!gateLinkToolTip && !value.projectUrl) {
    return qualityBadge;
  }

  return (
    <TooltipTrigger>
      {value.projectUrl ? (
        <a href={value.projectUrl} target="_blank" rel="noopener noreferrer">
          {qualityBadge}
        </a>
      ) : (
        qualityBadge
      )}
      {gateLinkToolTip && <Tooltip>{gateLinkToolTip}</Tooltip>}
    </TooltipTrigger>
  );
};

export const BugReportRatingCard = (props: MetricInsightsProps) => {
  const { value, title } = props;
  return (
    <RatingCard
      compact={props.compact}
      titleIcon={<RiBugLine size={20} />}
      title={title}
      link={value.getIssuesUrl('BUG')}
      leftSlot={<Value value={value.metrics.bugs} compact={props.compact} />}
      rightSlot={<Rating rating={value.metrics.reliability_rating} />}
    />
  );
};

export const VulnerabilitiesRatingCard = (props: MetricInsightsProps) => {
  const { value, title } = props;
  return (
    <RatingCard
      compact={props.compact}
      titleIcon={
        value.metrics.vulnerabilities === '0' ? (
          <RiLockLine size={20} />
        ) : (
          <RiLockUnlockLine size={20} />
        )
      }
      title={title}
      link={value.getIssuesUrl('VULNERABILITY')}
      leftSlot={
        <Value value={value.metrics.vulnerabilities} compact={props.compact} />
      }
      rightSlot={<Rating rating={value.metrics.security_rating} />}
    />
  );
};

export const CodeSmellsRatingCard = (props: MetricInsightsProps) => {
  const { value, title } = props;
  return (
    <RatingCard
      compact={props.compact}
      titleIcon={
        value.metrics.code_smells === '0' ? (
          <RiCheckLine size={20} />
        ) : (
          <RiAlertLine size={20} />
        )
      }
      title={title}
      link={value.getIssuesUrl('CODE_SMELL')}
      leftSlot={
        <Value value={value.metrics.code_smells} compact={props.compact} />
      }
      rightSlot={<Rating rating={value.metrics.sqale_rating} />}
    />
  );
};

export const HotspotsReviewed = (props: MetricInsightsProps) => {
  const { value, title } = props;
  return (
    value.metrics.security_review_rating && (
      <RatingCard
        compact={props.compact}
        titleIcon={<RiShieldLine size={20} />}
        title={title}
        link={value.getSecurityHotspotsUrl()}
        leftSlot={
          <Value
            value={
              value.metrics.security_hotspots_reviewed
                ? `${value.metrics.security_hotspots_reviewed}%`
                : '—'
            }
            compact={props.compact}
          />
        }
        rightSlot={<Rating rating={value.metrics.security_review_rating} />}
      />
    )
  );
};

export const CoverageRatingCard = (props: MetricInsightsProps) => {
  const { value, title } = props;
  return (
    <RatingCard
      compact={props.compact}
      link={value.getComponentMeasuresUrl('COVERAGE')}
      title={title}
      leftSlot={<Percentage value={value.metrics.coverage} />}
      rightSlot={
        <Value
          value={value.metrics.coverage ? `${value.metrics.coverage}%` : '—'}
          compact={props.compact}
        />
      }
    />
  );
};

export const DuplicationsRatingCard = (props: MetricInsightsProps) => {
  const { value, title } = props;
  const duplicationRating = useMemo(() => {
    if (!value || !value.metrics.duplicated_lines_density) {
      return '';
    }

    let rating = '';

    for (const r of defaultDuplicationRatings) {
      if (+value.metrics.duplicated_lines_density >= r.greaterThan) {
        rating = r.rating;
      }
    }

    return rating;
  }, [value]);

  return (
    <RatingCard
      compact={props.compact}
      title={title}
      link={value.getComponentMeasuresUrl('DUPLICATED_LINES_DENSITY')}
      leftSlot={<Rating rating={duplicationRating} hideValue />}
      rightSlot={
        <Value
          value={`${value.metrics.duplicated_lines_density}%`}
          compact={props.compact}
        />
      }
    />
  );
};

export const LastAnalyzedRatingCard = (props: MetricInsightsProps) => {
  const { value } = props;
  return (
    <div
      title={DateTime.fromISO(value.lastAnalysis).toLocaleString(
        DateTime.DATETIME_MED,
      )}
    >
      {DateTime.fromISO(value.lastAnalysis).toRelative()}
    </div>
  );
};

export const NoSonarQubeCard = (props: MetricInsightsProps) => {
  const { value, sonarQubeComponentKey } = props;
  const { t } = useTranslationRef(sonarqubeTranslationRef);
  return (
    <Text color="secondary" variant="body-small">
      {value?.isSonarQubeAnnotationEnabled &&
        t('sonarQubeCard.noSonarQubeError.hasAnnotation', {
          project: sonarQubeComponentKey || '',
        })}
      {!value?.isSonarQubeAnnotationEnabled &&
        t('sonarQubeCard.noSonarQubeError.noAnnotation')}
    </Text>
  );
};
