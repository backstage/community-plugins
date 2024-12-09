# Cluster

## Properties

| Name                     | Type                                                                              | Description                                 | Notes                        |
| ------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------- |
| **name**                 | **String**                                                                        | The name of the cluster                     | [optional] [default to null] |
| **consoleUrl**           | **String**                                                                        | URL for the cluster console                 | [optional] [default to null] |
| **kubernetesVersion**    | **String**                                                                        | Version of Kubernetes                       | [optional] [default to null] |
| **oauthUrl**             | **String**                                                                        | OAuth URL for the cluster                   | [optional] [default to null] |
| **openshiftId**          | **String**                                                                        | ID of the OpenShift cluster                 | [optional] [default to null] |
| **openshiftVersion**     | **String**                                                                        | Version of OpenShift running in the cluster | [optional] [default to null] |
| **platform**             | **String**                                                                        | Platform of the cluster                     | [optional] [default to null] |
| **region**               | **String**                                                                        | Region where the cluster is located         | [optional] [default to null] |
| **allocatableResources** | [**ClusterDetails_allocatableResources**](ClusterDetails_allocatableResources.md) |                                             | [optional] [default to null] |
| **availableResources**   | [**ClusterDetails_availableResources**](ClusterDetails_availableResources.md)     |                                             | [optional] [default to null] |
| **update**               | [**ClusterUpdate**](ClusterUpdate.md)                                             |                                             | [optional] [default to null] |
| **status**               | [**ClusterStatus**](ClusterStatus.md)                                             |                                             | [optional] [default to null] |

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
