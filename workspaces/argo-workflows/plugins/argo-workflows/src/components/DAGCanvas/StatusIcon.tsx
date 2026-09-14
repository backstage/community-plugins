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
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiErrorWarningLine,
  RiLoader4Line,
  RiTimeLine,
} from '@remixicon/react';
import type { WorkflowStatus } from '@backstage-community/plugin-argo-workflows-common';
import { statusColor } from '../utils';

const ICON_BY_STATUS = {
  Succeeded: RiCheckboxCircleLine,
  Failed: RiCloseCircleLine,
  Running: RiLoader4Line,
  Error: RiErrorWarningLine,
  Pending: RiTimeLine,
} as const satisfies Record<WorkflowStatus, unknown>;

export interface StatusIconProps {
  status: WorkflowStatus;
  size: number;
}

/**
 * A bare status glyph sized for embedding inside a DAG node.
 *
 * Deliberately separate from `WorkflowStatusIcon` in the react package, which
 * also renders a text label and carries its own layout styles. Here only the
 * glyph is wanted, at an explicit pixel size, inside an SVG `foreignObject`.
 */
export function StatusIcon({ status, size }: StatusIconProps) {
  const Icon = ICON_BY_STATUS[status] ?? RiTimeLine;

  return (
    <Icon
      size={size}
      color={statusColor(status)}
      // `foreignObject` gives the icon an inline formatting context, which would
      // otherwise add descender space below the glyph and offset it vertically.
      style={{ display: 'block' }}
    />
  );
}
