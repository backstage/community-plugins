# Pointing Poker Backend

The backend plugin for [Pointing Poker](../pointing-poker/README.md). It stores sessions, participants, votes and team settings in the Backstage database, exposes the voting API used by the frontend, and provides an extension point for issue-tracker integrations.

All routes require a signed-in Backstage user. The identity of the caller is taken from the verified Backstage credentials, not from the request body.

## Installation

```bash
yarn --cwd packages/backend add @backstage-community/plugin-pointing-poker-backend
```

Add it to your backend in `packages/backend/src/index.ts`:

```ts
backend.add(import('@backstage-community/plugin-pointing-poker-backend'));
```

The database tables are created automatically through migrations on startup.

## Access rules

- Team settings, session creation, joining and the lobby/history lists are limited to members of the team, based on the user's `memberOf` groups in the software catalog.
- Session actions follow the roles in the session: the host drives the session (reveal, accept, skip, split, ...), the creator can delete or reopen it, and only joined voters and hosts can vote.
- Writing an estimate back to an issue requires being the host of a session that contains that issue, and commenting requires being a participant of one.
- Searching and reading issues is available to every signed-in user, using the credentials configured for the ticket provider.

## Configuration

All configuration is optional.

```yaml
pointingPoker:
  # Hours after which a session that was never started is ended automatically.
  staleSessionHours: 8
  # Spacing between story sort positions, leaving room for split subtasks.
  storySortGap: 1000
```

## Ticket providers

The plugin does not talk to an issue tracker by itself. Install a backend module that registers a ticket provider through `pointingPokerTicketProviderExtensionPoint`, for example [`@backstage-community/plugin-pointing-poker-backend-module-jira`](../pointing-poker-backend-module-jira/README.md).
