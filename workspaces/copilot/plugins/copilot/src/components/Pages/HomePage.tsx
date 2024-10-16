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
import { useNavigate } from 'react-router-dom';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { CopilotPage } from './CopilotPage';

interface InfoCardProps {
  title: string;
  description: string[];
  buttonText: string;
  onClick: () => void;
  warning?: string | null;
}

const InfoCard = ({
  title,
  description,
  buttonText,
  onClick,
  warning,
}: InfoCardProps) => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <CardContent sx={{ flexGrow: 1 }}>
      <Typography gutterBottom variant="h5" component="div">
        {title}
      </Typography>
      {description.map((text, index) => (
        <Typography
          key={index}
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {text}
        </Typography>
      ))}
    </CardContent>
    <Box sx={{ p: 2, pt: 0 }}>
      {warning ? (
        <Alert severity="warning" variant="outlined">
          {warning}
        </Alert>
      ) : (
        <Button variant="contained" color="primary" fullWidth onClick={onClick}>
          {buttonText}
        </Button>
      )}
    </Box>
  </Card>
);

export const HomePage = (): React.JSX.Element => {
  const configApi = useApi(configApiRef);
  const navigate = useNavigate();

  const enterpriseConfig = configApi.getOptionalString('copilot.enterprise');
  const organizationConfig = configApi.getOptionalString(
    'copilot.organization',
  );

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <CopilotPage
      title="Copilot Dashboard"
      subtitle="Exploring the Impact and Integration of AI Assistance in Development Workflows"
      themeId="tool"
    >
      <Container
        maxWidth="lg"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '70vh',
        }}
      >
        <Grid container spacing={4} justifyContent="center" gap={2}>
          <Grid item xs={12} sm={6} md={5}>
            <InfoCard
              title="Enterprise"
              description={[
                'Dive deep into enterprise-level metrics to track performance, user engagement, and more. Get an overview of how AI assistance is being adopted across the entire enterprise.',
                'You can also explore metrics broken down by individual teams to gain more insights.',
              ]}
              buttonText="Go to Enterprise"
              onClick={() => handleNavigate('/copilot/enterprise')}
              warning={
                enterpriseConfig
                  ? null
                  : "Please add the 'copilot.enterprise' variable in the configuration to enable this feature."
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} md={5}>
            <InfoCard
              title="Organization"
              description={[
                'Explore organization-wide statistics and gain insights into user activities and trends. Understand the broader impact of AI assistance within your organization.',
                'Additionally, view metrics by teams to get a granular understanding of adoption patterns.',
              ]}
              buttonText="Go to Organization"
              onClick={() => handleNavigate('/copilot/organization')}
              warning={
                organizationConfig
                  ? null
                  : "Please add the 'copilot.organization' variable in the configuration to enable this feature."
              }
            />
          </Grid>
        </Grid>
      </Container>
    </CopilotPage>
  );
};
