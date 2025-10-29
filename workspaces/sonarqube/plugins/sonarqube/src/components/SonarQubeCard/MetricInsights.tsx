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
import Chip from '@material-ui/core/Chip';
import { makeStyles } from '@material-ui/core/styles';
import { defaultDuplicationRatings } from '../SonarQubeTable/types';
import BugReport from '@material-ui/icons/BugReport';
import Lock from '@material-ui/icons/Lock';
import Typography from '@material-ui/core/Typography';
import LockOpen from '@material-ui/icons/LockOpen';
import SentimentVeryDissatisfied from '@material-ui/icons/SentimentVeryDissatisfied';
import SentimentVerySatisfied from '@material-ui/icons/SentimentVerySatisfied';
import Security from '@material-ui/icons/Security';
import { DateTime } from 'luxon';
import { Percentage } from './Percentage';
import { Rating } from './Rating';
import { RatingCard } from './RatingCard';
import { Value } from './Value';
import { FindingSummary } from '@backstage-community/plugin-sonarqube-react';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { sonarqubeTranslationRef } from '../../translation';
import Tooltip from '@material-ui/core/Tooltip';
import LinkIcon from '@material-ui/icons/Link';

type MetricInsightsProps = {
  value: FindingSummary | any;
  compact?: boolean;
  title?: string;
  sonarQubeComponentKey?: string;
};

const useStyles = makeStyles(theme => ({
  badgeLabel: {
    color: theme.palette.common.white,
  },
  badgeCompact: {
    margin: 0,
    height: 28,
  },
  badgeError: {
    backgroundColor: theme.palette.error.main,
  },
  badgeSuccess: {
    backgroundColor: theme.palette.success.main,
  },
  badgeUnknown: {
    backgroundColor: theme.palette.grey[500],
  },
}));

export const QualityBadge = (props: MetricInsightsProps) => {
  const classes = useStyles();
  const { t } = useTranslationRef(sonarqubeTranslationRef);

  const { value } = props;
  let gateLabel: string = t('sonarQubeCard.qualityBadgeLabel.notComputed');
  let gateColor = classes.badgeUnknown;
  let gateLinkToolTip = '';
  if (value?.metrics.alert_status) {
    const gatePassed = value?.metrics.alert_status === 'OK';
    gateLabel = gatePassed
      ? t('sonarQubeCard.qualityBadgeLabel.gatePassed')
      : t('sonarQubeCard.qualityBadgeLabel.gateFailed');
    gateColor = gatePassed ? classes.badgeSuccess : classes.badgeError;
  }
  let clickableAttrs = {};
  if (value.projectUrl) {
    gateLinkToolTip = t('sonarQubeCard.qualityBadgeTooltip');
    clickableAttrs = {
      component: 'a',
      href: value.projectUrl,
      clickable: true,
    };
  }
  const qualityBadge = (
    <Tooltip title={gateLinkToolTip}>
      <Chip
        label={gateLabel}
        {...clickableAttrs}
        className={props.compact ? classes.badgeCompact : ''}
        classes={{ root: gateColor, label: classes.badgeLabel }}
        icon={value.projectUrl ? <LinkIcon /> : undefined}
      />
    </Tooltip>
  );
  return qualityBadge;
};

export const BugReportRatingCard = (props: MetricInsightsProps) => {
  const { value, title } = props;
  return (
    <RatingCard
      compact={props.compact}
      titleIcon={<BugReport />}
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
        value.metrics.vulnerabilities === '0' ? <Lock /> : <LockOpen />
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
          <SentimentVerySatisfied />
        ) : (
          <SentimentVeryDissatisfied />
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
        titleIcon={<Security />}
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
    <Typography color="textSecondary" variant="subtitle2">
      {value?.isSonarQubeAnnotationEnabled &&
        t('sonarQubeCard.noSonarQubeError.hasAnnotation', {
          project: sonarQubeComponentKey || '',
        })}
      {!value?.isSonarQubeAnnotationEnabled &&
        t('sonarQubeCard.noSonarQubeError.noAnnotation')}
    </Typography>
  );
};
