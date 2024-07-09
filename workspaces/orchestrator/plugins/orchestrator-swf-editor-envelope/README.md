# @backstage-community/plugin-orchestrator-swf-editor-envelope

## Description

This package includes assets that are meant to be served as a single page application.  
This package has no entrypoint, therefore it is not suitable to be consumed as a library.
The Orchestrator plugin uses these assets when it renders the Serverless Workflow editor by injecting an `iframe` that loads this application.

## Development

1. Build the project using `yarn build`. The `postbuild` script updates the `orchestrator-backend`'s static directory with your changes.
1. Serve the files in the `dist` directroy

- Either use `@backstage-community/plugin-orchestrator-backend` internal `static` directory (files under `plugins/orchestrator-backend/static/*` are served statically).
- Or, serve the files directly with:
  ```sh
  yarn dlx serve \
      --port 8080 \
      --cors \
      --debug \
      node_modules/@backstage-community/plugin-orchestrator-swf-editor-envelope/dist
  ```

3. Add this configuration to the `app-config.yaml`:
   ```yaml
   backend:
     csp:
       frame-ancestors: ['http://localhost:3000', 'http://localhost:7007']
       script-src: ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
       script-src-elem: ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
       connect-src: ["'self'", 'http:', 'https:', 'data:']
   ```
