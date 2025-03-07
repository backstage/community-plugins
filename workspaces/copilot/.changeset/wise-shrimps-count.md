---
'@backstage-community/plugin-copilot-backend': minor
'@backstage-community/plugin-copilot-common': minor
'@backstage-community/plugin-copilot': minor
---

Adds engagement metrics to be viewed. No personal details are currently stored.
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
