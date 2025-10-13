/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Real Azure Resource Graph query results with obfuscated sensitive data.
 *
 * To populate these fixtures, run the following Azure CLI commands:
 *
 * 1. Storage Account:
 *    az graph query -q "Resources | where type =~ 'microsoft.storage/storageaccounts' | limit 1"
 *
 * 2. Virtual Machine:
 *    az graph query -q "Resources | where type =~ 'microsoft.compute/virtualmachines' | limit 1"
 *
 * 3. AKS Cluster:
 *    az graph query -q "Resources | where type =~ 'microsoft.containerservice/managedclusters' | limit 1"
 *
 * 4. App Service:
 *    az graph query -q "Resources | where type =~ 'microsoft.web/sites' | limit 1"
 *
 * After getting the results, obfuscate the following fields:
 * - id: Replace subscription IDs and resource IDs with fake values
 * - subscriptionId: Use 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
 * - tenantId: Use 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy'
 * - name: Use generic names like 'test-storage-account'
 * - Keep the structure and property names intact!
 */

/**
 * Azure Storage Account resource
 * Command: az graph query -q "Resources | where type =~ 'microsoft.storage/storageaccounts' | limit 1"
 * Based on real Azure Resource Graph output with obfuscated sensitive data
 */
export const storageAccountResource = {
  extendedLocation: null,
  id: '/subscriptions/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/resourceGroups/reference-data-shared-rg/providers/Microsoft.Storage/storageAccounts/referencedatateststg',
  identity: {
    type: 'None',
  },
  kind: 'StorageV2',
  location: 'westeurope',
  managedBy: '',
  name: 'referencedatateststg',
  plan: null,
  properties: {
    accessTier: 'Hot',
    allowBlobPublicAccess: false,
    allowCrossTenantReplication: true,
    allowSharedKeyAccess: true,
    creationTime: '2024-08-26T22:57:43.8528566Z',
    defaultToOAuthAuthentication: true,
    dnsEndpointType: 'Standard',
    encryption: {
      keySource: 'Microsoft.Storage',
      services: {
        blob: {
          enabled: true,
          keyType: 'Account',
          lastEnabledTime: '2024-08-26T22:57:44.1966042Z',
        },
        file: {
          enabled: true,
          keyType: 'Account',
          lastEnabledTime: '2024-08-26T22:57:44.1966042Z',
        },
      },
    },
    isHnsEnabled: false,
    isLocalUserEnabled: true,
    isNfsV3Enabled: false,
    isSftpEnabled: false,
    keyCreationTime: {
      key1: '2024-08-26T22:57:43.9778551Z',
      key2: '2024-08-26T22:57:43.9778551Z',
    },
    minimumTlsVersion: 'TLS1_2',
    networkAcls: {
      bypass: 'AzureServices',
      defaultAction: 'Deny',
      ipRules: [],
      ipv6Rules: [],
      resourceAccessRules: [],
      virtualNetworkRules: [
        {
          action: 'Allow',
          id: '/subscriptions/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/resourceGroups/abc-reference-data-test-vnet-rg/providers/Microsoft.Network/virtualNetworks/abc-reference-data-test-vnet/subnets/aks-subnet',
          resourceGroup: 'abc-reference-data-test-vnet-rg',
          state: 'Succeeded',
        },
      ],
    },
    primaryEndpoints: {
      blob: 'https://referencedatateststg.blob.core.windows.net/',
      dfs: 'https://referencedatateststg.dfs.core.windows.net/',
      file: 'https://referencedatateststg.file.core.windows.net/',
      queue: 'https://referencedatateststg.queue.core.windows.net/',
      table: 'https://referencedatateststg.table.core.windows.net/',
      web: 'https://referencedatateststg.z6.web.core.windows.net/',
    },
    primaryLocation: 'westeurope',
    privateEndpointConnections: [],
    provisioningState: 'Succeeded',
    publicNetworkAccess: 'Enabled',
    statusOfPrimary: 'available',
    supportsHttpsTrafficOnly: true,
  },
  resourceGroup: 'reference-data-shared-rg',
  sku: {
    name: 'Standard_LRS',
    tier: 'Standard',
  },
  subscriptionId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  tags: {},
  tenantId: 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy',
  type: 'microsoft.storage/storageaccounts',
  zones: null,
};

