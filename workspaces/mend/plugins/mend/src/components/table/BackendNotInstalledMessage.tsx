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
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { MendIcon } from '../Sidebar';

export const BackendNotInstalledMessage = () => {
  const theme = useTheme();

  const handleDocumentationClick = () => {
    window.open(
      'https://github.com/backstage/community-plugins/tree/main/workspaces/mend/plugins/mend-backend',
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'auto',
        flexDirection: 'column',
        gap: '16px',
        padding: '100px 0',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgb(0, 163, 163)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50px',
          width: '40px',
          height: '40px',
        }}
      >
        <MendIcon />
      </div>

      <Typography
        variant="h6"
        sx={{ fontWeight: 600, color: theme.palette.text.primary }}
      >
        Mend Backend Plugin Required
      </Typography>

      <Typography
        variant="body1"
        color="textSecondary"
        sx={{ textAlign: 'center', maxWidth: '500px' }}
      >
        The Mend backend is not installed and configured. Install and configure
        the backend to access security insights from your Mend platform.
      </Typography>

      <Box sx={{ marginTop: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleDocumentationClick}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          View Installation Guide
        </Button>
      </Box>
    </div>
  );
};
