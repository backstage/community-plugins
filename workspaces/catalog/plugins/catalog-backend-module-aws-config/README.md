# AWS Config catalog plugin for Backstage

This is the AWS Config catalog plugin for backstage.io which is designed to ingest AWS resource information in to the Backstage catalog.

Features:

1. Automatically add AWS resources from AWS Config
1. Uses incremental ingestion to efficiently ingest

_Note:_ It is possible to easily configure this entity provider in a way that ingests a large amount of entities in to the Backstage catalog. Please review the [Considerations](#considerations) section below.

_Note:_ If you are not already using AWS Config it is important to note that you will incur costs by enabling it. Please review its pricing information before enabling in your AWS organization.

## Installing

This guide assumes that you are familiar with the general [Getting Started](../../docs/getting-started.md) documentation and have assumes you have an existing Backstage application.

Install the backend package in your Backstage app:

```shell
yarn workspace backend add @backstage/plugin-catalog-backend-module-incremental-ingestion @aws/aws-config-catalog-module-for-backstage
```

Add the scaffolder module to the `packages/backend/src/index.ts`:

```typescript
const backend = createBackend();
// ...
backend.add(
  import('@backstage/plugin-catalog-backend-module-incremental-ingestion'),
);
backend.add(import('@aws/aws-config-catalog-module-for-backstage'));
// ...
backend.start();
```

## Configuration

Add entity providers to the Backstage application configuration like so:

```yaml
providers:
  awsConfig:
    default: # Name of the provider
      accountId: # [OPTIONAL] AWS account ID to use to access AWS Config API
      region: # [OPTIONAL] AWS region to use to access AWS Config API
      aggregator: # [OPTIONAL] The name of the AWS Config aggregator
      hashEntityNames: # [OPTIONAL] Generated entity names will always be hashes of the ARN
      filters: # Filter the resources queried from AWS Config API
        tags: # [OPTIONAL] Match by tags on the AWS resources
          - key: 'component' # Only retrieve resources that have a 'component' tag
          - key: environment # Only retrieve resources that have a 'environment' tag with value 'prod'
            value: prod
        resourceTypes: # [REQUIRED] Filter by AWS resource type
          - AWS::ECS::Cluster
          - AWS::ECS::Service
          - AWS::DynamoDB::Table
          - AWS::RDS::DBCluster
          - AWS::Lambda::Function
          - AWS::ElasticLoadBalancingV2::LoadBalancer
          - AWS::ApiGatewayV2::Api
          - AWS::S3::Bucket
      transform: # [OPTIONAL] Apply transformations to the emitted entity
        fields: # Modify specific fields
          name: # Customize the name field generated (see note below)
            expression: $join([$resource.resourceName, $resource.accountId], '-')
          annotations: # Add to metadata.annotations
            accountId:
              expression: $resource.accountId # Add an annotation with the AWS account ID using JSONata expression
          spec:
            owner:
              tag: owner # Set 'spec.owner' to the value of the 'owner' tag on the AWS resource
            component:
              tag: component # Create a 'dependencyOf' relationshop based on the 'component' tag
            system:
              value: my-system # Set 'spec.system' to a hard-coded value of 'my-system'
      options: # [OPTIONAL] Configure details of the provider behavior
        incremental:
          restLength: { hours: 6 } # Wait 6 hours between each ingestion cycle
```

An entity created by the above configuration would look like this:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Resource
metadata:
  annotations:
    aws.amazon.com/arn: arn:aws:ecs:us-west-2:1234567890:service/my-cluster/my-app
    aws.amazon.com/name: my-app
    aws.amazon.com/region: us-west-2
    aws.amazon.com/resource-id: arn:aws:ecs:us-west-2:1234567890:service/my-cluster/my-app
    aws.amazon.com/resource-type: AWS::ECS::Service
  name: my-app
  description: AWS Config Resource AWS::ECS::Service my-app
spec:
  owner: my-team
  type: ecs-service
  system: my-system
```

> NOTE: The `metadata.name` field must be unique across your Backstage instance, otherwise entities will over-write each other. If your AWS resources naming is already unique then you have no actions to take. If you have AWS resources that potentially have conflicting names then you will need to use the `transform.fields.name` configuration value to transform the `metadata.name` field to something unique for each entity.

## Considerations

Its recommended to use the configuration available to ingest the minimum entities necessary in to the Backstage catalog. AWS Config, especially in larger organizations, can be tracking a large number of AWS resources that can have a negative affect on both the ingestion mechanism as well as the user catalog experience once stored.

General recommendations are:

1. Use the `resourceTypes` field to limit to the desired AWS services. If needed, start with 1 or 2 resource types and gradually add more to assess impact on Backstage catalog size.
2. Limit ingestion to a single "environment" such as staging or production.
3. Configure the ingestion schedule appropriately based on the number of resources that will be ingested.

## JSONata expressions

One of the ways the provider can transform entities is to use [JSONata](https://docs.jsonata.org/overview.html) expressions via the `expressions` fields. This is a flexible way to transform fields on the emitted entity based on any field in the AWS Config resource payload.

The AWS Config resource payload is available through the `$resource` variable.

Heres a simple example that sets an annotation with the resource account ID:

```yaml
transform:
  fields:
    annotations:
      accountId:
        expression: $resource.accountId
```

Here is a more complex example that sets an annotation with the RDS engine version only if the resource is an RDS DB cluster:

```yaml
transform:
  fields:
    annotations:
      engineVersion:
        expression: $resource.resourceType = "AWS::RDS::DBCluster" ? $resource.configuration.engineVersion
```

The expression must return a `string`.

## Use cases

This section contains some examples of specific use-cases beyond simple resource ingestion.

### EKS catalog cluster locator

The Backstage [catalog Kubernetes cluster locator](https://backstage.io/docs/features/kubernetes/configuration#catalog) sources information on Kubernetes clusters from the Backstage catalog to power the Kubernetes plugin. This is a more flexible mechanism than configuring clusters in the Backstage configuration.

This entity provider can be used to generate `Resource` entities that are compatible with this plugin by using field transforms:

```yaml
providers:
  awsConfig:
    eksClusters:
      filters:
        tags: [...]
        resourceTypes:
          - AWS::EKS::Cluster
      transform:
        fields:
          annotations:
            'amazonaws.com/account-id':
              expression: $resource.accountId
            'amazonaws.com/arn':
              expression: $resource.arn
            'kubernetes.io/api-server':
              expression: $resource.configuration.Endpoint
            'kubernetes.io/api-server-certificate-authority':
              expression: $resource.configuration.CertificateAuthorityData
            'kubernetes.io/x-k8s-aws-id':
              expression: $resource.resourceName
            'kubernetes.io/auth-provider':
              value: aws
          spec:
            owner:
              tag: owner
            component:
              tag: component
            type:
              value: kubernetes-cluster
```

Filter the clusters appropriately using tags.
