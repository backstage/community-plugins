# Display latest announcements on a page

Adding the `AnnouncementsCard` component to a page will display a Card with the latest announcements.
Announcements yet unseen by the user will be prefixed by a specific icon.

```ts
import { AnnouncementsCard } from '@backstage-community/plugin-announcements';

export const HomePage = () => {
  return (
    <Page themeId="home">
      <Header title="AnnouncementsCard" />

      <Content>
        <Grid container>
          <Grid item md={6}>
            <AnnouncementsCard max={3} />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
```
