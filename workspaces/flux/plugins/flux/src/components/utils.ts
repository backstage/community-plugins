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
import { makeStyles } from '@material-ui/core';
import { Condition, FluxObject } from '../objects';

/**
 * Find the timestamp of the first "Ready" condition.
 * @public
 */
export function automationLastUpdated(a: FluxObject): string {
  return (
    (a.conditions?.find(condition => condition.type === 'Ready') || {})
      .timestamp || ''
  );
}

export const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
  textOverflow: {
    // overflow hidden and white-space nowrap are needed for text-overflow to work
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    direction: 'rtl',
    maxWidth: '300px',
    height: '16px',
    marginTop: '2px',
  },
  nameLabel: {
    fontWeight: 600,
    marginBottom: '6px',
  },
  actionButton: {
    padding: 0,
    margin: '-5px 0',
  },
  verifiedIconSize: {
    height: '0.8em',
  },
  verifiedIconSizeForImg: {
    height: '1.2em',
  },
  verifiedOK: {
    fill: theme.palette.status.ok || '#27AE60',
  },
  verifiedError: {
    fill: theme.palette.status.error || '#BC3B1D',
  },
  verifiedWarning: {
    fill: theme.palette.status.warning || '#FEF071',
  },
}));

export interface VerifiableSource {
  isVerifiable: boolean;
  conditions: Condition[];
}

/**
 * Returns the SourceVerified condition if any.
 * @public
 */
export const findVerificationCondition = (
  a: VerifiableSource,
): Condition | undefined =>
  a.conditions.find(condition => condition.type === 'SourceVerified');
