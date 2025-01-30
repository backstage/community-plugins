# @backstage-community/plugin-announcements

## 0.1.6

### Patch Changes

- 9cea4f3: Removed divider from AnnouncementSearchResultListItem

## 0.1.5

### Patch Changes

- 1909e4d: Added announcement ID to the useAsync dependency array in the AnnouncementPage component.

  This fixes an issue where the AnnouncementPage component did not re-fetch the announcement details when the ID in the routing path changed. As a result the user who was on the AnnouncementPage couldn't see the details of the next announcement they accessed, e.g. from the search dialogue.

- ef67a29: Fixed bug in AnnouncementPage component where subheader spacing was missing

## 0.1.4

### Patch Changes

- e282a2d: Minor improvements to README documentation
- Updated dependencies [e282a2d]
  - @backstage-community/plugin-announcements-common@0.1.3
  - @backstage-community/plugin-announcements-react@0.1.3

## 0.1.3

### Patch Changes

- d08164d: Exported missing items to match documentation

## 0.1.2

### Patch Changes

- 126b459: Minor bump to fix release process - this should kick off the first release of the announcements plugins under the @backstage-community scope.
- Updated dependencies [126b459]
  - @backstage-community/plugin-announcements-common@0.1.2
  - @backstage-community/plugin-announcements-react@0.1.2

## 0.1.1

### Patch Changes

- 48094fc: Bump all dependencies to be in line with Backstage v1.34.2. This is the first versioned release of the announcement plugins under the `@backstage-community` scope.
- Updated dependencies [48094fc]
  - @backstage-community/plugin-announcements-common@0.1.1
  - @backstage-community/plugin-announcements-react@0.1.1
