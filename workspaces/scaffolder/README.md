# Scaffolder backend modules

This workspace contains the following independently published scaffolder action modules:

- [Annotator](./plugins/scaffolder-backend-module-annotator/README.md)
- [Kubernetes](./plugins/scaffolder-backend-module-kubernetes/README.md)
- [Regex](./plugins/scaffolder-backend-module-regex/README.md)
- [ServiceNow](./plugins/scaffolder-backend-module-servicenow/README.md)
- [SonarQube](./plugins/scaffolder-backend-module-sonarqube/README.md)

Run Yarn commands from `workspaces/scaffolder/`. Each plugin has its own `dev/` harness and contributor guide. The catalog scaffolder relation processor remains in its own workspace because it extends the catalog rather than providing scaffolder actions.
