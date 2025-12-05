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
import Typography from '@mui/material/Typography';
import { numberToShortText } from '../../utils';

type TableBarProps = {
  active?: number;
  title: string;
  total?: number | boolean;
};

export const TableBar = ({ active, title, total }: TableBarProps) => {
  return (
    <div
      style={{
        width: 'max-content',
        padding: '12px 20px',
      }}
    >
      <Typography variant="h5">
        {title} ({numberToShortText(active)}
        {!!total && (
          <Typography component="span" variant="body1">
            {` / ${numberToShortText(total as number)}`}
          </Typography>
        )}
        )
      </Typography>
    </div>
  );
};