/**
 * Azure Virtual Machine resource
 * Command: az graph query -q "Resources | where type =~ 'microsoft.compute/virtualmachines' | limit 1"
 * Based on real Azure Resource Graph output with obfuscated sensitive data
 */
export const virtualMachineResource = {
  extendedLocation: null,
  id: '/subscriptions/bbbbbbbb-cccc-dddd-eeee-ffffffffffff/resourceGroups/mltest-dbw-managed-rg-ancillary/providers/Microsoft.Compute/virtualMachines/test-vm-instance',
  identity: {
    type: 'UserAssigned',
    userAssignedIdentities: {
      '/subscriptions/bbbbbbbb-cccc-dddd-eeee-ffffffffffff/resourceGroups/mltest-dbw-managed-rg-ancillary/providers/Microsoft.ManagedIdentity/userAssignedIdentities/dbmanagedidentity':
        {
          clientId: '11111111-2222-3333-4444-555555555555',
          principalId: '66666666-7777-8888-9999-aaaaaaaaaaaa',
        },
    },
  },
  kind: '',
  location: 'westeurope',
  managedBy: '',
  name: 'test-vm-instance',
  plan: null,
  properties: {
    extended: {
      instanceView: {
        computerName: 'test-vm-instance',
        hyperVGeneration: 'V1',
        osName: 'ubuntu',
        osVersion: '22.04',
        powerState: {
          code: 'PowerState/running',
          displayStatus: 'VM running',
          level: 'Info',
        },
      },
    },
    hardwareProfile: {
      vmSize: 'Standard_DS3_v2',
    },
    networkProfile: {
      networkInterfaces: [
        {
          id: '/subscriptions/bbbbbbbb-cccc-dddd-eeee-ffffffffffff/resourceGroups/mltest-dbw-managed-rg-ancillary/providers/Microsoft.Network/networkInterfaces/test-vm-publicNIC',
          properties: {
            primary: true,
          },
          resourceGroup: 'mltest-dbw-managed-rg-ancillary',
        },
      ],
    },
    osProfile: {
      adminUsername: 'ubuntu',
      allowExtensionOperations: true,
      computerName: 'test-vm-instance',
      linuxConfiguration: {
        disablePasswordAuthentication: true,
        patchSettings: {
          assessmentMode: 'ImageDefault',
          patchMode: 'ImageDefault',
        },
        provisionVMAgent: true,
      },
      requireGuestProvisionSignal: true,
      secrets: [],
    },
    provisioningState: 'Succeeded',
    storageProfile: {
      dataDisks: [
        {
          caching: 'ReadWrite',
          createOption: 'Attach',
          deleteOption: 'Detach',
          diskSizeGB: 256,
          lun: 0,
          managedDisk: {
            id: '/subscriptions/bbbbbbbb-cccc-dddd-eeee-ffffffffffff/resourceGroups/mltest-dbw-managed-rg-ancillary/providers/Microsoft.Compute/disks/test-vm-containerRootVolume',
            resourceGroup: 'mltest-dbw-managed-rg-ancillary',
            storageAccountType: 'Premium_LRS',
          },
          name: 'test-vm-containerRootVolume',
          toBeDetached: false,
        },
      ],
      imageReference: {
        exactVersion: '20250801.1342.1',
        offer: 'Databricks',
        publisher: 'AzureDatabricks',
        sku: 'DatabricksWorker',
        version: '20250801.1342.1',
      },
      osDisk: {
        caching: 'ReadOnly',
        createOption: 'FromImage',
        deleteOption: 'Delete',
        diffDiskSettings: {
          option: 'Local',
          placement: 'CacheDisk',
        },
        diskSizeGB: 30,
        managedDisk: {
          id: '/subscriptions/bbbbbbbb-cccc-dddd-eeee-ffffffffffff/resourceGroups/mltest-dbw-managed-rg-ancillary/providers/Microsoft.Compute/disks/test-vm-osDisk',
          resourceGroup: 'mltest-dbw-managed-rg-ancillary',
          storageAccountType: 'Standard_LRS',
        },
        name: 'test-vm-osDisk',
        osType: 'Linux',
      },
    },
    timeCreated: '2025-10-08T13:24:03.518Z',
    vmId: 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc',
  },
  resourceGroup: 'mltest-dbw-managed-rg-ancillary',
  sku: null,
  subscriptionId: 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff',
  tags: {
    ClusterId: '0930-091120-ra9r84yl',
    ClusterName: 'Test Cluster 2025-09-30',
    CostCenter: '90104',
    CreatedBy: 'terraform',
    Creator: 'test.user@example.com',
    DatabricksEnvironment: 'workerenv-1330285890001008',
    Vendor: 'Databricks',
  },
  tenantId: 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy',
  type: 'microsoft.compute/virtualmachines',
  zones: ['1'],
};

