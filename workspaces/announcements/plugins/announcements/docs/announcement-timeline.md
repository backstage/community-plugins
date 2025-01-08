# Display announcements in a timeline

Adding the `AnnouncementsTimeline` component to a page will display a raw timeline of the latest announcements.

```ts
import { AnnouncementsTimeline } from '@backstage-community/plugin-announcements';

export const TimelineExampleCard = () => {
  return (
    <Content>
      <Grid container>
        <Grid item md={6}>
          <InfoCard>
            <AnnouncementsTimeline />
          </InfoCard>
        </Grid>
      </Grid>
    </Content>
  );
};
```
