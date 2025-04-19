# SonarQube Scaffolder Module V2

This module provides a simple and standalone SonarQube integration for Backstage scaffolder, allowing you to create SonarQube projects and generate tokens.

## Features

- Create SonarQube projects
- Generate project-specific tokens

## Installation

1. Install the module:

```bash
npm install scaffolder-backend-module-sonarqube-v2
```

2. Use it in your Backstage scaffolder backend or templates:

```typescript
import { createSonarQubeProjectAction } from 'scaffolder-backend-module-sonarqube-v2';

// Add the action to your scaffolder
const actions = [
  // ...other actions
  createSonarQubeProjectAction(),
];
```

## Usage in Templates

Here's an example scaffolder template that creates a SonarQube project:

```yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: sonarqube-project-template
  title: Create SonarQube Project
spec:
  parameters:
    - title: SonarQube Configuration
      required:
        - sonarqubeUrl
        - sonarqubeToken
        - projectKey
        - projectName
      properties:
        sonarqubeUrl:
          title: SonarQube URL
          type: string
          description: URL of your SonarQube instance
        sonarqubeToken:
          title: SonarQube Token
          type: string
          description: SonarQube authentication token
        projectKey:
          title: Project Key
          type: string
          description: Unique key for the SonarQube project
        projectName:
          title: Project Name
          type: string
          description: Display name for the SonarQube project
  steps:
    - id: create-sonarqube-project
      name: Create SonarQube Project
      action: sonarqube:create:project
      input:
        sonarqubeUrl: ${{ parameters.sonarqubeUrl }}
        sonarqubeToken: ${{ parameters.sonarqubeToken }}
        projectKey: ${{ parameters.projectKey }}
        projectName: ${{ parameters.projectName }}
```

## Using Directly in Node.js

If you want to use the SonarQube client directly:

```javascript
const {
  createSonarQubeClient,
} = require('scaffolder-backend-module-sonarqube-v2');

const sonarClient = createSonarQubeClient({
  baseUrl: 'http://your-sonarqube-server',
  token: 'your-sonarqube-token',
});

// Create a project
const project = await sonarClient.createProject({
  name: 'My Project',
  project: 'my-project',
  visibility: 'public',
});

// Generate a token
const token = await sonarClient.generateToken({
  name: 'my-token',
  type: 'PROJECT_ANALYSIS_TOKEN',
  projectKey: 'my-project',
});
```

## Examples

Check out the `example` directory for more usage examples:

1. A sample Node.js script in `example/app.js`
2. A sample Backstage template in `example/templates/sonarqube-project.yaml`

## Testing

You can run the tests with:

```bash
npm test
```

## Development

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Run tests:

```bash
npm test
```

4. Build the package:

```bash
npm run build
```

## License

This project is licensed under the Apache-2.0 License.
