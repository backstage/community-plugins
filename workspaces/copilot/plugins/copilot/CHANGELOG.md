# @backstage-community/plugin-copilot

## 0.11.0

### Minor Changes

- 4b09bc8: Adds support for the new frontend system

## 0.10.0

### Minor Changes

- d3221bf: Backstage version bump to v1.40.2

### Patch Changes

- Updated dependencies [d3221bf]
  - @backstage-community/plugin-copilot-common@0.10.0

## 0.9.2

### Patch Changes

- cd78d85: - Upgraded to Backstage release 1.38
  - Applied migration to the [New JXS Transform](https://backstage.io/docs/tutorials/jsx-transform-migration/)
- Updated dependencies [cd78d85]
  - @backstage-community/plugin-copilot-common@0.9.1

## 0.9.1

### Patch Changes

- 6232241: Ensure that date is converted to the local timezone before performing comparison

## 0.9.0

### Minor Changes

- bc2b3bf: Adds engagement metrics to be viewed. No personal details are currently stored.
  (Like information on who hasnt been using its license).

  This is done by fetching the seat billing information from Github.
  [API ref](https://docs.github.com/en/rest/copilot/copilot-user-management?apiVersion=2022-11-28#list-all-copilot-seat-assignments-for-an-organization)

  It then selects out the following metrics based of the billing information

  - Total assigned seats
  - Seats never used
    (user has undefined last_activity_at property)
  - Seats not used in the last 7/14/28 days
    (diff between "today" and last_activity_at)

  This is presented in a slightly different way since they are absolute numbers.
  The following metrics are presented based on the last day of the selected period range

  - Total assigned seats
  - Seats never used
  - Inactive seats last 7/14/28 days

  The following metrics are calculated as average for the selected period range
  excluding weekends (since usage usually goes down during theese days).

  - Avg Total Active users
  - Avg Total Engaged users
  - Avg IDE Completion users
  - Avg IDE Chat users
  - Avg Github.com Chat users
  - Avg Github.com PR users

  All of the new metrics also have an own bar chart displaying this over the selected period range.
  (Except seats not used in 7/14/28 days, who got a line-chart with multiple lines)

  The backend has also been updated to use Octokit to fetch data instead of own implementation.
  This also fixes the problem with pagination for some endpoints.

### Patch Changes

- 522b3f9: Allows url for copilot to be relative instead of absolute.
- Updated dependencies [bc2b3bf]
  - @backstage-community/plugin-copilot-common@0.9.0

## 0.8.0

### Minor Changes

- ec1324b: Backstage version bump to v1.37.0

### Patch Changes

- Updated dependencies [ec1324b]
  - @backstage-community/plugin-copilot-common@0.8.0

## 0.7.0

### Minor Changes

- 2bae2d2: Backstage version bump to v1.36.1

### Patch Changes

- Updated dependencies [2bae2d2]
  - @backstage-community/plugin-copilot-common@0.7.0

## 0.6.1

### Patch Changes

- 10cacf8: Updated a table header to match what it actually displays in the table
- Updated dependencies [10cacf8]
  - @backstage-community/plugin-copilot-common@0.6.0

## 0.6.0

### Minor Changes

- f5be5aa: Backstage version bump to v1.35.1

### Patch Changes

- Updated dependencies [f5be5aa]
  - @backstage-community/plugin-copilot-common@0.5.0

## 0.5.0

### Minor Changes

- dab14da: Fix incorrectly reporting acceptance rate

## 0.4.3

### Patch Changes

- 46c4837: Fix division by zero in language stats

## 0.4.2

### Patch Changes

- 8007ea2: Removes Portuguese from the README

## 0.4.1

### Patch Changes

- 6bf6fe4: Updated READMEs to clarify installation instructions including locations to run commands from and steps for new backend system

## 0.4.0

### Minor Changes

- 53e7191: Backstage version bump to v1.34.2

### Patch Changes

- Updated dependencies [53e7191]
  - @backstage-community/plugin-copilot-common@0.4.0

## 0.3.0

### Minor Changes

- 7f17c9f: Introduced support for organizations and team metrics visualization in the Copilot plugin.

### Patch Changes

- Updated dependencies [7f17c9f]
  - @backstage-community/plugin-copilot-common@0.3.0

## 0.2.3

### Patch Changes

- 399dc3b: Backstage version bump to v1.32.2
- Updated dependencies [399dc3b]
  - @backstage-community/plugin-copilot-common@0.2.2

## 0.2.2

### Patch Changes

- 3dea8f4: - Acceptance Rate Average card now show acceptance/suggestion rate instead of lines/days

  - Languages breakdown table had the wrong title for column "Total suggestions"

## 0.2.1

### Patch Changes

- 0617e87: Backstage version bump to v1.31.1
- Updated dependencies [0617e87]
  - @backstage-community/plugin-copilot-common@0.2.1

## 0.2.0

### Minor Changes

- c55888b: Remove "private" field from package.json to allow potential publishing

### Patch Changes

- Updated dependencies [c55888b]
  - @backstage-community/plugin-copilot-common@0.2.0

## 0.1.1

### Patch Changes

- ad6f23d: Backstage version bump to v1.30.2
- Updated dependencies [ad6f23d]
  - @backstage-community/plugin-copilot-common@0.1.1

## 0.1.0

### Minor Changes

- 2d5f011: Introduced the GitHub Copilot plugin, checkout the plugin's [`README.md`](https://github.com/backstage/community-plugins/tree/main/workspaces/copilot/plugins/copilot) for more details!

### Patch Changes

- Updated dependencies [2d5f011]
  - @backstage-community/plugin-copilot-common@0.1.0
