# @backstage-community/plugin-mcp-chat-backend-module-amazon-bedrock

This plugin is a submodule for the `@backstage-community/plugin-mcp-chat-backend` module, which provides the chat interface with Amazon Bedrock.

## Configuration

Two configuration sections requires the following configuraiton sections:

1. [AWS integration](#aws-integration) section to manage AWS credentials
2. [Amazon Bedrock integration](#amazon-bedrock-integration) to manage the model configuration

### AWS Integration

The module depends on the [@backstage/integration-aws-node](https://backstage.io/api/next/modules/_backstage_integration-aws-node.html) package to fetch AWS account credentials for the AWS SDK client included in this submodule. IAM user credentail, IAM roles, AWS CLI profile name and [IRSA](#iam-role-for-service-account) is supported.

```yaml
aws:
  mainAccount:
    accessKeyId: ${MY_ACCESS_KEY_ID}
    secretAccessKey: ${MY_SECRET_ACCESS_KEY}
  accounts:
    - accountId: '111111111111'
      roleName: 'my-iam-role-name'
      externalId: 'my-external-id'
    - accountId: '222222222222'
      partition: 'aws-other'
      roleName: 'my-iam-role-name'
      region: 'not-us-east-1'
      accessKeyId: ${MY_ACCESS_KEY_ID_FOR_ANOTHER_PARTITION}
      secretAccessKey: ${MY_SECRET_ACCESS_KEY_FOR_ANOTHER_PARTITION}
    - accountId: '333333333333'
      accessKeyId: ${MY_OTHER_ACCESS_KEY_ID}
      secretAccessKey: ${MY_OTHER_SECRET_ACCESS_KEY}
    - accountId: '444444444444'
      profile: my-profile-name
    - accountId: '555555555555'
  accountDefaults:
    roleName: 'my-backstage-role'
    externalId: 'my-id'
```

#### IAM Role for Service Account

When Backstage is deployed in a Amazon EKS cluster, [IRSA](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) is typically enabled to support the injection of AWS credential at pod startup. In this specific case the app-config should only contain the account id where bedrock will be accessed

```yaml
aws:
  accounts:
    - accountId: '123456789012'
```

### Amazon Bedrock integration

The ID of the model have to be `amazon-bedrock` and expects a model ID or an inference profile ID.
If not interrested by Amazon Bedrock in `us-east-1`, you should **always configure the region** as the model ID can varies depending on target AWS region.

```yaml
mcpChat:
  providers:
    - id: amazon-bedrock
      model: ca.amazon.nova-lite-v1:0
      auth:
        region: ca-central-1
```
