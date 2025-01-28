---
'@backstage-community/plugin-announcements': patch
---

Added announcement ID to the useAsync dependency array in the AnnouncementPage component.

This fixes an issue where the AnnouncementPage component did not re-fetch the announcement details when the ID in the routing path changed. As a result the user who was on the AnnouncementPage couldn't see the details of the next announcement they accessed, e.g. from the search dialogue.
