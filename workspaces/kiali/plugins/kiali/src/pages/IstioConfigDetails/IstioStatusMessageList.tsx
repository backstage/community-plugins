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
  IstioLevelToSeverity,
  ObjectCheck,
  ValidationMessage,
  ValidationTypes,
} from '@backstage-community/plugin-kiali-common/types';
import { Chip, List, ListItem, Tooltip, Typography } from '@material-ui/core';
import { useMemo } from 'react';
import { Validation } from '../../components/Validations/Validation';
import { KialiIcon } from '../../config/KialiIcon';
import { kialiStyle } from '../../styles/StyleUtils';

interface Props {
  messages?: ValidationMessage[];
  checks?: ObjectCheck[];
}

interface GroupedCheck {
  code?: string;
  count: number;
  message: string;
  severity: string;
}

const infoStyle = kialiStyle({
  marginLeft: '0.5rem',
  verticalAlign: '-0.06em !important',
});

const countBadgeStyle = kialiStyle({
  marginLeft: '0.5rem',
  height: '1.25rem',
});

const groupChecks = (checks: ObjectCheck[]): GroupedCheck[] => {
  const grouped = new Map<string, GroupedCheck>();

  for (const check of checks) {
    const key = `${check.code ?? ''}_${check.severity}`;

    if (grouped.has(key)) {
      grouped.get(key)!.count += 1;
    } else {
      grouped.set(key, {
        code: check.code,
        count: 1,
        message: check.message,
        severity: check.severity,
      });
    }
  }

  return Array.from(grouped.values());
};

export const IstioStatusMessageList = (props: Props) => {
  const groupedChecks = useMemo(
    () => groupChecks(props.checks ?? []),
    [props.checks],
  );

  return (
    <>
      <Typography variant="h6" gutterBottom style={{ marginTop: 10 }}>
        Configuration Analysis
      </Typography>
      <List style={{ padding: 0 }}>
        {(props.messages || []).map((msg: ValidationMessage, i: number) => {
          const severity: ValidationTypes =
            IstioLevelToSeverity[
              (msg.level as keyof typeof IstioLevelToSeverity) || 'UNKNOWN'
            ];
          return (
            <ListItem style={{ padding: 0 }} key={`msg-${i}`}>
              <Validation severity={severity} />
              <a
                href={msg.documentationUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {msg.type.code}
              </a>
              {msg.description ? `: ${msg.description}` : undefined}
            </ListItem>
          );
        })}
      </List>
      <List style={{ padding: 0 }}>
        {groupedChecks.map((group: GroupedCheck, i: number) => {
          const severity: ValidationTypes =
            IstioLevelToSeverity[
              (group.severity.toLocaleUpperCase(
                'en-US',
              ) as keyof typeof IstioLevelToSeverity) || 'UNKNOWN'
            ];
          return (
            <ListItem style={{ padding: 0 }} key={`check-${i}`}>
              <Validation severity={severity} />
              {group.code}
              <Tooltip title={group.message}>
                <span className="iconInfo">
                  <KialiIcon.Info className={infoStyle} />
                </span>
              </Tooltip>
              {group.count > 1 && (
                <Chip
                  className={countBadgeStyle}
                  color="primary"
                  label={group.count}
                  size="small"
                />
              )}
            </ListItem>
          );
        })}
      </List>
    </>
  );
};