/**
 * Azure AKS Cluster resource
 * Command: az graph query -q "Resources | where type =~ 'microsoft.containerservice/managedclusters' | limit 1"
 * Based on real Azure Resource Graph output with obfuscated sensitive data
 */
export const aksClusterResource = {
  extendedLocation: null,
  id: '/subscriptions/cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa/resourceGroups/abc-aks-prod-rg/providers/Microsoft.ContainerService/managedClusters/abc-reference-test-aks',
  identity: {
    type: 'UserAssigned',
    userAssignedIdentities: {
      '/subscriptions/cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa/resourceGroups/abc-aks-prod-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/abc-reference-test-aks-identity':
        {
          clientId: 'aaaaaaaa-1111-2222-3333-bbbbbbbbbbbb',
          principalId: 'bbbbbbbb-2222-3333-4444-cccccccccccc',
        },
    },
  },
  kind: '',
  location: 'westeurope',
  managedBy: '',
  name: 'abc-reference-test-aks',
  plan: null,
  properties: {
    aadProfile: {
      adminGroupObjectIDs: [
        'dddddddd-3333-4444-5555-eeeeeeeeeeee',
        'eeeeeeee-4444-5555-6666-ffffffffffff',
      ],
      adminUsers: null,
      enableAzureRBAC: true,
      managed: true,
      tenantID: 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy',
    },
    addonProfiles: {
      azureKeyvaultSecretsProvider: {
        config: {
          enableSecretRotation: 'true',
          rotationPollInterval: '240m',
        },
        enabled: true,
        identity: {
          clientId: 'ffffffff-5555-6666-7777-aaaaaaaaaaaa',
          objectId: 'aaaaaaaa-6666-7777-8888-bbbbbbbbbbbb',
          resourceId:
            '/subscriptions/cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa/resourcegroups/MC_abc-aks-prod-rg_abc-reference-test-aks_westeurope/providers/Microsoft.ManagedIdentity/userAssignedIdentities/azurekeyvaultsecretsprovider-abc-reference-test-aks',
        },
      },
      azurepolicy: {
        config: null,
        enabled: true,
      },
    },
    agentPoolProfiles: [
      {
        count: 3,
        currentOrchestratorVersion: '1.33.3',
        enableAutoScaling: true,
        maxCount: 5,
        maxPods: 60,
        minCount: 3,
        mode: 'System',
        name: 'system',
        nodeImageVersion: 'AKSUbuntu-2204gen2containerd-202509.11.0',
        orchestratorVersion: '1.33.3',
        osDiskSizeGB: 128,
        osDiskType: 'Managed',
        osSKU: 'Ubuntu',
        osType: 'Linux',
        powerState: {
          code: 'Running',
        },
        provisioningState: 'Succeeded',
        type: 'VirtualMachineScaleSets',
        vmSize: 'Standard_DS2_v2',
      },
      {
        count: 1,
        currentOrchestratorVersion: '1.33.3',
        enableAutoScaling: true,
        maxCount: 30,
        minCount: 0,
        mode: 'User',
        name: 'app',
        nodeLabels: {
          type: 'app',
        },
        orchestratorVersion: '1.33.3',
        provisioningState: 'Succeeded',
        tags: {
          environment: 'prod',
          nodepool_type: 'app',
        },
        vmSize: 'Standard_D4s_v3',
      },
    ],
    apiServerAccessProfile: {
      enablePrivateCluster: true,
      enablePrivateClusterPublicFQDN: true,
      privateDNSZone: 'None',
    },
    currentKubernetesVersion: '1.33.3',
    dnsPrefix: 'abc-reference-test-aks',
    fqdn: 'abc-reference-test-aks-dns-12345678.hcp.westeurope.azmk8s.io',
    kubernetesVersion: '1.33.3',
    networkProfile: {
      dnsServiceIP: '10.0.0.10',
      loadBalancerSku: 'Standard',
      networkPlugin: 'azure',
      networkPolicy: 'calico',
      outboundType: 'loadBalancer',
      serviceCidr: '10.0.0.0/16',
    },
    provisioningState: 'Succeeded',
  },
  resourceGroup: 'abc-aks-prod-rg',
  sku: {
    name: 'Base',
    tier: 'Standard',
  },
  subscriptionId: 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa',
  tags: {
    'catalog.owner': 'platform-team',
    environment: 'production',
    managedBy: 'terraform',
  },
  tenantId: 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy',
  type: 'microsoft.containerservice/managedclusters',
  zones: null,
};

