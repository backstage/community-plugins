# @backstage-community/plugin-copilot-common

## 0.14.0

### Minor Changes

- 4d1cf33: Backstage version bump to v1.44.0

## 0.13.0

### Minor Changes

- 8c60a7f: Backstage version bump to v1.43.2

## 0.12.0

### Minor Changes

- 5deb1e7: Backstage version bump to v1.42.3

## 0.11.0

### Minor Changes

- 3f606e1: Backstage version bump to v1.41.1

## 0.10.0

### Minor Changes

- d3221bf: Backstage version bump to v1.40.2

## 0.9.1

### Patch Changes

- cd78d85: - Upgraded to Backstage release 1.38
  - Applied migration to the [New JXS Transform](https://backstage.io/docs/tutorials/jsx-transform-migration/)

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

## 0.8.0

### Minor Changes

- ec1324b: Backstage version bump to v1.37.0

## 0.7.0

### Minor Changes

- 2bae2d2: Backstage version bump to v1.36.1

## 0.6.0

### Minor Changes

- 10cacf8: Backend updated for using the new /metrics API that Github Provides.
  Added new tables to the database to store all metrics provided by Github.

  New metrics output from the backend are currently made compatible with the
  old format expected by the frontend in order to make minimum amount of changes
  in this version.

  The Backend router merges the old saved metrics with the new if the selected
  date range overlaps both old and new metrics. Otherwise it selects from eiter
  old or new.

  It also fetches the maximum availible date range taking into account that
  old metrics and/or new metrics are availible from the database.

## 0.5.0

### Minor Changes

- f5be5aa: Backstage version bump to v1.35.1

## 0.4.0

### Minor Changes

- 53e7191: Backstage version bump to v1.34.2

## 0.3.0

### Minor Changes

- 7f17c9f: Introduced support for organizations and team metrics visualization in the Copilot plugin.

## 0.2.2

### Patch Changes

- 399dc3b: Backstage version bump to v1.32.2

## 0.2.1

### Patch Changes

- 0617e87: Backstage version bump to v1.31.1

## 0.2.0

### Minor Changes

- c55888b: Remove "private" field from package.json to allow potential publishing

## 0.1.1

### Patch Changes

- ad6f23d: Backstage version bump to v1.30.2

## 0.1.0

### Minor Changes

- 2d5f011: Introduced the GitHub Copilot plugin, checkout the plugin's [`README.md`](https://github.com/backstage/community-plugins/tree/main/workspaces/copilot/plugins/copilot) for more details!
