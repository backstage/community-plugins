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
import Skeleton from '@mui/material/Skeleton';

/**
 * Loading skeleton shown while conversation history is being fetched.
 */
export function ConversationSkeleton() {
  return (
    <>
      {[0, 1, 2, 3].map(i => (
        <Box key={i} sx={{ px: 1.5, py: 1 }}>
          <Skeleton variant="text" width="85%" sx={{ fontSize: '0.85rem' }} />
          <Skeleton variant="text" width="50%" sx={{ fontSize: '0.7rem' }} />
        </Box>
      ))}
    </>
  );
}
