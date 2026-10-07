/*
 * Copyright 2022 The Backstage Authors
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

import { RiCloseLine, RiCheckLine } from '@remixicon/react';
import { Attendee, ResponseStatusMap } from '../api';
import { Box } from '@backstage/ui';

const ResponseIcon = ({ responseStatus }: { responseStatus: string }) => {
  if (responseStatus === ResponseStatusMap.accepted) {
    return (
      <RiCheckLine
        size={16}
        data-testid="accepted-icon"
        style={{ color: 'var(--bui-fg-success, #10b981)' }}
      />
    );
  }
  if (responseStatus === ResponseStatusMap.declined) {
    return (
      <RiCloseLine
        size={16}
        data-testid="declined-icon"
        style={{ color: 'var(--bui-fg-danger, #ef4444)' }}
      />
    );
  }

  return null;
};

type AttendeeChipProps = {
  user: Attendee;
};

export const AttendeeChip = ({ user }: AttendeeChipProps) => {
  const responseStatus = user.status?.response || '';

  return (
    <Box style={{ position: 'relative', display: 'inline-block' }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '4px var(--bui-space-2)',
          border: '1px solid var(--bui-border-primary)',
          borderRadius: '16px',
          backgroundColor: 'transparent',
          color: 'var(--bui-fg-primary)',
          fontSize: '12px',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '200px',
        }}
      >
        {user.emailAddress?.address}
      </div>
      {responseStatus && (
        <Box
          style={{
            position: 'absolute',
            right: '10px',
            top: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '16px',
            height: '16px',
            backgroundColor: 'var(--bui-bg-surface-1)',
          }}
        >
          <ResponseIcon responseStatus={responseStatus} />
        </Box>
      )}
    </Box>
  );
};
