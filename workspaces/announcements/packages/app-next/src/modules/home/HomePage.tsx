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
// HomePage for app-next replicating legacy Home announcements showcase
import {
  AnnouncementsCard,
  AnnouncementsTimeline,
  NewAnnouncementBanner,
} from '@backstage-community/plugin-announcements';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import MuiLink from '@mui/material/Link';
import { Content, Header, SupportButton } from '@backstage/core-components';
import { Link as RouterLink } from 'react-router-dom';

export const HomePage = () => {
  return (
    <>
      <Header title="Announcements Plugin Showcase" subtitle="Dev App">
        <SupportButton title="About the Announcements plugin">
          This page demonstrates the primary UI surfaces of the announcements
          plugin and provides quick navigation to administration areas. Use it
          as a reference when embedding Announcements into your Backstage
          instance.
        </SupportButton>
      </Header>
      <Content>
        <Grid container spacing={3} direction="column">
          {/* Intro / Quick Links */}
          <Grid item>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Quick Links
                </Typography>
                <Grid container spacing={2}>
                  <Grid item>
                    <MuiLink component={RouterLink} to="/announcements">
                      All Announcements
                    </MuiLink>
                  </Grid>
                  <Grid item>
                    <MuiLink component={RouterLink} to="/announcements/create">
                      Create Announcement
                    </MuiLink>
                  </Grid>
                  <Grid item>
                    <MuiLink component={RouterLink} to="/announcements/admin">
                      Admin Portal
                    </MuiLink>
                  </Grid>
                  <Grid item>
                    <MuiLink
                      component={RouterLink}
                      to="/announcements/categories"
                    >
                      Categories
                    </MuiLink>
                  </Grid>
                  <Grid item>
                    <MuiLink component={RouterLink} to="/announcements/tags">
                      Tags
                    </MuiLink>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Live Components Showcase */}
          <Grid item>
            <Typography variant="h5" gutterBottom>
              Live Components
            </Typography>
          </Grid>
          <Grid item>
            <Card>
              <CardContent>
                <Typography variant="h6">New Announcement Banner</Typography>
                <Typography variant="body2" paragraph>
                  Surfaces the most recent announcements (real-time if using the
                  optional Backstage Signals integration)
                </Typography>
                <NewAnnouncementBanner max={2} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item>
            <Card>
              <CardContent>
                <Typography variant="h6">Announcements Card</Typography>
                <Typography variant="body2" paragraph>
                  A compact overview suitable for dashboards or entity pages.
                  You can tweak size and filtering in the future roadmap.
                </Typography>
                <AnnouncementsCard max={2} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item>
            <Card>
              <CardContent>
                <Typography variant="h6">Announcements Timeline</Typography>
                <Typography variant="body2" paragraph>
                  Chronological view for browsing historical context or updates.
                  Embed on a dedicated announcements page or a knowledge base
                  section.
                </Typography>
                <AnnouncementsTimeline />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Content>
    </>
  );
};
