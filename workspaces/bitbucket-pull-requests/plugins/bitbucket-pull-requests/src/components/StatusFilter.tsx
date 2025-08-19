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

import { FC, useState } from 'react';
import { ButtonGroup, Button } from '@material-ui/core';

interface StatusFilterProps {
  onFilterChange: (filter: string) => void;
}
const StatusFilter: FC<StatusFilterProps> = ({ onFilterChange }) => {
  const [status, setStatus] = useState('ALL');

  const handleStatusChange = (newStatus: any) => {
    setStatus(newStatus);
    onFilterChange(newStatus);
  };

  return (
    <ButtonGroup color="primary" aria-label="text primary button group">
      <Button
        onClick={() => handleStatusChange('OPEN')}
        variant={status === 'Open' ? 'contained' : 'outlined'}
      >
        Open
      </Button>
      <Button
        onClick={() => handleStatusChange('MERGED')}
        variant={status === 'Merged' ? 'contained' : 'outlined'}
      >
        Merged
      </Button>
      <Button
        onClick={() => handleStatusChange('DECLINED')}
        variant={status === 'Declined' ? 'contained' : 'outlined'}
      >
        Declined
      </Button>
      <Button
        onClick={() => handleStatusChange('ALL')}
        variant={status === 'All' ? 'contained' : 'outlined'}
      >
        All
      </Button>
    </ButtonGroup>
  );
};

export default StatusFilter;
