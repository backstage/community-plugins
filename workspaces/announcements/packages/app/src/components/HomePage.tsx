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
import {
  AnnouncementsCard,
  AnnouncementsTimeline,
  HomepageAnnouncements,
  NewAnnouncementBanner,
} from '@backstage-community/plugin-announcements';
import { Grid, Typography } from '@material-ui/core';
import { Content } from '@backstage/core-components';
import { CustomHomepageGrid, HomePageRandomJoke } from '@backstage/plugin-home';

const defaultCustomizableHomepage = [
  {
    component: <HomepageAnnouncements />,
    x: 0,
    y: 0,
    width: 7,
    height: 4,
    movable: true,
    resizable: true,
    deletable: true,
  },
  {
    component: <HomePageRandomJoke />,
    x: 7,
    y: 0,
    width: 3,
    height: 4,
    movable: true,
    resizable: true,
    deletable: true,
  },
];
export const Home = () => {
  return (
    <Content>
      <Grid container spacing={3} direction="column">
        <Grid item xs={12}>
          <Typography variant="h4">New announcement banner</Typography>
          <Typography variant="body1">
            New announcements appear in real time if usings along side the
            signals plugin.
          </Typography>
          <NewAnnouncementBanner max={2} />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h4">Homepage component</Typography>
          <AnnouncementsCard max={2} />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h4">Customizable Homepage component</Typography>
          <CustomHomepageGrid config={defaultCustomizableHomepage}>
            <HomepageAnnouncements />
            <HomePageRandomJoke />
          </CustomHomepageGrid>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h4">Announcements Timeline</Typography>
          <AnnouncementsTimeline />
        </Grid>
      </Grid>
    </Content>
  );
};
