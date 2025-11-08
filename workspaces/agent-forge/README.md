# Agent Forge Workspace

This workspace contains the Agent Forge plugin for [Backstage](https://backstage.io) - a chatbot interface for AI agents that talk A2A protocol with support for OpenID Connect authentication, streaming responses, and session management.

## About Agent Forge

Agent Forge is designed to pair with [CAIPE (Community AI Platform Engineering)](https://cnoe-io.github.io/ai-platform-engineering/), an open-source Multi-Agentic AI System (MAS) that provides specialized sub-agents for platform operations, incident management, and DevOps workflows. However, **Agent Forge can work with any [A2A (Agent-to-Agent) protocol](https://a2a-protocol.org/latest/) compatible agent**, making it a flexible solution for integrating AI agents into your Backstage portal.

### Key Features

- **A2A Protocol Support**: Built on the [A2A Protocol](https://a2a-protocol.org/latest/), an open standard by the Linux Foundation for agent-to-agent communication
- **OpenID Connect Authentication**: Secure token-based authentication with automatic expiration handling
- **Streaming Responses**: Real-time agent response streaming for better UX
- **Session Management**: Persistent chat sessions with context preservation
- **Multi-Agent Compatible**: Works with CAIPE or any A2A-compatible agent system
- **Configurable UI**: Customizable branding, colors, and behavior

## Getting Started

### Installation

Install dependencies for the workspace:

```sh
yarn install
```

### Development

Start the development server:

```sh
yarn start
```

The app will be available at `http://localhost:3000`.

## Testing

All test commands should be run from the **workspace root** directory:

```sh
# Navigate to workspace root
cd /path/to/community-plugins/workspaces/agent-forge
```

### Run All Tests

Run tests for all packages in the workspace:

```sh
# From: workspaces/agent-forge/
yarn test:all
```

### Run Tests for a Specific Package

```sh
# From: workspaces/agent-forge/
cd plugins/agent-forge
yarn test

# Or run from workspace root:
yarn workspace @caipe/plugin-agent-forge test
```

### Run Tests with Coverage

```sh
# From: workspaces/agent-forge/
yarn test:all --coverage
```

### Run Specific Test File

```sh
# From: workspaces/agent-forge/
yarn test --testPathPattern=ChatbotApi.auth.test

# Or for authentication tests specifically:
yarn test --testPathPattern=ChatbotApi.auth.test --maxWorkers=1
```

### Run Tests in Watch Mode

```sh
# From: workspaces/agent-forge/
yarn test --watch
```

### Quick Test Examples

```sh
# Test just the ChatbotApi authentication
cd /path/to/community-plugins/workspaces/agent-forge
yarn test --testPathPattern=ChatbotApi.auth.test

# Test a specific component
yarn test --testPathPattern=AgentForgePage.test

# Run all tests with verbose output
yarn test:all --verbose
```

## Code Quality

All code quality commands should be run from the **workspace root** directory: `workspaces/agent-forge/`

### Linting

Lint all packages:

```sh
# From: workspaces/agent-forge/
yarn lint:all
```

Lint only changed files since main:

```sh
# From: workspaces/agent-forge/
yarn lint
```

#### Manual Linting

To manually lint specific files or directories:

```sh
# Lint a specific file
cd /path/to/community-plugins/workspaces/agent-forge
npx eslint plugins/agent-forge/src/apis/ChatbotApi.ts

# Lint and auto-fix a specific file
npx eslint --fix plugins/agent-forge/src/apis/ChatbotApi.ts

# Lint a specific directory
npx eslint plugins/agent-forge/src/components/

# Lint with auto-fix for all TypeScript files
npx eslint --fix "plugins/agent-forge/src/**/*.{ts,tsx}"

# Check specific file before committing
npx eslint --fix plugins/agent-forge/src/apis/ChatbotApi.ts
npx eslint --fix plugins/agent-forge/src/components/AgentForgePage.tsx
```

**Common ESLint fixes:**

- `--fix` - Automatically fix problems when possible
- `--max-warnings=0` - Treat warnings as errors
- `--quiet` - Report errors only, ignore warnings

**Backstage-specific linting rules to watch:**

- Use `toLocaleLowerCase('en-US')` instead of `toLowerCase()`
- Use Material UI `<Typography>` instead of `<span>` or `<div>`
- Ensure React Hooks dependencies are correct
- Avoid variable shadowing in nested scopes

### Type Checking

Run TypeScript type checking:

```sh
# From: workspaces/agent-forge/
yarn tsc:full
```

### Formatting

Check code formatting:

```sh
# From: workspaces/agent-forge/
yarn prettier:check
```

Fix code formatting:

```sh
# From: workspaces/agent-forge/
yarn prettier:fix
```

### Generate Knip Reports

```sh
# From: workspaces/agent-forge/
yarn backstage-repo-tools knip-reports
```

## Development Workflow

### Creating a New Branch and Pull Request

1. **Create a new branch** from `main`:

```sh
git checkout main
git pull origin main
git checkout -b feat/your-feature-name
```

Branch naming conventions:

- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `test/` - Test additions or fixes
- `refactor/` - Code refactoring
- `chore/` - Maintenance tasks

2. **Make your changes** and test them:

```sh
# Run tests
yarn test:all

# Run linting
yarn lint:all

# Check formatting
yarn prettier:check

# Type check
yarn tsc:full
```

3. **Commit your changes** using [Conventional Commits](https://www.conventionalcommits.org/):

```sh
git add .
git commit -s -m "feat(agent-forge): add new authentication feature

Detailed description of what changed and why.

Signed-off-by: Your Name <your.email@example.com>"
```

**Important:**

- All commits **must** follow Conventional Commits format
- All commits **must** include DCO sign-off (`-s` flag or `Signed-off-by:` line)
- Commit types: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `build`, `ci`, `chore`

4. **Push your branch** to GitHub:

```sh
git push origin feat/your-feature-name
```

5. **Create a Pull Request**:

   - Go to https://github.com/backstage/community-plugins
   - Click "Compare & pull request"
   - Fill in the PR template with:
     - Description of changes
     - Related issue numbers
     - Testing performed
   - Request reviews from maintainers

6. **CI Checks**: The PR will run automated checks:

   - ✅ Type checking (`yarn tsc:full`)
   - ✅ Linting (`yarn lint:all`)
   - ✅ Tests (`yarn test:all`)
   - ✅ Formatting (`yarn prettier:check`)
   - ✅ Build (`yarn build:all`)

7. **Address Review Feedback**:

```sh
# Make changes based on feedback
git add .
git commit -s -m "fix: address review feedback"
git push origin feat/your-feature-name
```

### Example Commit Messages

```sh
# Adding a feature
git commit -s -m "feat(agent-forge): add OpenID token expiration checking"

# Fixing a bug
git commit -s -m "fix(agent-forge): resolve 401 error handling for expired tokens"

# Adding tests
git commit -s -m "test(agent-forge): add unit tests for authentication error handling"

# Documentation
git commit -s -m "docs(agent-forge): update README with testing instructions"

# Breaking change
git commit -s -m "feat(agent-forge)!: change token refresh behavior

BREAKING CHANGE: Token refresh now requires autoReloadOnTokenExpiry config"
```

## Plugin Structure

```
agent-forge/
├── plugins/
│   └── agent-forge/           # Main plugin package
│       ├── src/
│       │   ├── apis/          # API clients (ChatbotApi, etc.)
│       │   ├── components/    # React components
│       │   └── __tests__/     # Test files
│       ├── config.d.ts        # Configuration schema
│       └── package.json
├── app-config.yaml            # Development configuration
└── package.json               # Workspace package.json
```

## Configuration

Agent Forge connects to any A2A-compatible agent backend. When using with [CAIPE](https://cnoe-io.github.io/ai-platform-engineering/), point the `baseUrl` to your CAIPE deployment.

See `app-config.yaml` for available configuration options:

```yaml
agentForge:
  baseUrl: http://localhost:8000 # Your A2A-compatible agent URL
  botName: CAIPE # Or your custom agent name
  useOpenIDToken: true
  autoReloadOnTokenExpiry: true
  enableStreaming: true
  # ... more options
```

### Connecting to Different Agent Systems

**CAIPE (Recommended)**:

```yaml
agentForge:
  baseUrl: https://your-caipe-deployment.example.com
  botName: CAIPE
  infoPage: https://cnoe-io.github.io/ai-platform-engineering/
```

**Custom A2A Agent**:

```yaml
agentForge:
  baseUrl: https://your-custom-agent.example.com
  botName: Your Agent Name
  infoPage: https://your-docs-url.example.com
```

## Resources

### Agent Systems

- [CAIPE (Community AI Platform Engineering)](https://cnoe-io.github.io/ai-platform-engineering/) - Multi-Agentic AI System for Platform Engineering
- [CAIPE GitHub Repository](https://github.com/cnoe-io/ai-platform-engineering) - Open-source MAS implementation
- [A2A Protocol](https://a2a-protocol.org/latest/) - Agent-to-Agent communication standard (open standard by Linux Foundation)

### Development Resources

- [Backstage Documentation](https://backstage.io/docs)
- [Community Plugins Repository](https://github.com/backstage/community-plugins)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Developer Certificate of Origin](https://developercertificate.org/)

## Support

For issues and questions about Agent Forge and CAIPE:

### CAIPE Community

- **Community Page**: [CNOE Agentic AI SIG Community](https://cnoe-io.github.io/ai-platform-engineering/community/)
- **GitHub Issues**: [CAIPE Issues](https://github.com/cnoe-io/ai-platform-engineering/issues)
- **Weekly Meetings**: Every Monday at 12:00 PM CST / 10:00 AM PST
- **Slack Channel**: [#cnoe-sig-agentic-ai](https://cloud-native.slack.com/archives/C081LBWQC9D) on CNCF Slack

### Backstage Support

- **Plugin Issues**: [community-plugins/issues](https://github.com/backstage/community-plugins/issues)
