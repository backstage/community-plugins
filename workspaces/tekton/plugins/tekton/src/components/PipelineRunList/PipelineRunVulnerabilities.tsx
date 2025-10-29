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
import type { FC } from 'react';

import { makeStyles, Theme } from '@material-ui/core';
import AngleDoubleDownIcon from '@mui/icons-material/KeyboardDoubleArrowDownOutlined';
import AngleDoubleUpIcon from '@mui/icons-material/KeyboardDoubleArrowUpOutlined';
import { Tooltip } from '@patternfly/react-core';
import { t_color_yellow_40 as mediumColor } from '@patternfly/react-tokens/dist/js/t_color_yellow_40';
import { t_color_orange_40 as highColor } from '@patternfly/react-tokens/dist/js/t_color_orange_40';
import classNames from 'classnames';

import { PipelineRunKind } from '@janus-idp/shared-react';

import { usePipelineRunScanResults } from '../../hooks/usePipelineRunScanResults';
import CriticalRiskIcon from '../Icons/CriticalRiskIcon';
import EqualsIcon from '../Icons/EqualsIcon';
import { tektonTranslationRef } from '../../translations/index.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

const useVStyles = makeStyles((theme: Theme) => ({
  pipelineVulnerabilities: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
  },
  severityContainer: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'nowrap',
    gap: theme.spacing(0.5),
  },
  severityStatus: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'nowrap',
    gap: theme.spacing(0.5),
  },
  severityCount: {
    fontWeight: 'bold',
  },
  criticalStatus: {
    height: '1em',
    width: '1em',
  },
  highStatus: {
    color: highColor.value,
    height: '0.8em',
    width: '0.8em',
  },
  mediumStatus: {
    color: mediumColor.value,
    height: '1.3em',
    width: '1.3em',
  },
  lowStatus: {
    height: '0.8em',
    width: '0.8em',
  },
}));

type PipelineRunVulnerabilitiesProps = {
  pipelineRun: PipelineRunKind;
  condensed?: boolean;
};

const PipelineRunVulnerabilities: FC<PipelineRunVulnerabilitiesProps> = ({
  pipelineRun,
  condensed,
}) => {
  const classes = useVStyles();
  const scanResults = usePipelineRunScanResults(pipelineRun);
  const { t } = useTranslationRef(tektonTranslationRef);

  return (
    <div className={classes.pipelineVulnerabilities}>
      {scanResults?.vulnerabilities ? (
        <>
          <div className={classNames(classes.severityContainer, 'severity')}>
            <span className={classes.severityStatus}>
              <Tooltip
                content={t(
                  'pipelineRunList.vulnerabilitySeverityTitle.critical',
                )}
              >
                <CriticalRiskIcon
                  className={classes.criticalStatus}
                  title={t(
                    'pipelineRunList.vulnerabilitySeverityTitle.critical',
                  )}
                />
              </Tooltip>
              {!condensed
                ? t('pipelineRunList.vulnerabilitySeverityTitle.critical')
                : null}
            </span>
            <span className={classes.severityCount}>
              {scanResults.vulnerabilities.critical || 0}
            </span>
          </div>
          <div className={classNames(classes.severityContainer, 'severity')}>
            <span className={classes.severityStatus}>
              <Tooltip
                content={t('pipelineRunList.vulnerabilitySeverityTitle.high')}
              >
                <AngleDoubleUpIcon
                  className={classes.highStatus}
                  titleAccess={t(
                    'pipelineRunList.vulnerabilitySeverityTitle.high',
                  )}
                />
              </Tooltip>
              {!condensed
                ? t('pipelineRunList.vulnerabilitySeverityTitle.high')
                : null}
            </span>
            <span className={classes.severityCount}>
              {scanResults.vulnerabilities.high || 0}
            </span>
          </div>
          <div className={classNames(classes.severityContainer, 'severity')}>
            <span className={classes.severityStatus}>
              <Tooltip
                content={t('pipelineRunList.vulnerabilitySeverityTitle.medium')}
              >
                <EqualsIcon
                  className={classes.mediumStatus}
                  title={t('pipelineRunList.vulnerabilitySeverityTitle.medium')}
                />
              </Tooltip>
              {!condensed
                ? t('pipelineRunList.vulnerabilitySeverityTitle.medium')
                : null}
            </span>
            <span className={classes.severityCount}>
              {scanResults.vulnerabilities.medium || 0}
            </span>
          </div>
          <div className={classNames(classes.severityContainer, 'severity')}>
            <span className={classes.severityStatus}>
              <Tooltip
                content={t('pipelineRunList.vulnerabilitySeverityTitle.low')}
              >
                <AngleDoubleDownIcon
                  className={classes.lowStatus}
                  titleAccess={t(
                    'pipelineRunList.vulnerabilitySeverityTitle.low',
                  )}
                />
              </Tooltip>
              {!condensed
                ? t('pipelineRunList.vulnerabilitySeverityTitle.low')
                : null}
            </span>
            <span className={classes.severityCount}>
              {scanResults.vulnerabilities.low || 0}
            </span>
          </div>
        </>
      ) : (
        '-'
      )}
    </div>
  );
};

export default PipelineRunVulnerabilities;
