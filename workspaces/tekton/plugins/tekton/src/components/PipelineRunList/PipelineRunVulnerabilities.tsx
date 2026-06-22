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

import Box from '@mui/material/Box';
import AngleDoubleDownIcon from '@mui/icons-material/KeyboardDoubleArrowDownOutlined';
import AngleDoubleUpIcon from '@mui/icons-material/KeyboardDoubleArrowUpOutlined';
import { Tooltip } from '@patternfly/react-core';
import { t_color_yellow_40 as mediumColor } from '@patternfly/react-tokens/dist/js/t_color_yellow_40';
import { t_color_orange_40 as highColor } from '@patternfly/react-tokens/dist/js/t_color_orange_40';
import classNames from 'classnames';

import { PipelineRunKind } from '@backstage-community/plugin-tekton-react';

import { usePipelineRunScanResults } from '../../hooks/usePipelineRunScanResults';
import CriticalRiskIcon from '../Icons/CriticalRiskIcon';
import EqualsIcon from '../Icons/EqualsIcon';
import { tektonTranslationRef } from '../../translations/index.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

type PipelineRunVulnerabilitiesProps = {
  pipelineRun: PipelineRunKind;
  condensed?: boolean;
};

const PipelineRunVulnerabilities: FC<PipelineRunVulnerabilitiesProps> = ({
  pipelineRun,
  condensed,
}) => {
  const scanResults = usePipelineRunScanResults(pipelineRun);
  const { t } = useTranslationRef(tektonTranslationRef);

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      {scanResults?.vulnerabilities ? (
        <>
          <Box
            className={classNames('severity')}
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexWrap: 'nowrap',
              gap: 0.5,
            }}
          >
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexWrap: 'nowrap',
                gap: 0.5,
              }}
            >
              <Tooltip
                content={t(
                  'pipelineRunList.vulnerabilitySeverityTitle.critical',
                )}
              >
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    height: '1em',
                    width: '1em',
                  }}
                >
                  <CriticalRiskIcon
                    className=""
                    title={t(
                      'pipelineRunList.vulnerabilitySeverityTitle.critical',
                    )}
                  />
                </Box>
              </Tooltip>
              {!condensed
                ? t('pipelineRunList.vulnerabilitySeverityTitle.critical')
                : null}
            </Box>
            <Box
              component="span"
              sx={{ fontWeight: 'bold' }}
              data-testid="pipelinerun-critical-vulnerabilities-count"
            >
              {scanResults.vulnerabilities.critical || 0}
            </Box>
          </Box>
          <Box
            className={classNames('severity')}
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexWrap: 'nowrap',
              gap: 0.5,
            }}
          >
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexWrap: 'nowrap',
                gap: 0.5,
              }}
            >
              <Tooltip
                content={t('pipelineRunList.vulnerabilitySeverityTitle.high')}
              >
                <AngleDoubleUpIcon
                  sx={{
                    color: highColor.value,
                    height: '0.8em',
                    width: '0.8em',
                  }}
                  titleAccess={t(
                    'pipelineRunList.vulnerabilitySeverityTitle.high',
                  )}
                />
              </Tooltip>
              {!condensed
                ? t('pipelineRunList.vulnerabilitySeverityTitle.high')
                : null}
            </Box>
            <Box
              component="span"
              sx={{ fontWeight: 'bold' }}
              data-testid="pipelinerun-high-vulnerabilities-count"
            >
              {scanResults.vulnerabilities.high || 0}
            </Box>
          </Box>
          <Box
            className={classNames('severity')}
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexWrap: 'nowrap',
              gap: 0.5,
            }}
          >
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexWrap: 'nowrap',
                gap: 0.5,
              }}
            >
              <Tooltip
                content={t('pipelineRunList.vulnerabilitySeverityTitle.medium')}
              >
                <Box
                  component="span"
                  sx={{
                    color: mediumColor.value,
                    display: 'inline-flex',
                    height: '1.3em',
                    width: '1.3em',
                  }}
                >
                  <EqualsIcon
                    className=""
                    title={t(
                      'pipelineRunList.vulnerabilitySeverityTitle.medium',
                    )}
                  />
                </Box>
              </Tooltip>
              {!condensed
                ? t('pipelineRunList.vulnerabilitySeverityTitle.medium')
                : null}
            </Box>
            <Box
              component="span"
              sx={{ fontWeight: 'bold' }}
              data-testid="pipelinerun-medium-vulnerabilities-count"
            >
              {scanResults.vulnerabilities.medium || 0}
            </Box>
          </Box>
          <Box
            className={classNames('severity')}
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexWrap: 'nowrap',
              gap: 0.5,
            }}
          >
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexWrap: 'nowrap',
                gap: 0.5,
              }}
            >
              <Tooltip
                content={t('pipelineRunList.vulnerabilitySeverityTitle.low')}
              >
                <AngleDoubleDownIcon
                  sx={{ height: '0.8em', width: '0.8em' }}
                  titleAccess={t(
                    'pipelineRunList.vulnerabilitySeverityTitle.low',
                  )}
                />
              </Tooltip>
              {!condensed
                ? t('pipelineRunList.vulnerabilitySeverityTitle.low')
                : null}
            </Box>
            <Box
              component="span"
              sx={{ fontWeight: 'bold' }}
              data-testid="pipelinerun-low-vulnerabilities-count"
            >
              {scanResults.vulnerabilities.low || 0}
            </Box>
          </Box>
        </>
      ) : (
        '-'
      )}
    </Box>
  );
};

export default PipelineRunVulnerabilities;
