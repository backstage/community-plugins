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
import Typography from '@mui/material/Typography';
import { ChipsList } from '../ChipsList';

interface TagItem {
  name: string;
  value: string;
  tagSource?: string;
}

interface TagsListProps {
  tags: TagItem[];
  maxVisible?: number;
}

const formatLabel = (tag: TagItem) => `${tag.name} : ${tag.value}`;

export const TagsList = ({ tags, maxVisible = 1 }: TagsListProps) => {
  if (!tags || tags.length === 0) {
    return '';
  }

  const items = tags.map((tag, index) => ({
    id: `${tag.name}-${tag.value}-${index}`,
    label: formatLabel(tag),
    tooltip: formatLabel(tag),
  }));

  return (
    <ChipsList
      items={items}
      maxVisible={maxVisible}
      gap={0}
      size="small"
      variant="outlined"
      chipSx={{
        maxWidth: '200px',
        '& .MuiChip-label': {
          maxWidth: '180px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
      }}
      renderOverflowContent={hiddenItems => (
        <Box display="flex" flexDirection="column" gap={0.5}>
          {hiddenItems.map(item => (
            <Typography key={item.id} variant="body2">
              {item.label}
            </Typography>
          ))}
        </Box>
      )}
    />
  );
};
