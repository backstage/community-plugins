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
import { List, ListItem, Tooltip, Typography } from '@material-ui/core';
import { Validation } from '../../components/Validations/Validation';
import { KialiIcon } from '../../config/KialiIcon';
import { kialiStyle } from '../../styles/StyleUtils';

interface Props {
  messages?: ValidationMessage[];
  checks?: ObjectCheck[];
}

const infoStyle = kialiStyle({
  marginLeft: '0.5rem',
  verticalAlign: '-0.06em !important',
});

export const IstioStatusMessageList = (props: Props) => {
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
            <ListItem style={{ padding: 0 }} key={i}>
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
        {(props.checks || []).map((check: ObjectCheck, i: number) => {
          const severity: ValidationTypes =
            IstioLevelToSeverity[
              (check.severity.toLocaleUpperCase(
                'en-US',
              ) as keyof typeof IstioLevelToSeverity) || 'UNKNOWN'
            ];
          return (
            <ListItem style={{ padding: 0 }} key={i}>
              <Validation severity={severity} />
              {check.code}
              <Tooltip title={check.message}>
                <span className="iconInfo">
                  <KialiIcon.Info className={infoStyle} />
                </span>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
    </>
  );
};
