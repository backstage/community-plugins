---
'@backstage-community/plugin-shorturl-backend': minor
---

shorturl-backend is a plugin that creates, retrieves and redirects short urls

it exposes a REST API to create short URLs, retrieve long URLs and get all existing short URLs

- /create: PUT request to create a short URL
- /go/:short_id: GET request to retrieve a long URL
- /getAll: GET request to read all existing short URLs