/**
 * Azure App Service resource
 * Command: az graph query -q "Resources | where type =~ 'microsoft.web/sites' | limit 1"
 * Note: Using a simplified structure for testing purposes
 */
export const appServiceResource = {
  id: '/subscriptions/dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb/resourceGroups/app-service-rg/providers/Microsoft.Web/sites/test-app-service',
  name: 'test-app-service',
  type: 'microsoft.web/sites',
  tenantId: 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy',
  location: 'eastus',
  subscriptionId: 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb',
  kind: 'app',
  properties: {
    state: 'Running',
    hostNames: ['test-app-service.azurewebsites.net'],
    repositorySiteName: 'test-app-service',
    usageState: 'Normal',
    enabled: true,
    enabledHostNames: [
      'test-app-service.azurewebsites.net',
      'test-app-service.scm.azurewebsites.net',
    ],
    availabilityState: 'Normal',
    serverFarmId:
      '/subscriptions/dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb/resourceGroups/app-service-rg/providers/Microsoft.Web/serverfarms/app-service-plan',
    reserved: false,
    isXenon: false,
    hyperV: false,
    siteConfig: {
      numberOfWorkers: 1,
      defaultDocuments: [
        'Default.htm',
        'Default.html',
        'index.htm',
        'index.html',
      ],
      netFrameworkVersion: 'v6.0',
      phpVersion: '',
      pythonVersion: '',
      nodeVersion: '',
      linuxFxVersion: '',
      windowsFxVersion: null,
      requestTracingEnabled: false,
      remoteDebuggingEnabled: false,
      httpLoggingEnabled: false,
      detailedErrorLoggingEnabled: false,
      ftpsState: 'AllAllowed',
      minTlsVersion: '1.2',
      http20Enabled: true,
      alwaysOn: true,
    },
    httpsOnly: true,
  },
  tags: {
    'catalog.owner': 'app-team',
    environment: 'development',
    'app.type': 'web-api',
  },
};

/**
 * Resource with complex nested properties and tags
 * This should have multiple levels of nesting to test deep path extraction
 */
export const complexNestedResource = aksClusterResource;

/**
 * Resource with minimal required fields only
 * Used to test edge cases where optional fields are missing
 */
export const minimalResource = {
  id: '/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/rg-minimal/providers/Microsoft.Storage/storageAccounts/minimal',
  name: 'minimal-resource',
  type: 'microsoft.storage/storageaccounts',
  tenantId: 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy',
  location: 'westus',
  subscriptionId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  // No tags, no properties, just the basics
};

/**
 * Resource with special characters in tag keys
 * Used to test bracket notation in mapping paths
 */
export const resourceWithSpecialTagKeys = {
  id: '/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/rg-test/providers/Microsoft.Storage/storageAccounts/specialtags',
  name: 'special-tags-resource',
  type: 'microsoft.storage/storageaccounts',
  tenantId: 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy',
  location: 'eastus2',
  subscriptionId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  tags: {
    'catalog.owner': 'team-infrastructure',
    'app.kubernetes.io/name': 'my-app',
    'backstage.io/managed-by': 'platform-team',
    owner: 'simple-owner', // Also has a simple version
    environment: 'staging',
  },
  properties: {
    provisioningState: 'Succeeded',
  },
};
