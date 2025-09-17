# Configuration

This document describes the configuration for the ServiceNow backend plugin.

## ServiceNow Authentication

To use the ServiceNow backend plugin, you need to configure it in your `app-config.yaml` file.

The plugin supports both Basic Authentication and OAuth with grant types "password" and "client_credentials".

### Basic Authentication

You can use basic authentication with your ServiceNow admin username and password.

```yaml
servicenow:
  instanceUrl: https://<your-dev-instance>.service-now.com
  basicAuth:
    username: admin
    password: <your-password>
```

### OAuth 2.0 Authentication

The plugin supports two OAuth grant types: `password` and `client_credentials`.

#### Grant Type "password"

This grant type requires your admin username, password, client ID, and client secret.

1.  **Create an OAuth configuration in ServiceNow:**

    - In the ServiceNow UI, navigate to **All** -> **Application registry**.
    - Click **New** and select **Create an OAuth API endpoint for external clients**.
    - Fill in the form:
      - **Name:** `oauth` (or any desired name)
      - **Client Secret:** `mysecret` (or any desired value)
      - **Client Type:** Integration as a User (in the dropdown)
    - Copy the **Client ID** and submit the form.

2.  **Update your `app-config.yaml`:**

    ```yaml
    servicenow:
      instanceUrl: https://<your-dev-instance>.service-now.com
      oauth:
        grantType: password
        clientId: <your-client-id>
        clientSecret: <your-client-secret>
        username: admin
        password: <your-admin-password>
    ```

#### Grant Type "client_credentials"

This grant type allows authentication using only a client ID and client secret, without an admin password in the configuration. Read more https://www.servicenow.com/community/developer-blog/up-your-oauth2-0-game-inbound-client-credentials-with-washington/ba-p/2816891

2.  **Enable the necessary system properties:**

    Create new property `glide.oauth.inbound.client.credential.grant_type.enabled`. Navigate to `https://<your-instance-url>/sys_properties_list.do`,
    and search `glide.oauth.inbound.client.credential.grant_type.enabled`. If it is not present, click "New" button.
    In the "System Property" form provide:

    - Name: glide.oauth.inbound.client.credential.grant_type.enabled
    - Type: "true|false"
    - Value: "true"

    Click "Save".

1.  **Create an OAuth configuration in ServiceNow:**

    - In the ServiceNow UI, navigate to **All** -> **Application registry**.
    - Click **New** and select **Create an OAuth API endpoint for external clients**.
    - Fill in the form:

      - **Name:** `oauth` (or any desired name)
      - **Client Secret:** `mysecret` (or any desired value)
      - **Client Type:** Integration as a Service (in the dropdown)
      - Assign an admin user to the OAuth configuration. But by default UI hide this option, so you need to use "Form builder" to put this option onto UI.

      Notice: if you don't want to use "Form builder" you can use corresponding Glide script:

      ```js
      var clientId = 'your-created-oauth-configuration-client-id';
      var userName = 'admin'; // your admin username

      // Find OAuth client by client_id
      var clientGR = new GlideRecord('<your-client-id>');
      clientGR.addQuery('client_id', clientId);
      clientGR.query();

      if (clientGR.next()) {
        var userGR = new GlideRecord('sys_user');
        userGR.addQuery('user_name', userName);
        userGR.query();

        if (userGR.next()) {
          clientGR.setValue('user', userGR.sys_id);
          clientGR.update();
          gs.info('✅ Integration user was set up: ' + userGR.user_name);
        } else {
          gs.error('❌ User with user_name was not found: ' + userName);
        }
      } else {
        gs.error('❌ OAuth client with client_id was not found: ' + clientId);
      }
      ```

1.  **Update your `app-config.yaml`:**

    ```yaml
    servicenow:
      instanceUrl: https://<your-dev-instance>.service-now.com
      oauth:
        grantType: client_credentials
        clientId: <your-client-id>
        clientSecret: <your-client-secret>
    ```
