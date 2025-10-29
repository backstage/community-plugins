# REST API

The ServiceNow backend plugin provides a REST API to interact with ServiceNow.

## Endpoints

### GET /health

Returns the health status of the plugin.

- **Request:** `GET /health`
- **Response:**
  - `200 OK` with a JSON body: `{"status": "ok"}`

### GET /incidents

Fetches a list of incidents from ServiceNow. This endpoint requires user authentication. The user's email from their Backstage profile is used to query incidents.

- **Request:** `GET /incidents`
- **Query Parameters:**
  - `entityId` (string, **required**): The entity ID to fetch incidents for.
  - `limit` (number, optional): The maximum number of incidents to return.
  - `offset` (number, optional): The number of incidents to skip.
  - `order` (`asc` | `desc`, optional): The order to sort the incidents.
  - `orderBy` (string, optional): The field to order the incidents by. Allowed values are: `number`, `state`, `short_description`, `assignment_group`, `sys_updated_on`, `sys_created_on`, `priority`, `caller_id`.
  - `priority` (string, optional): A comma-separated list of priority values to filter by, prefixed with `IN`. Example: `IN1,2,3`. Allowed values are `1`, `2`, `3`, `4`, `5`.
  - `state` (string, optional): A comma-separated list of state values to filter by, prefixed with `IN`. Example: `IN1,2`. Allowed values are `1`, `2`, `3`, `6`, `7`, `8`.
  - `search` (string, optional): A search term to filter incidents by.
- **Response:**
  - `200 OK`: A JSON array of incidents.
  - `400 Bad Request`: If there's an issue with the query parameters.
  - `401 Unauthorized`: If the request is not authenticated.
  - `404 Not Found`: If the user's entity or email cannot be found in the catalog.
  - `500 Internal Server Error`: For any other failures during the process.
