# DefaultApi

All URIs are relative to _http://localhost:7007/api/ocm_

| Method                                                                             | HTTP request                               | Description                          |
| ---------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------ |
| [**statusGet**](DefaultApi.md#statusGet)                                           | **GET** /status                            | Get the status of all clusters       |
| [**statusProviderIdClusterNameGet**](DefaultApi.md#statusProviderIdClusterNameGet) | **GET** /status/{providerId}/{clusterName} | Get the status of a specific cluster |

<a name="statusGet"></a>

# **statusGet**

> List statusGet()

Get the status of all clusters

    Retrieve the status of all clusters across all hubs.

### Parameters

This endpoint does not need any parameter.

### Return type

[**List**](../Models/ClusterOverview.md)

### Authorization

[JWT](../README.md#JWT)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

<a name="statusProviderIdClusterNameGet"></a>

# **statusProviderIdClusterNameGet**

> Cluster statusProviderIdClusterNameGet(providerId, clusterName)

Get the status of a specific cluster

    Retrieve the status of a specific cluster on a given hub.

### Parameters

| Name            | Type       | Description                | Notes             |
| --------------- | ---------- | -------------------------- | ----------------- |
| **providerId**  | **String** | The ID of the OCM provider | [default to null] |
| **clusterName** | **String** | The name of the cluster    | [default to null] |

### Return type

[**Cluster**](../Models/Cluster.md)

### Authorization

[JWT](../README.md#JWT)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json
