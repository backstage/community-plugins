---
'@backstage-community/plugin-mcp-chat-backend': patch
---

Bump @modelcontextprotocol/sdk to v1.24.0 [security]

The mcp-chat plugin is not affected since it does not start a MCP server. It uses the SDK to communicate to other servers.

The Model Context Protocol (MCP) TypeScript SDK also does not enable DNS rebinding protection by default.

References: [PR 6318](https://github.com/backstage/community-plugins/pull/6318) /
[CVE-2025-66414](https://nvd.nist.gov/vuln/detail/CVE-2025-66414) /
[GHSA-w48q-cv73-mx4w](https://redirect.github.com/advisories/GHSA-w48q-cv73-mx4w)
