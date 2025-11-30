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
import Box from '@mui/material/Box';
import { formatDate } from '../utils/utils';
import SimpleTooltip from './SimpleTooltip';

export const DueDateDisplay = ({ dateString }: { dateString: string }) => {
  const rawDate = dateString;

  if (!rawDate) {
    return (
      <SimpleTooltip title="Not Set" centered>
        Not Set
      </SimpleTooltip>
    );
  }

  const dueDate = new Date(rawDate);
  const isValidDate = !Number.isNaN(dueDate.getTime());

  if (!isValidDate) {
    return (
      <SimpleTooltip title="Not Set" centered>
        Not Set
      </SimpleTooltip>
    );
  }

  const formattedDate = formatDate(rawDate);
  const isOverdue = dueDate < new Date();
  const tooltip = isOverdue ? 'SLA due date exceeded' : 'SLA due date';

  return (
    <>
      <SimpleTooltip title={tooltip} centered>
        <Box
          component="span"
          sx={{
            color: isOverdue ? '#bf0d2b' : 'inherit',
          }}
        >
          {formattedDate}
        </Box>
      </SimpleTooltip>
    </>
  );
};
