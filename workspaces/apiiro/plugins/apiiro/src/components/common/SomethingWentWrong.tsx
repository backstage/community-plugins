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
import BulleyeIcon from '../../assets/BulleyeIcon';

export const SomethingWentWrong = ({
  message = 'Oops! Something went wrong',
  subtitle = 'You can refresh or try again later',
  statusCode,
}: {
  message?: string;
  subtitle?: string;
  statusCode?: number;
}) => {
  // Set messages based on status code
  const displayMessage =
    statusCode === 401
      ? 'Your Apiiro token is invalid or has expired'
      : message;

  const displaySubtitle =
    statusCode === 401 ? 'Please contact your Administrator' : subtitle;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center',
        mb: 3,
      }}
    >
      <BulleyeIcon />
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        {displayMessage}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {displaySubtitle}
      </Typography>
    </Box>
  );
};
