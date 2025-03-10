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
import React from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { EmptyState } from './EmptyState';

type EmptyStateNoMatchFoundProps = {
  actionFn: () => void;
};

export const EmptyStateNoMatchFound: React.FunctionComponent<
  EmptyStateNoMatchFoundProps
> = ({ actionFn }) => (
  <EmptyState
    icon={SearchIcon}
    title="No results found"
    helperText="No results match the filter criteria. Remove all filters or clean all filters to show results."
    action={{ text: 'Clear all filters', fn: actionFn }}
  />
);
