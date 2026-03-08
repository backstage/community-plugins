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
import { Component, type ErrorInfo, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Page, Content } from '@backstage/core-components';
import { debugError } from '../../utils';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Top-level error boundary for the Agentic Chat page.
 * Catches uncaught React render errors (including from hooks)
 * and shows a recovery UI instead of a blank screen.
 */
export class AgenticChatErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    debugError('Unhandled error:', error, info.componentStack);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Page themeId="tool">
          <Content>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                minHeight: 0,
                maxWidth: 600,
                mx: 'auto',
                p: 4,
                textAlign: 'center',
              }}
            >
              <Typography variant="h4" gutterBottom>
                Something went wrong
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                The Agentic Chat plugin encountered an unexpected error. You can
                try reloading the component or refreshing the page.
              </Typography>

              {this.state.error && (
                <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
                  <AlertTitle>Error Details</AlertTitle>
                  {this.state.error.message}
                </Alert>
              )}

              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={this.handleReload}
              >
                Reload Plugin
              </Button>
            </Box>
          </Content>
        </Page>
      );
    }
    return this.props.children;
  }
}
