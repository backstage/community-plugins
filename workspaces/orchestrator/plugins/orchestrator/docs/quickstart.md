## Quickstart Guide

This quickstart guide will help you install the Orchestrator using the helm chart and execute a sample workflow through the Red Hat Developer Hub orchestrator plugin UI.

1. **Install Orchestrator**:
   Follow the [installation instructions for Orchestrator](https://www.parodos.dev/orchestrator-helm-chart/).

2. **Install a sample workflow**:
   Follow the [installation instructions for the greetings workflow](https://github.com/parodos-dev/serverless-workflows-config/blob/gh-pages/docs/greeting/README.md).

3. **Access Red Hat Developer Hub**:
   Open your web browser and navigate to the Red Hat Developer Hub application. Retrieve the URL using the following OpenShift CLI command.

   ```bash
   oc get route backstage-backstage -n rhdh-operator -o jsonpath='{.spec.host}'
   ```

   Make sure the route is accessible to you locally.

4. **Login to backstage**
   Login to backstage with the Guest account.

5. **Navigate to Orchestrator**:
   Navigate to the Orchestrator page by clicking on the Orchestrator icon in the left navigation menu.
   ![orchestratorIcon](https://raw.githubusercontent.com/janus-idp/backstage-plugins/main/plugins/orchestrator/docs/orchestratorIcon.png)

6. **Execute Greeting Workflow**:
   Click on the 'Execute' button in the ACTIONS column of the Greeting workflow.
   ![workflowsPage](https://raw.githubusercontent.com/janus-idp/backstage-plugins/main/plugins/orchestrator/docs/workflowsPage.png)
   The 'Run workflow' page will open. Click 'Next step' and then 'Run'
   ![executePageNext](https://raw.githubusercontent.com/janus-idp/backstage-plugins/main/plugins/orchestrator/docs/executePageNext.png)
   ![executePageRun](https://raw.githubusercontent.com/janus-idp/backstage-plugins/main/plugins/orchestrator/docs/executePageRun.png)
7. **Monitor Workflow Status**:
   Wait for the status of the Greeting workflow execution to become _Completed_. This may take a moment.
   ![workflowCompleted](https://raw.githubusercontent.com/janus-idp/backstage-plugins/main/plugins/orchestrator/docs/workflowCompleted.png)
