# @backstage-community/plugin-pointing-poker-common

## 0.1.0

### Minor Changes

- 708bfc5: Added a new Pointing Poker plugin for collaborative story point estimation. See the [README](https://github.com/backstage/community-plugins/tree/main/workspaces/pointing-poker/plugins/pointing-poker#readme) for all the details.

  Jira access requires an explicit `pointingPoker.providers.jira.allowedProjects` list. Only include projects whose data can be shared with all signed-in Backstage users.

  Ticket details keep compact actions visible in narrow panels and support images and tables in descriptions. The story queue closes after selection and shows the selected story position.
