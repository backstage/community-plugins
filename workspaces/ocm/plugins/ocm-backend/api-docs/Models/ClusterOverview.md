# ClusterOverview

## Properties

| Name                 | Type                                  | Description                                 | Notes                        |
| -------------------- | ------------------------------------- | ------------------------------------------- | ---------------------------- |
| **name**             | **String**                            | The name of the cluster                     | [optional] [default to null] |
| **status**           | [**ClusterStatus**](ClusterStatus.md) |                                             | [optional] [default to null] |
| **update**           | [**ClusterUpdate**](ClusterUpdate.md) |                                             | [optional] [default to null] |
| **platform**         | **String**                            | Platform of the cluster                     | [optional] [default to null] |
| **openshiftVersion** | **String**                            | Version of OpenShift running in the cluster | [optional] [default to null] |
| **nodes**            | [**List**](ClusterNodesStatus.md)     |                                             | [optional] [default to null] |

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
