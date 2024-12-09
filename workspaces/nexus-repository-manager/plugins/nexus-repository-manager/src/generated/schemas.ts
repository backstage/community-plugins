export const $AnonymousAccessSettingsXO = {
  properties: {
    enabled: {
      type: 'boolean',
      description: `Whether or not Anonymous Access is enabled`,
    },
    userId: {
      type: 'string',
      description: `The username of the anonymous account`,
    },
    realmName: {
      type: 'string',
      description: `The name of the authentication realm for the anonymous account`,
    },
  },
} as const;

export const $ApiUserSource = {
  properties: {
    id: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
  },
} as const;

export const $ApiUser = {
  properties: {
    userId: {
      type: 'string',
      description: `The userid which is required for login. This value cannot be changed.`,
    },
    firstName: {
      type: 'string',
      description: `The first name of the user.`,
    },
    lastName: {
      type: 'string',
      description: `The last name of the user.`,
    },
    emailAddress: {
      type: 'string',
      description: `The email address associated with the user.`,
    },
    source: {
      type: 'string',
      description: `The user source which is the origin of this user. This value cannot be changed.`,
    },
    status: {
      type: 'Enum',
      enum: ['active', 'locked', 'disabled', 'changepassword'],
      isRequired: true,
    },
    readOnly: {
      type: 'boolean',
      description: `Indicates whether the user's properties could be modified by the Nexus Repository Manager. When false only roles are considered during update.`,
    },
    roles: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
    externalRoles: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
  },
} as const;

export const $ApiCreateUser = {
  properties: {
    userId: {
      type: 'string',
      description: `The userid which is required for login. This value cannot be changed.`,
    },
    firstName: {
      type: 'string',
      description: `The first name of the user.`,
    },
    lastName: {
      type: 'string',
      description: `The last name of the user.`,
    },
    emailAddress: {
      type: 'string',
      description: `The email address associated with the user.`,
    },
    password: {
      type: 'string',
      description: `The password for the new user.`,
    },
    status: {
      type: 'Enum',
      enum: ['active', 'locked', 'disabled', 'changepassword'],
      isRequired: true,
    },
    roles: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
  },
} as const;

export const $ApiPrivilege = {
  properties: {
    type: {
      type: 'string',
      description: `The type of privilege, each type covers different portions of the system. External values supplied to this will be ignored by the system.`,
    },
    name: {
      type: 'string',
      description: `The name of the privilege.  This value cannot be changed.`,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    description: {
      type: 'string',
    },
    readOnly: {
      type: 'boolean',
      description: `Indicates whether the privilege can be changed. External values supplied to this will be ignored by the system.`,
    },
  },
} as const;

export const $ApiPrivilegeWildcardRequest = {
  properties: {
    name: {
      type: 'string',
      description: `The name of the privilege.  This value cannot be changed.`,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    description: {
      type: 'string',
    },
    pattern: {
      type: 'string',
      description: `A colon separated list of parts that create a permission string.`,
    },
  },
} as const;

export const $ApiPrivilegeApplicationRequest = {
  properties: {
    name: {
      type: 'string',
      description: `The name of the privilege.  This value cannot be changed.`,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    description: {
      type: 'string',
    },
    actions: {
      type: 'array',
      contains: {
        type: 'Enum',
        enum: [
          'READ',
          'BROWSE',
          'EDIT',
          'ADD',
          'DELETE',
          'RUN',
          'ASSOCIATE',
          'DISASSOCIATE',
          'ALL',
        ],
      },
    },
    domain: {
      type: 'string',
      description: `The domain (i.e. 'blobstores', 'capabilities' or even '*' for all) that this privilege is granting access to.  Note that creating new privileges with a domain is only necessary when using plugins that define their own domain(s).`,
    },
  },
} as const;

export const $RealmApiXO = {
  properties: {
    id: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
  },
} as const;

export const $RoleXOResponse = {
  properties: {
    id: {
      type: 'string',
      description: `The id of the role.`,
    },
    source: {
      type: 'string',
      description: `The user source which is the origin of this role.`,
    },
    name: {
      type: 'string',
      description: `The name of the role.`,
    },
    description: {
      type: 'string',
      description: `The description of this role.`,
    },
    readOnly: {
      type: 'boolean',
      description: `Indicates whether the role can be changed. The system will ignore any supplied external values.`,
    },
    privileges: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
    roles: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
  },
} as const;

export const $RoleXORequest = {
  properties: {
    id: {
      type: 'string',
      description: `The id of the role.`,
    },
    name: {
      type: 'string',
      description: `The name of the role.`,
    },
    description: {
      type: 'string',
      description: `The description of this role.`,
    },
    privileges: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
    roles: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
  },
} as const;

export const $Page = {
  properties: {
    items: {
      type: 'array',
      contains: {
        properties: {},
      },
    },
    continuationToken: {
      type: 'string',
    },
  },
} as const;

export const $PageTaskXO = {
  properties: {
    items: {
      type: 'array',
      contains: {
        type: 'TaskXO',
      },
    },
    continuationToken: {
      type: 'string',
    },
  },
} as const;

export const $TaskXO = {
  properties: {
    id: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    type: {
      type: 'string',
    },
    message: {
      type: 'string',
    },
    currentState: {
      type: 'string',
    },
    lastRunResult: {
      type: 'string',
    },
    nextRun: {
      type: 'string',
      format: 'date-time',
    },
    lastRun: {
      type: 'string',
      format: 'date-time',
    },
  },
} as const;

export const $BlobStoreQuotaResultXO = {
  properties: {
    isViolation: {
      type: 'boolean',
    },
    message: {
      type: 'string',
    },
    blobStoreName: {
      type: 'string',
    },
  },
} as const;

export const $BlobStoreApiSoftQuota = {
  properties: {
    type: {
      type: 'Enum',
      enum: ['spaceRemainingQuota', 'spaceUsedQuota'],
    },
    limit: {
      type: 'number',
      description: `The limit in MB.`,
      format: 'int64',
      minimum: 0,
    },
  },
} as const;

export const $GenericBlobStoreApiResponse = {
  properties: {
    softQuota: {
      type: 'BlobStoreApiSoftQuota',
      description: `Settings to control the soft quota`,
    },
    name: {
      type: 'string',
    },
    type: {
      type: 'string',
    },
    unavailable: {
      type: 'boolean',
    },
    blobCount: {
      type: 'number',
      format: 'int64',
    },
    totalSizeInBytes: {
      type: 'number',
      format: 'int64',
    },
    availableSpaceInBytes: {
      type: 'number',
      format: 'int64',
    },
  },
} as const;

export const $FileBlobStoreApiCreateRequest = {
  properties: {
    softQuota: {
      type: 'BlobStoreApiSoftQuota',
      description: `Settings to control the soft quota`,
    },
    path: {
      type: 'string',
      description: `The path to the blobstore contents. This can be an absolute path to anywhere on the system Nexus Repository Manager has access to or it can be a path relative to the sonatype-work directory.`,
    },
    name: {
      type: 'string',
    },
  },
} as const;

export const $FileBlobStoreApiUpdateRequest = {
  properties: {
    softQuota: {
      type: 'BlobStoreApiSoftQuota',
      description: `Settings to control the soft quota`,
    },
    path: {
      type: 'string',
      description: `The path to the blobstore contents. This can be an absolute path to anywhere on the system Nexus Repository Manager has access to or it can be a path relative to the sonatype-work directory.`,
    },
  },
} as const;

export const $FileBlobStoreApiModel = {
  properties: {
    softQuota: {
      type: 'BlobStoreApiSoftQuota',
      description: `Settings to control the soft quota`,
    },
    path: {
      type: 'string',
      description: `The path to the blobstore contents. This can be an absolute path to anywhere on the system Nexus Repository Manager has access to or it can be a path relative to the sonatype-work directory.`,
    },
  },
} as const;

export const $ReadOnlyState = {
  properties: {
    systemInitiated: {
      type: 'boolean',
    },
    summaryReason: {
      type: 'string',
    },
    frozen: {
      type: 'boolean',
    },
  },
} as const;

export const $ApiCertificate = {
  properties: {
    expiresOn: {
      type: 'number',
      format: 'int64',
    },
    fingerprint: {
      type: 'string',
    },
    id: {
      type: 'string',
    },
    issuedOn: {
      type: 'number',
      format: 'int64',
    },
    issuerCommonName: {
      type: 'string',
    },
    issuerOrganization: {
      type: 'string',
    },
    issuerOrganizationalUnit: {
      type: 'string',
    },
    pem: {
      type: 'string',
    },
    serialNumber: {
      type: 'string',
    },
    subjectCommonName: {
      type: 'string',
    },
    subjectOrganization: {
      type: 'string',
    },
    subjectOrganizationalUnit: {
      type: 'string',
    },
  },
} as const;

export const $AssetXO = {
  properties: {
    downloadUrl: {
      type: 'string',
    },
    path: {
      type: 'string',
    },
    id: {
      type: 'string',
    },
    repository: {
      type: 'string',
    },
    format: {
      type: 'string',
    },
    checksum: {
      type: 'dictionary',
      contains: {
        properties: {},
      },
    },
    contentType: {
      type: 'string',
    },
    lastModified: {
      type: 'string',
      format: 'date-time',
    },
    lastDownloaded: {
      type: 'string',
      format: 'date-time',
    },
    uploader: {
      type: 'string',
    },
    uploaderIp: {
      type: 'string',
    },
    fileSize: {
      type: 'number',
      format: 'int64',
    },
  },
} as const;

export const $PageAssetXO = {
  properties: {
    items: {
      type: 'array',
      contains: {
        type: 'AssetXO',
      },
    },
    continuationToken: {
      type: 'string',
    },
  },
} as const;

export const $ComponentXO = {
  properties: {
    id: {
      type: 'string',
    },
    repository: {
      type: 'string',
    },
    format: {
      type: 'string',
    },
    group: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    version: {
      type: 'string',
    },
    assets: {
      type: 'array',
      contains: {
        type: 'AssetXO',
      },
    },
  },
} as const;

export const $PageComponentXO = {
  properties: {
    items: {
      type: 'array',
      contains: {
        type: 'ComponentXO',
      },
    },
    continuationToken: {
      type: 'string',
    },
  },
} as const;

export const $AbstractApiRepository = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    format: {
      type: 'string',
      description: `Component format held in this repository`,
    },
    type: {
      type: 'Enum',
      enum: ['hosted', 'proxy', 'group'],
    },
    url: {
      type: 'string',
      description: `URL to the repository`,
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
  },
} as const;

export const $ContentSelectorApiResponse = {
  properties: {
    name: {
      type: 'string',
      description: `The content selector name cannot be changed after creation`,
    },
    type: {
      type: 'Enum',
      enum: ['csel', 'jexl'],
    },
    description: {
      type: 'string',
      description: `A human-readable description`,
    },
    expression: {
      type: 'string',
      description: `The expression used to identify content`,
    },
  },
} as const;

export const $ContentSelectorApiCreateRequest = {
  properties: {
    name: {
      type: 'string',
      description: `The content selector name cannot be changed after creation`,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    description: {
      type: 'string',
      description: `A human-readable description`,
    },
    expression: {
      type: 'string',
      description: `The expression used to identify content`,
    },
  },
} as const;

export const $ContentSelectorApiUpdateRequest = {
  properties: {
    description: {
      type: 'string',
      description: `An optional description of this content selector`,
    },
    expression: {
      type: 'string',
      description: `The expression used to identify content`,
    },
  },
} as const;

export const $RepositoryXO = {
  properties: {
    name: {
      type: 'string',
    },
    format: {
      type: 'string',
    },
    type: {
      type: 'string',
    },
    url: {
      type: 'string',
    },
    attributes: {
      type: 'dictionary',
      contains: {
        properties: {},
      },
    },
  },
} as const;

export const $RoutingRuleXO = {
  properties: {
    name: {
      type: 'string',
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    description: {
      type: 'string',
    },
    mode: {
      type: 'Enum',
      enum: ['BLOCK', 'ALLOW'],
    },
    matchers: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
  },
} as const;

export const $UploadDefinitionXO = {
  properties: {
    format: {
      type: 'string',
    },
    multipleUpload: {
      type: 'boolean',
    },
    componentFields: {
      type: 'array',
      contains: {
        type: 'UploadFieldDefinitionXO',
      },
    },
    assetFields: {
      type: 'array',
      contains: {
        type: 'UploadFieldDefinitionXO',
      },
    },
  },
} as const;

export const $UploadFieldDefinitionXO = {
  properties: {
    name: {
      type: 'string',
    },
    type: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    optional: {
      type: 'boolean',
    },
    group: {
      type: 'string',
    },
  },
} as const;

export const $ApiPrivilegeRepositoryContentSelectorRequest = {
  properties: {
    name: {
      type: 'string',
      description: `The name of the privilege.  This value cannot be changed.`,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    description: {
      type: 'string',
    },
    actions: {
      type: 'array',
      contains: {
        type: 'Enum',
        enum: [
          'READ',
          'BROWSE',
          'EDIT',
          'ADD',
          'DELETE',
          'RUN',
          'ASSOCIATE',
          'DISASSOCIATE',
          'ALL',
        ],
      },
    },
    format: {
      type: 'string',
      description: `The repository format (i.e 'nuget', 'npm') this privilege will grant access to (or * for all).`,
    },
    repository: {
      type: 'string',
      description: `The name of the repository this privilege will grant access to (or * for all).`,
    },
    contentSelector: {
      type: 'string',
      description: `The name of a content selector that will be used to grant access to content via this privilege.`,
    },
  },
} as const;

export const $ApiPrivilegeRepositoryAdminRequest = {
  properties: {
    name: {
      type: 'string',
      description: `The name of the privilege.  This value cannot be changed.`,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    description: {
      type: 'string',
    },
    actions: {
      type: 'array',
      contains: {
        type: 'Enum',
        enum: [
          'READ',
          'BROWSE',
          'EDIT',
          'ADD',
          'DELETE',
          'RUN',
          'ASSOCIATE',
          'DISASSOCIATE',
          'ALL',
        ],
      },
    },
    format: {
      type: 'string',
      description: `The repository format (i.e 'nuget', 'npm') this privilege will grant access to (or * for all).`,
    },
    repository: {
      type: 'string',
      description: `The name of the repository this privilege will grant access to (or * for all).`,
    },
  },
} as const;

export const $ApiPrivilegeRepositoryViewRequest = {
  properties: {
    name: {
      type: 'string',
      description: `The name of the privilege.  This value cannot be changed.`,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    description: {
      type: 'string',
    },
    actions: {
      type: 'array',
      contains: {
        type: 'Enum',
        enum: [
          'READ',
          'BROWSE',
          'EDIT',
          'ADD',
          'DELETE',
          'RUN',
          'ASSOCIATE',
          'DISASSOCIATE',
          'ALL',
        ],
      },
    },
    format: {
      type: 'string',
      description: `The repository format (i.e 'nuget', 'npm') this privilege will grant access to (or * for all).`,
    },
    repository: {
      type: 'string',
      description: `The name of the repository this privilege will grant access to (or * for all).`,
    },
  },
} as const;

export const $GroupAttributes = {
  properties: {
    memberNames: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
  },
} as const;

export const $MavenGroupRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    group: {
      type: 'GroupAttributes',
      isRequired: true,
    },
  },
} as const;

export const $StorageAttributes = {
  properties: {
    blobStoreName: {
      type: 'string',
      description: `Blob store used to store repository contents`,
    },
    strictContentTypeValidation: {
      type: 'boolean',
      description: `Whether to validate uploaded content's MIME type appropriate for the repository format`,
      isRequired: true,
    },
  },
} as const;

export const $SimpleApiGroupRepository = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    group: {
      type: 'GroupAttributes',
      isRequired: true,
    },
  },
} as const;

export const $CleanupPolicyAttributes = {
  properties: {
    policyNames: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
  },
} as const;

export const $ComponentAttributes = {
  properties: {
    proprietaryComponents: {
      type: 'boolean',
      description: `Components in this repository count as proprietary for namespace conflict attacks (requires Sonatype Nexus Firewall)`,
    },
  },
} as const;

export const $HostedStorageAttributes = {
  properties: {
    blobStoreName: {
      type: 'string',
      description: `Blob store used to store repository contents`,
    },
    strictContentTypeValidation: {
      type: 'boolean',
      description: `Whether to validate uploaded content's MIME type appropriate for the repository format`,
      isRequired: true,
    },
    writePolicy: {
      type: 'Enum',
      enum: ['allow', 'allow_once', 'deny'],
      isRequired: true,
    },
  },
} as const;

export const $MavenAttributes = {
  properties: {
    versionPolicy: {
      type: 'Enum',
      enum: ['RELEASE', 'SNAPSHOT', 'MIXED'],
    },
    layoutPolicy: {
      type: 'Enum',
      enum: ['STRICT', 'PERMISSIVE'],
    },
    contentDisposition: {
      type: 'Enum',
      enum: ['INLINE', 'ATTACHMENT'],
    },
  },
} as const;

export const $MavenHostedApiRepository = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'HostedStorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    component: {
      type: 'ComponentAttributes',
    },
    maven: {
      type: 'MavenAttributes',
      isRequired: true,
    },
  },
} as const;

export const $MavenHostedRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'HostedStorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    component: {
      type: 'ComponentAttributes',
    },
    maven: {
      type: 'MavenAttributes',
      isRequired: true,
    },
  },
} as const;

export const $HttpClientAttributes = {
  properties: {
    blocked: {
      type: 'boolean',
      description: `Whether to block outbound connections on the repository`,
      isRequired: true,
    },
    autoBlock: {
      type: 'boolean',
      description: `Whether to auto-block outbound connections if remote peer is detected as unreachable/unresponsive`,
      isRequired: true,
    },
    connection: {
      type: 'HttpClientConnectionAttributes',
    },
    authentication: {
      type: 'HttpClientConnectionAuthenticationAttributes',
    },
  },
} as const;

export const $HttpClientConnectionAttributes = {
  properties: {
    retries: {
      type: 'number',
      description: `Total retries if the initial connection attempt suffers a timeout`,
      format: 'int32',
      maximum: 10,
      minimum: 0,
    },
    userAgentSuffix: {
      type: 'string',
      description: `Custom fragment to append to User-Agent header in HTTP requests`,
    },
    timeout: {
      type: 'number',
      description: `Seconds to wait for activity before stopping and retrying the connection`,
      format: 'int32',
      maximum: 3600,
      minimum: 1,
    },
    enableCircularRedirects: {
      type: 'boolean',
      description: `Whether to enable redirects to the same location (may be required by some servers)`,
    },
    enableCookies: {
      type: 'boolean',
      description: `Whether to allow cookies to be stored and used`,
    },
    useTrustStore: {
      type: 'boolean',
      description: `Use certificates stored in the Nexus Repository Manager truststore to connect to external systems`,
    },
  },
} as const;

export const $HttpClientConnectionAuthenticationAttributes = {
  properties: {
    type: {
      type: 'Enum',
      enum: ['username', 'ntlm'],
    },
    username: {
      type: 'string',
    },
    password: {
      type: 'string',
    },
    ntlmHost: {
      type: 'string',
    },
    ntlmDomain: {
      type: 'string',
    },
  },
} as const;

export const $MavenProxyApiRepository = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    proxy: {
      type: 'ProxyAttributes',
      isRequired: true,
    },
    negativeCache: {
      type: 'NegativeCacheAttributes',
      isRequired: true,
    },
    httpClient: {
      type: 'HttpClientAttributes',
      isRequired: true,
    },
    routingRuleName: {
      type: 'string',
      description: `The name of the routing rule assigned to this repository`,
    },
    replication: {
      type: 'ReplicationAttributes',
    },
    maven: {
      type: 'MavenAttributes',
      isRequired: true,
    },
  },
} as const;

export const $NegativeCacheAttributes = {
  properties: {
    enabled: {
      type: 'boolean',
      description: `Whether to cache responses for content not present in the proxied repository`,
      isRequired: true,
    },
    timeToLive: {
      type: 'number',
      description: `How long to cache the fact that a file was not found in the repository (in minutes)`,
      isRequired: true,
      format: 'int32',
    },
  },
} as const;

export const $ProxyAttributes = {
  properties: {
    remoteUrl: {
      type: 'string',
      description: `Location of the remote repository being proxied`,
    },
    contentMaxAge: {
      type: 'number',
      description: `How long to cache artifacts before rechecking the remote repository (in minutes)`,
      isRequired: true,
      format: 'int32',
    },
    metadataMaxAge: {
      type: 'number',
      description: `How long to cache metadata before rechecking the remote repository (in minutes)`,
      isRequired: true,
      format: 'int32',
    },
  },
} as const;

export const $ReplicationAttributes = {
  properties: {
    preemptivePullEnabled: {
      type: 'boolean',
      description: `Whether pre-emptive pull is enabled`,
      isRequired: true,
    },
    assetPathRegex: {
      type: 'string',
      description: `Regular Expression of Asset Paths to pull pre-emptively pull`,
    },
  },
} as const;

export const $HttpClientAttributesWithPreemptiveAuth = {
  properties: {
    blocked: {
      type: 'boolean',
      description: `Whether to block outbound connections on the repository`,
      isRequired: true,
    },
    autoBlock: {
      type: 'boolean',
      description: `Whether to auto-block outbound connections if remote peer is detected as unreachable/unresponsive`,
      isRequired: true,
    },
    connection: {
      type: 'HttpClientConnectionAttributes',
    },
    authentication: {
      type: 'HttpClientConnectionAuthenticationAttributesWithPreemptive',
    },
  },
} as const;

export const $HttpClientConnectionAuthenticationAttributesWithPreemptive = {
  properties: {
    type: {
      type: 'Enum',
      enum: ['username', 'ntlm'],
    },
    username: {
      type: 'string',
    },
    password: {
      type: 'string',
    },
    ntlmHost: {
      type: 'string',
    },
    ntlmDomain: {
      type: 'string',
    },
    preemptive: {
      type: 'boolean',
      description: `Whether to use pre-emptive authentication. Use with caution. Defaults to false.`,
    },
  },
} as const;

export const $MavenProxyRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    proxy: {
      type: 'ProxyAttributes',
      isRequired: true,
    },
    negativeCache: {
      type: 'NegativeCacheAttributes',
      isRequired: true,
    },
    httpClient: {
      type: 'HttpClientAttributesWithPreemptiveAuth',
      isRequired: true,
    },
    routingRule: {
      type: 'string',
    },
    replication: {
      type: 'ReplicationAttributes',
    },
    maven: {
      type: 'MavenAttributes',
      isRequired: true,
    },
  },
} as const;

export const $ApiPrivilegeScriptRequest = {
  properties: {
    name: {
      type: 'string',
      description: `The name of the privilege.  This value cannot be changed.`,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    description: {
      type: 'string',
    },
    actions: {
      type: 'array',
      contains: {
        type: 'Enum',
        enum: [
          'READ',
          'BROWSE',
          'EDIT',
          'ADD',
          'DELETE',
          'RUN',
          'ASSOCIATE',
          'DISASSOCIATE',
          'ALL',
        ],
      },
    },
    scriptName: {
      type: 'string',
      description: `The name of a script to give access to.`,
    },
  },
} as const;

export const $ScriptXO = {
  properties: {
    name: {
      type: 'string',
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    content: {
      type: 'string',
    },
    type: {
      type: 'string',
    },
  },
} as const;

export const $ScriptResultXO = {
  properties: {
    name: {
      type: 'string',
    },
    result: {
      type: 'string',
    },
  },
} as const;

export const $S3BlobStoreApiAdvancedBucketConnection = {
  properties: {
    endpoint: {
      type: 'string',
      description: `A custom endpoint URL for third party object stores using the S3 API.`,
    },
    signerType: {
      type: 'string',
      description: `An API signature version which may be required for third party object stores using the S3 API.`,
    },
    forcePathStyle: {
      type: 'boolean',
      description: `Setting this flag will result in path-style access being used for all requests.`,
    },
    maxConnectionPoolSize: {
      type: 'number',
      description: `Setting this value will override the default connection pool size of Nexus of the s3 client for this blobstore.`,
      format: 'int32',
    },
  },
} as const;

export const $S3BlobStoreApiBucket = {
  properties: {
    region: {
      type: 'string',
      description: `The AWS region to create a new S3 bucket in or an existing S3 bucket's region`,
      isRequired: true,
    },
    name: {
      type: 'string',
      description: `The name of the S3 bucket`,
      isRequired: true,
    },
    prefix: {
      type: 'string',
      description: `The S3 blob store (i.e S3 object) key prefix`,
    },
    expiration: {
      type: 'number',
      description: `How many days until deleted blobs are finally removed from the S3 bucket (-1 to disable)`,
      isRequired: true,
      format: 'int32',
    },
  },
} as const;

export const $S3BlobStoreApiBucketConfiguration = {
  properties: {
    bucket: {
      type: 'S3BlobStoreApiBucket',
      description: `Details of the S3 bucket such as name and region`,
      isReadOnly: true,
      isRequired: true,
    },
    encryption: {
      type: 'S3BlobStoreApiEncryption',
      description: `The type of encryption to use if any`,
      isReadOnly: true,
    },
    bucketSecurity: {
      type: 'S3BlobStoreApiBucketSecurity',
      description: `Security details for granting access the S3 API`,
    },
    advancedBucketConnection: {
      type: 'S3BlobStoreApiAdvancedBucketConnection',
      description: `A custom endpoint URL, signer type and whether path style access is enabled`,
    },
  },
} as const;

export const $S3BlobStoreApiBucketSecurity = {
  properties: {
    accessKeyId: {
      type: 'string',
      description: `An IAM access key ID for granting access to the S3 bucket`,
    },
    secretAccessKey: {
      type: 'string',
      description: `The secret access key associated with the specified IAM access key ID`,
    },
    role: {
      type: 'string',
      description: `An IAM role to assume in order to access the S3 bucket`,
    },
    sessionToken: {
      type: 'string',
      description: `An AWS STS session token associated with temporary security credentials which grant access to the S3 bucket`,
    },
  },
} as const;

export const $S3BlobStoreApiEncryption = {
  properties: {
    encryptionType: {
      type: 'Enum',
      enum: ['s3ManagedEncryption', 'kmsManagedEncryption'],
    },
    encryptionKey: {
      type: 'string',
      description: `The encryption key.`,
    },
  },
} as const;

export const $S3BlobStoreApiModel = {
  properties: {
    name: {
      type: 'string',
      description: `The name of the S3 blob store.`,
      isRequired: true,
    },
    softQuota: {
      type: 'BlobStoreApiSoftQuota',
      description: `Settings to control the soft quota.`,
    },
    bucketConfiguration: {
      type: 'S3BlobStoreApiBucketConfiguration',
      description: `The S3 specific configuration details for the S3 object that'll contain the blob store.`,
      isRequired: true,
    },
    type: {
      type: 'string',
      description: `The blob store type.`,
      isReadOnly: true,
    },
  },
} as const;

export const $AptHostedApiRepository = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'HostedStorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    component: {
      type: 'ComponentAttributes',
    },
    apt: {
      type: 'AptHostedRepositoriesAttributes',
      isRequired: true,
    },
    aptSigning: {
      type: 'AptSigningRepositoriesAttributes',
      isRequired: true,
    },
  },
} as const;

export const $AptHostedRepositoriesAttributes = {
  properties: {
    distribution: {
      type: 'string',
      description: `Distribution to fetch`,
    },
  },
} as const;

export const $AptSigningRepositoriesAttributes = {
  properties: {
    keypair: {
      type: 'string',
      description: `PGP signing key pair (armored private key e.g. gpg --export-secret-key --armor)`,
    },
    passphrase: {
      type: 'string',
      description: `Passphrase to access PGP signing key`,
    },
  },
} as const;

export const $AptHostedRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'HostedStorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    component: {
      type: 'ComponentAttributes',
    },
    apt: {
      type: 'AptHostedRepositoriesAttributes',
      isRequired: true,
    },
    aptSigning: {
      type: 'AptSigningRepositoriesAttributes',
      isRequired: true,
    },
  },
} as const;

export const $AptProxyApiRepository = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    proxy: {
      type: 'ProxyAttributes',
      isRequired: true,
    },
    negativeCache: {
      type: 'NegativeCacheAttributes',
      isRequired: true,
    },
    httpClient: {
      type: 'HttpClientAttributes',
      isRequired: true,
    },
    routingRuleName: {
      type: 'string',
      description: `The name of the routing rule assigned to this repository`,
    },
    replication: {
      type: 'ReplicationAttributes',
    },
    apt: {
      type: 'AptProxyRepositoriesAttributes',
      isRequired: true,
    },
  },
} as const;

export const $AptProxyRepositoriesAttributes = {
  properties: {
    distribution: {
      type: 'string',
      description: `Distribution to fetch`,
    },
    flat: {
      type: 'boolean',
      description: `Whether this repository is flat`,
      isRequired: true,
    },
  },
} as const;

export const $AptProxyRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    proxy: {
      type: 'ProxyAttributes',
      isRequired: true,
    },
    negativeCache: {
      type: 'NegativeCacheAttributes',
      isRequired: true,
    },
    httpClient: {
      type: 'HttpClientAttributes',
      isRequired: true,
    },
    routingRule: {
      type: 'string',
    },
    replication: {
      type: 'ReplicationAttributes',
    },
    apt: {
      type: 'AptProxyRepositoriesAttributes',
      isRequired: true,
    },
  },
} as const;

export const $RawAttributes = {
  properties: {
    contentDisposition: {
      type: 'Enum',
      enum: ['INLINE', 'ATTACHMENT'],
    },
  },
} as const;

export const $RawGroupRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    group: {
      type: 'GroupAttributes',
      isRequired: true,
    },
    raw: {
      type: 'RawAttributes',
    },
  },
} as const;

export const $RawHostedRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'HostedStorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    component: {
      type: 'ComponentAttributes',
    },
    raw: {
      type: 'RawAttributes',
    },
  },
} as const;

export const $SimpleApiHostedRepository = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'HostedStorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    component: {
      type: 'ComponentAttributes',
    },
  },
} as const;

export const $RawProxyRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    proxy: {
      type: 'ProxyAttributes',
      isRequired: true,
    },
    negativeCache: {
      type: 'NegativeCacheAttributes',
      isRequired: true,
    },
    httpClient: {
      type: 'HttpClientAttributes',
      isRequired: true,
    },
    routingRule: {
      type: 'string',
    },
    replication: {
      type: 'ReplicationAttributes',
    },
    raw: {
      type: 'RawAttributes',
    },
  },
} as const;

export const $SimpleApiProxyRepository = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    proxy: {
      type: 'ProxyAttributes',
      isRequired: true,
    },
    negativeCache: {
      type: 'NegativeCacheAttributes',
      isRequired: true,
    },
    httpClient: {
      type: 'HttpClientAttributes',
      isRequired: true,
    },
    routingRuleName: {
      type: 'string',
      description: `The name of the routing rule assigned to this repository`,
    },
    replication: {
      type: 'ReplicationAttributes',
    },
  },
} as const;

export const $ApiEmailConfiguration = {
  properties: {
    enabled: {
      type: 'boolean',
    },
    host: {
      type: 'string',
    },
    port: {
      type: 'number',
      isRequired: true,
      format: 'int32',
    },
    username: {
      type: 'string',
    },
    password: {
      type: 'string',
    },
    fromAddress: {
      type: 'string',
    },
    subjectPrefix: {
      type: 'string',
      description: `A prefix to add to all email subjects to aid in identifying automated emails`,
    },
    startTlsEnabled: {
      type: 'boolean',
      description: `Enable STARTTLS Support for Insecure Connections`,
    },
    startTlsRequired: {
      type: 'boolean',
      description: `Require STARTTLS Support`,
    },
    sslOnConnectEnabled: {
      type: 'boolean',
      description: `Enable SSL/TLS Encryption upon Connection`,
    },
    sslServerIdentityCheckEnabled: {
      type: 'boolean',
      description: `Verify the server certificate when using TLS or SSL`,
    },
    nexusTrustStoreEnabled: {
      type: 'boolean',
      description: `Use the Nexus Repository Manager's certificate truststore`,
    },
  },
} as const;

export const $ApiEmailValidation = {
  properties: {
    success: {
      type: 'boolean',
    },
    reason: {
      type: 'string',
    },
  },
} as const;

export const $Result = {
  properties: {
    healthy: {
      type: 'boolean',
    },
    message: {
      type: 'string',
    },
    error: {
      type: 'Throwable',
    },
    details: {
      type: 'dictionary',
      contains: {
        properties: {},
      },
    },
    time: {
      type: 'number',
      format: 'int64',
    },
    duration: {
      type: 'number',
      format: 'int64',
    },
    timestamp: {
      type: 'string',
    },
  },
} as const;

export const $StackTraceElement = {
  properties: {
    methodName: {
      type: 'string',
    },
    fileName: {
      type: 'string',
    },
    lineNumber: {
      type: 'number',
      format: 'int32',
    },
    className: {
      type: 'string',
    },
    nativeMethod: {
      type: 'boolean',
    },
  },
} as const;

export const $Throwable = {
  properties: {
    cause: {
      type: 'Throwable',
    },
    stackTrace: {
      type: 'array',
      contains: {
        type: 'StackTraceElement',
      },
    },
    message: {
      type: 'string',
    },
    localizedMessage: {
      type: 'string',
    },
    suppressed: {
      type: 'array',
      contains: {
        type: 'Throwable',
      },
    },
  },
} as const;

export const $SupportZipXO = {
  properties: {
    file: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    size: {
      type: 'string',
    },
    truncated: {
      type: 'boolean',
    },
  },
} as const;

export const $SupportZipGeneratorRequest = {
  properties: {
    systemInformation: {
      type: 'boolean',
    },
    threadDump: {
      type: 'boolean',
    },
    metrics: {
      type: 'boolean',
    },
    configuration: {
      type: 'boolean',
    },
    security: {
      type: 'boolean',
    },
    log: {
      type: 'boolean',
    },
    taskLog: {
      type: 'boolean',
    },
    auditLog: {
      type: 'boolean',
    },
    jmx: {
      type: 'boolean',
    },
    replication: {
      type: 'boolean',
    },
    limitFileSizes: {
      type: 'boolean',
    },
    limitZipSize: {
      type: 'boolean',
    },
    hostname: {
      type: 'string',
    },
  },
} as const;

export const $ReadLdapServerXo = {
  properties: {
    name: {
      type: 'string',
      description: `LDAP server name`,
      isRequired: true,
    },
    protocol: {
      type: 'Enum',
      enum: ['ldap', 'ldaps'],
      isRequired: true,
    },
    useTrustStore: {
      type: 'boolean',
      description: `Whether to use certificates stored in Nexus Repository Manager's truststore`,
    },
    host: {
      type: 'string',
      description: `LDAP server connection hostname`,
      isRequired: true,
    },
    port: {
      type: 'number',
      description: `LDAP server connection port to use`,
      isRequired: true,
      format: 'int32',
    },
    searchBase: {
      type: 'string',
      description: `LDAP location to be added to the connection URL`,
      isRequired: true,
    },
    authScheme: {
      type: 'Enum',
      enum: ['NONE', 'SIMPLE', 'DIGEST_MD5', 'CRAM_MD5'],
      isRequired: true,
    },
    authRealm: {
      type: 'string',
      description: `The SASL realm to bind to. Required if authScheme is CRAM_MD5 or DIGEST_MD5`,
    },
    authUsername: {
      type: 'string',
      description: `This must be a fully qualified username if simple authentication is used. Required if authScheme other than none.`,
    },
    connectionTimeoutSeconds: {
      type: 'number',
      description: `How long to wait before timeout`,
      isRequired: true,
      format: 'int32',
      maximum: 3600,
      minimum: 1,
    },
    connectionRetryDelaySeconds: {
      type: 'number',
      description: `How long to wait before retrying`,
      isRequired: true,
      format: 'int32',
      minimum: 0,
    },
    maxIncidentsCount: {
      type: 'number',
      description: `How many retry attempts`,
      isRequired: true,
      format: 'int32',
      minimum: 0,
    },
    userBaseDn: {
      type: 'string',
      description: `The relative DN where user objects are found (e.g. ou=people). This value will have the Search base DN value appended to form the full User search base DN.`,
    },
    userSubtree: {
      type: 'boolean',
      description: `Are users located in structures below the user base DN?`,
    },
    userObjectClass: {
      type: 'string',
      description: `LDAP class for user objects`,
    },
    userLdapFilter: {
      type: 'string',
      description: `LDAP search filter to limit user search`,
    },
    userIdAttribute: {
      type: 'string',
      description: `This is used to find a user given its user ID`,
    },
    userRealNameAttribute: {
      type: 'string',
      description: `This is used to find a real name given the user ID`,
    },
    userEmailAddressAttribute: {
      type: 'string',
      description: `This is used to find an email address given the user ID`,
    },
    userPasswordAttribute: {
      type: 'string',
      description: `If this field is blank the user will be authenticated against a bind with the LDAP server`,
    },
    ldapGroupsAsRoles: {
      type: 'boolean',
      description: `Denotes whether LDAP assigned roles are used as Nexus Repository Manager roles`,
    },
    groupType: {
      type: 'Enum',
      enum: ['static', 'dynamic'],
      isRequired: true,
    },
    groupBaseDn: {
      type: 'string',
      description: `The relative DN where group objects are found (e.g. ou=Group). This value will have the Search base DN value appended to form the full Group search base DN.`,
    },
    groupSubtree: {
      type: 'boolean',
      description: `Are groups located in structures below the group base DN`,
    },
    groupObjectClass: {
      type: 'string',
      description: `LDAP class for group objects. Required if groupType is static`,
      maxLength: 0,
      minLength: 0,
    },
    groupIdAttribute: {
      type: 'string',
      description: `This field specifies the attribute of the Object class that defines the Group ID. Required if groupType is static`,
      maxLength: 0,
      minLength: 0,
    },
    groupMemberAttribute: {
      type: 'string',
      description: `LDAP attribute containing the usernames for the group. Required if groupType is static`,
      maxLength: 0,
      minLength: 0,
    },
    groupMemberFormat: {
      type: 'string',
      description: `The format of user ID stored in the group member attribute. Required if groupType is static`,
      maxLength: 0,
      minLength: 0,
    },
    userMemberOfAttribute: {
      type: 'string',
      description: `Set this to the attribute used to store the attribute which holds groups DN in the user object. Required if groupType is dynamic`,
      maxLength: 0,
      minLength: 0,
    },
    id: {
      type: 'string',
      description: `LDAP server ID`,
    },
    order: {
      type: 'number',
      description: `Order number in which the server is being used when looking for a user`,
      format: 'int32',
    },
  },
} as const;

export const $CreateLdapServerXo = {
  properties: {
    name: {
      type: 'string',
      description: `LDAP server name`,
      isRequired: true,
    },
    protocol: {
      type: 'Enum',
      enum: ['ldap', 'ldaps'],
      isRequired: true,
    },
    useTrustStore: {
      type: 'boolean',
      description: `Whether to use certificates stored in Nexus Repository Manager's truststore`,
    },
    host: {
      type: 'string',
      description: `LDAP server connection hostname`,
      isRequired: true,
    },
    port: {
      type: 'number',
      description: `LDAP server connection port to use`,
      isRequired: true,
      format: 'int32',
    },
    searchBase: {
      type: 'string',
      description: `LDAP location to be added to the connection URL`,
      isRequired: true,
    },
    authScheme: {
      type: 'Enum',
      enum: ['NONE', 'SIMPLE', 'DIGEST_MD5', 'CRAM_MD5'],
      isRequired: true,
    },
    authRealm: {
      type: 'string',
      description: `The SASL realm to bind to. Required if authScheme is CRAM_MD5 or DIGEST_MD5`,
    },
    authUsername: {
      type: 'string',
      description: `This must be a fully qualified username if simple authentication is used. Required if authScheme other than none.`,
    },
    connectionTimeoutSeconds: {
      type: 'number',
      description: `How long to wait before timeout`,
      isRequired: true,
      format: 'int32',
      maximum: 3600,
      minimum: 1,
    },
    connectionRetryDelaySeconds: {
      type: 'number',
      description: `How long to wait before retrying`,
      isRequired: true,
      format: 'int32',
      minimum: 0,
    },
    maxIncidentsCount: {
      type: 'number',
      description: `How many retry attempts`,
      isRequired: true,
      format: 'int32',
      minimum: 0,
    },
    userBaseDn: {
      type: 'string',
      description: `The relative DN where user objects are found (e.g. ou=people). This value will have the Search base DN value appended to form the full User search base DN.`,
    },
    userSubtree: {
      type: 'boolean',
      description: `Are users located in structures below the user base DN?`,
    },
    userObjectClass: {
      type: 'string',
      description: `LDAP class for user objects`,
    },
    userLdapFilter: {
      type: 'string',
      description: `LDAP search filter to limit user search`,
    },
    userIdAttribute: {
      type: 'string',
      description: `This is used to find a user given its user ID`,
    },
    userRealNameAttribute: {
      type: 'string',
      description: `This is used to find a real name given the user ID`,
    },
    userEmailAddressAttribute: {
      type: 'string',
      description: `This is used to find an email address given the user ID`,
    },
    userPasswordAttribute: {
      type: 'string',
      description: `If this field is blank the user will be authenticated against a bind with the LDAP server`,
    },
    ldapGroupsAsRoles: {
      type: 'boolean',
      description: `Denotes whether LDAP assigned roles are used as Nexus Repository Manager roles`,
    },
    groupType: {
      type: 'Enum',
      enum: ['static', 'dynamic'],
      isRequired: true,
    },
    groupBaseDn: {
      type: 'string',
      description: `The relative DN where group objects are found (e.g. ou=Group). This value will have the Search base DN value appended to form the full Group search base DN.`,
    },
    groupSubtree: {
      type: 'boolean',
      description: `Are groups located in structures below the group base DN`,
    },
    groupObjectClass: {
      type: 'string',
      description: `LDAP class for group objects. Required if groupType is static`,
      maxLength: 0,
      minLength: 0,
    },
    groupIdAttribute: {
      type: 'string',
      description: `This field specifies the attribute of the Object class that defines the Group ID. Required if groupType is static`,
      maxLength: 0,
      minLength: 0,
    },
    groupMemberAttribute: {
      type: 'string',
      description: `LDAP attribute containing the usernames for the group. Required if groupType is static`,
      maxLength: 0,
      minLength: 0,
    },
    groupMemberFormat: {
      type: 'string',
      description: `The format of user ID stored in the group member attribute. Required if groupType is static`,
      maxLength: 0,
      minLength: 0,
    },
    userMemberOfAttribute: {
      type: 'string',
      description: `Set this to the attribute used to store the attribute which holds groups DN in the user object. Required if groupType is dynamic`,
      maxLength: 0,
      minLength: 0,
    },
    authPassword: {
      type: 'string',
      description: `The password to bind with. Required if authScheme other than none.`,
      isRequired: true,
    },
  },
} as const;

export const $UpdateLdapServerXo = {
  properties: {
    name: {
      type: 'string',
      description: `LDAP server name`,
      isRequired: true,
    },
    protocol: {
      type: 'Enum',
      enum: ['ldap', 'ldaps'],
      isRequired: true,
    },
    useTrustStore: {
      type: 'boolean',
      description: `Whether to use certificates stored in Nexus Repository Manager's truststore`,
    },
    host: {
      type: 'string',
      description: `LDAP server connection hostname`,
      isRequired: true,
    },
    port: {
      type: 'number',
      description: `LDAP server connection port to use`,
      isRequired: true,
      format: 'int32',
    },
    searchBase: {
      type: 'string',
      description: `LDAP location to be added to the connection URL`,
      isRequired: true,
    },
    authScheme: {
      type: 'Enum',
      enum: ['NONE', 'SIMPLE', 'DIGEST_MD5', 'CRAM_MD5'],
      isRequired: true,
    },
    authRealm: {
      type: 'string',
      description: `The SASL realm to bind to. Required if authScheme is CRAM_MD5 or DIGEST_MD5`,
    },
    authUsername: {
      type: 'string',
      description: `This must be a fully qualified username if simple authentication is used. Required if authScheme other than none.`,
    },
    connectionTimeoutSeconds: {
      type: 'number',
      description: `How long to wait before timeout`,
      isRequired: true,
      format: 'int32',
      maximum: 3600,
      minimum: 1,
    },
    connectionRetryDelaySeconds: {
      type: 'number',
      description: `How long to wait before retrying`,
      isRequired: true,
      format: 'int32',
      minimum: 0,
    },
    maxIncidentsCount: {
      type: 'number',
      description: `How many retry attempts`,
      isRequired: true,
      format: 'int32',
      minimum: 0,
    },
    userBaseDn: {
      type: 'string',
      description: `The relative DN where user objects are found (e.g. ou=people). This value will have the Search base DN value appended to form the full User search base DN.`,
    },
    userSubtree: {
      type: 'boolean',
      description: `Are users located in structures below the user base DN?`,
    },
    userObjectClass: {
      type: 'string',
      description: `LDAP class for user objects`,
    },
    userLdapFilter: {
      type: 'string',
      description: `LDAP search filter to limit user search`,
    },
    userIdAttribute: {
      type: 'string',
      description: `This is used to find a user given its user ID`,
    },
    userRealNameAttribute: {
      type: 'string',
      description: `This is used to find a real name given the user ID`,
    },
    userEmailAddressAttribute: {
      type: 'string',
      description: `This is used to find an email address given the user ID`,
    },
    userPasswordAttribute: {
      type: 'string',
      description: `If this field is blank the user will be authenticated against a bind with the LDAP server`,
    },
    ldapGroupsAsRoles: {
      type: 'boolean',
      description: `Denotes whether LDAP assigned roles are used as Nexus Repository Manager roles`,
    },
    groupType: {
      type: 'Enum',
      enum: ['static', 'dynamic'],
      isRequired: true,
    },
    groupBaseDn: {
      type: 'string',
      description: `The relative DN where group objects are found (e.g. ou=Group). This value will have the Search base DN value appended to form the full Group search base DN.`,
    },
    groupSubtree: {
      type: 'boolean',
      description: `Are groups located in structures below the group base DN`,
    },
    groupObjectClass: {
      type: 'string',
      description: `LDAP class for group objects. Required if groupType is static`,
      maxLength: 0,
      minLength: 0,
    },
    groupIdAttribute: {
      type: 'string',
      description: `This field specifies the attribute of the Object class that defines the Group ID. Required if groupType is static`,
      maxLength: 0,
      minLength: 0,
    },
    groupMemberAttribute: {
      type: 'string',
      description: `LDAP attribute containing the usernames for the group. Required if groupType is static`,
      maxLength: 0,
      minLength: 0,
    },
    groupMemberFormat: {
      type: 'string',
      description: `The format of user ID stored in the group member attribute. Required if groupType is static`,
      maxLength: 0,
      minLength: 0,
    },
    userMemberOfAttribute: {
      type: 'string',
      description: `Set this to the attribute used to store the attribute which holds groups DN in the user object. Required if groupType is dynamic`,
      maxLength: 0,
      minLength: 0,
    },
    authPassword: {
      type: 'string',
      description: `The password to bind with. Required if authScheme other than none.`,
      isRequired: true,
    },
    id: {
      type: 'string',
      description: `LDAP server ID`,
    },
  },
} as const;

export const $IqConnectionVerificationXo = {
  properties: {
    success: {
      type: 'boolean',
    },
    reason: {
      type: 'string',
    },
  },
} as const;

export const $IqConnectionXo = {
  properties: {
    enabled: {
      type: 'boolean',
      description: `Whether to use Sonatype Repository Firewall`,
    },
    showLink: {
      type: 'boolean',
      description: `Show Sonatype Repository Firewall link in Browse menu when server is enabled`,
    },
    url: {
      type: 'string',
      description: `The address of your Sonatype Repository Firewall`,
    },
    authenticationType: {
      type: 'Enum',
      enum: ['USER', 'PKI'],
      isRequired: true,
    },
    username: {
      type: 'string',
      description: `User with access to Sonatype Repository Firewall`,
    },
    password: {
      type: 'string',
      description: `Credentials for the Sonatype Repository Firewall User`,
    },
    useTrustStoreForUrl: {
      type: 'boolean',
      description: `Use certificates stored in the Nexus Repository Manager truststore to connect to Sonatype Repository Firewall`,
    },
    timeoutSeconds: {
      type: 'number',
      description: `Seconds to wait for activity before stopping and retrying the connection. Leave blank to use the globally defined HTTP timeout.`,
      format: 'int32',
      maximum: 3600,
      minimum: 1,
    },
    properties: {
      type: 'string',
      description: `Additional properties to configure for Sonatype Repository Firewall`,
    },
  },
} as const;

export const $ApiLicenseDetailsXO = {
  properties: {
    contactEmail: {
      type: 'string',
    },
    contactCompany: {
      type: 'string',
    },
    contactName: {
      type: 'string',
    },
    effectiveDate: {
      type: 'string',
      format: 'date-time',
    },
    expirationDate: {
      type: 'string',
      format: 'date-time',
    },
    licenseType: {
      type: 'string',
    },
    licensedUsers: {
      type: 'string',
    },
    fingerprint: {
      type: 'string',
    },
    features: {
      type: 'string',
    },
  },
} as const;

export const $InputStream = {
  properties: {},
} as const;

export const $GroupDeployAttributes = {
  properties: {
    memberNames: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
    writableMember: {
      type: 'string',
      description: `Pro-only: This field is for the Group Deployment feature available in NXRM Pro.`,
    },
  },
} as const;

export const $SimpleApiGroupDeployRepository = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isReadOnly: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isReadOnly: true,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isReadOnly: true,
      isRequired: true,
    },
    group: {
      type: 'GroupDeployAttributes',
      isReadOnly: true,
      isRequired: true,
    },
  },
} as const;

export const $NpmGroupRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    group: {
      type: 'GroupDeployAttributes',
      isRequired: true,
    },
  },
} as const;

export const $NpmHostedRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'HostedStorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    component: {
      type: 'ComponentAttributes',
    },
  },
} as const;

export const $NpmAttributes = {
  properties: {
    removeNonCataloged: {
      type: 'boolean',
      description: `Remove Non-Cataloged Versions`,
      isRequired: true,
    },
    removeQuarantined: {
      type: 'boolean',
      description: `Remove Quarantined Versions`,
      isRequired: true,
    },
  },
} as const;

export const $NpmProxyApiRepository = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    proxy: {
      type: 'ProxyAttributes',
      isRequired: true,
    },
    negativeCache: {
      type: 'NegativeCacheAttributes',
      isRequired: true,
    },
    httpClient: {
      type: 'HttpClientAttributes',
      isRequired: true,
    },
    routingRuleName: {
      type: 'string',
      description: `The name of the routing rule assigned to this repository`,
    },
    replication: {
      type: 'ReplicationAttributes',
    },
    npm: {
      type: 'NpmAttributes',
    },
  },
} as const;

export const $NpmProxyRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    proxy: {
      type: 'ProxyAttributes',
      isRequired: true,
    },
    negativeCache: {
      type: 'NegativeCacheAttributes',
      isRequired: true,
    },
    httpClient: {
      type: 'HttpClientAttributes',
      isRequired: true,
    },
    routingRule: {
      type: 'string',
    },
    replication: {
      type: 'ReplicationAttributes',
    },
    npm: {
      type: 'NpmAttributes',
    },
  },
} as const;

export const $NugetGroupRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    group: {
      type: 'GroupAttributes',
      isRequired: true,
    },
  },
} as const;

export const $NugetHostedRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'HostedStorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    component: {
      type: 'ComponentAttributes',
    },
  },
} as const;

export const $NugetAttributes = {
  properties: {
    queryCacheItemMaxAge: {
      type: 'number',
      description: `How long to cache query results from the proxied repository (in seconds)`,
      format: 'int32',
    },
    nugetVersion: {
      type: 'Enum',
      enum: ['V2', 'V3'],
    },
  },
} as const;

export const $NugetProxyApiRepository = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    proxy: {
      type: 'ProxyAttributes',
      isRequired: true,
    },
    negativeCache: {
      type: 'NegativeCacheAttributes',
      isRequired: true,
    },
    httpClient: {
      type: 'HttpClientAttributes',
      isRequired: true,
    },
    routingRuleName: {
      type: 'string',
      description: `The name of the routing rule assigned to this repository`,
    },
    replication: {
      type: 'ReplicationAttributes',
    },
    nugetProxy: {
      type: 'NugetAttributes',
      isRequired: true,
    },
  },
} as const;

export const $NugetProxyRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    proxy: {
      type: 'ProxyAttributes',
      isRequired: true,
    },
    negativeCache: {
      type: 'NegativeCacheAttributes',
      isRequired: true,
    },
    httpClient: {
      type: 'HttpClientAttributes',
      isRequired: true,
    },
    routingRule: {
      type: 'string',
    },
    replication: {
      type: 'ReplicationAttributes',
    },
    nugetProxy: {
      type: 'NugetAttributes',
      isRequired: true,
    },
  },
} as const;

export const $RubyGemsGroupRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    group: {
      type: 'GroupAttributes',
      isRequired: true,
    },
  },
} as const;

export const $RubyGemsHostedRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'HostedStorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    component: {
      type: 'ComponentAttributes',
    },
  },
} as const;

export const $RubyGemsProxyRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    proxy: {
      type: 'ProxyAttributes',
      isRequired: true,
    },
    negativeCache: {
      type: 'NegativeCacheAttributes',
      isRequired: true,
    },
    httpClient: {
      type: 'HttpClientAttributes',
      isRequired: true,
    },
    routingRule: {
      type: 'string',
    },
    replication: {
      type: 'ReplicationAttributes',
    },
  },
} as const;

export const $DockerAttributes = {
  properties: {
    v1Enabled: {
      type: 'boolean',
      description: `Whether to allow clients to use the V1 API to interact with this repository`,
      isRequired: true,
    },
    forceBasicAuth: {
      type: 'boolean',
      description: `Whether to force authentication (Docker Bearer Token Realm required if false)`,
      isRequired: true,
    },
    httpPort: {
      type: 'number',
      description: `Create an HTTP connector at specified port`,
      format: 'int32',
    },
    httpsPort: {
      type: 'number',
      description: `Create an HTTPS connector at specified port`,
      format: 'int32',
    },
    subdomain: {
      type: 'string',
      description: `Allows to use subdomain`,
    },
  },
} as const;

export const $DockerGroupApiRepository = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    group: {
      type: 'GroupDeployAttributes',
      isRequired: true,
    },
    docker: {
      type: 'DockerAttributes',
      isRequired: true,
    },
  },
} as const;

export const $DockerGroupRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    group: {
      type: 'GroupDeployAttributes',
      isRequired: true,
    },
    docker: {
      type: 'DockerAttributes',
      isRequired: true,
    },
  },
} as const;

export const $DockerHostedApiRepository = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'HostedStorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    component: {
      type: 'ComponentAttributes',
    },
    docker: {
      type: 'DockerAttributes',
      isRequired: true,
    },
  },
} as const;

export const $DockerHostedRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'DockerHostedStorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    component: {
      type: 'ComponentAttributes',
    },
    docker: {
      type: 'DockerAttributes',
      isRequired: true,
    },
  },
} as const;

export const $DockerHostedStorageAttributes = {
  properties: {
    blobStoreName: {
      type: 'string',
      description: `Blob store used to store repository contents`,
    },
    strictContentTypeValidation: {
      type: 'boolean',
      description: `Whether to validate uploaded content's MIME type appropriate for the repository format`,
      isRequired: true,
    },
    writePolicy: {
      type: 'Enum',
      enum: ['allow', 'allow_once', 'deny'],
      isRequired: true,
    },
    latestPolicy: {
      type: 'boolean',
      description: `Whether to allow redeploying the 'latest' tag but defer to the Deployment Policy for all other tags`,
    },
  },
} as const;

export const $DockerProxyApiRepository = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    proxy: {
      type: 'ProxyAttributes',
      isRequired: true,
    },
    negativeCache: {
      type: 'NegativeCacheAttributes',
      isRequired: true,
    },
    httpClient: {
      type: 'HttpClientAttributes',
      isRequired: true,
    },
    routingRuleName: {
      type: 'string',
      description: `The name of the routing rule assigned to this repository`,
    },
    replication: {
      type: 'ReplicationAttributes',
    },
    docker: {
      type: 'DockerAttributes',
      isRequired: true,
    },
    dockerProxy: {
      type: 'DockerProxyAttributes',
      isRequired: true,
    },
  },
} as const;

export const $DockerProxyAttributes = {
  properties: {
    indexType: {
      type: 'Enum',
      enum: ['HUB', 'REGISTRY', 'CUSTOM'],
    },
    indexUrl: {
      type: 'string',
      description: `Url of Docker Index to use`,
    },
    cacheForeignLayers: {
      type: 'boolean',
      description: `Allow Nexus Repository Manager to download and cache foreign layers`,
    },
    foreignLayerUrlWhitelist: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
  },
} as const;

export const $DockerProxyRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    proxy: {
      type: 'ProxyAttributes',
      isRequired: true,
    },
    negativeCache: {
      type: 'NegativeCacheAttributes',
      isRequired: true,
    },
    httpClient: {
      type: 'HttpClientAttributes',
      isRequired: true,
    },
    routingRule: {
      type: 'string',
    },
    replication: {
      type: 'ReplicationAttributes',
    },
    docker: {
      type: 'DockerAttributes',
      isRequired: true,
    },
    dockerProxy: {
      type: 'DockerProxyAttributes',
      isRequired: true,
    },
  },
} as const;

export const $YumGroupRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    group: {
      type: 'GroupAttributes',
      isRequired: true,
    },
    yumSigning: {
      type: 'YumSigningRepositoriesAttributes',
    },
  },
} as const;

export const $YumSigningRepositoriesAttributes = {
  properties: {
    keypair: {
      type: 'string',
      description: `PGP signing key pair (armored private key e.g. gpg --export-secret-key --armor)`,
    },
    passphrase: {
      type: 'string',
      description: `Passphrase to access PGP signing key`,
    },
  },
} as const;

export const $YumAttributes = {
  properties: {
    repodataDepth: {
      type: 'number',
      description: `Specifies the repository depth where repodata folder(s) are created`,
      isRequired: true,
      format: 'int32',
      maximum: 5,
      minimum: 0,
    },
    deployPolicy: {
      type: 'Enum',
      enum: ['PERMISSIVE', 'STRICT'],
    },
  },
} as const;

export const $YumHostedApiRepository = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'HostedStorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    component: {
      type: 'ComponentAttributes',
    },
    yum: {
      type: 'YumAttributes',
      isRequired: true,
    },
  },
} as const;

export const $YumHostedRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'HostedStorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    component: {
      type: 'ComponentAttributes',
    },
    yum: {
      type: 'YumAttributes',
      isRequired: true,
    },
  },
} as const;

export const $YumProxyRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    proxy: {
      type: 'ProxyAttributes',
      isRequired: true,
    },
    negativeCache: {
      type: 'NegativeCacheAttributes',
      isRequired: true,
    },
    httpClient: {
      type: 'HttpClientAttributes',
      isRequired: true,
    },
    routingRule: {
      type: 'string',
    },
    replication: {
      type: 'ReplicationAttributes',
    },
    yumSigning: {
      type: 'YumSigningRepositoriesAttributes',
    },
  },
} as const;

export const $AzureConnectionXO = {
  properties: {
    accountName: {
      type: 'string',
    },
    accountKey: {
      type: 'string',
    },
    containerName: {
      type: 'string',
    },
    authenticationMethod: {
      type: 'string',
    },
  },
} as const;

export const $AzureBlobStoreApiAuthentication = {
  properties: {
    authenticationMethod: {
      type: 'Enum',
      enum: ['ACCOUNTKEY', 'MANAGEDIDENTITY', 'ENVIRONMENTVARIABLE'],
      isRequired: true,
    },
    accountKey: {
      type: 'string',
      description: `The account key.`,
    },
  },
} as const;

export const $AzureBlobStoreApiBucketConfiguration = {
  properties: {
    accountName: {
      type: 'string',
      description: `Account name found under Access keys for the storage account.`,
      isRequired: true,
    },
    containerName: {
      type: 'string',
      description: `The name of an existing container to be used for storage.`,
      isRequired: true,
      pattern: '^[a-z0-9][a-z0-9-]{2,62}$',
    },
    authentication: {
      type: 'AzureBlobStoreApiAuthentication',
      description: `The Azure specific authentication details.`,
      isRequired: true,
    },
  },
} as const;

export const $AzureBlobStoreApiModel = {
  properties: {
    name: {
      type: 'string',
      description: `The name of the Azure blob store.`,
      isRequired: true,
    },
    softQuota: {
      type: 'BlobStoreApiSoftQuota',
      description: `Settings to control the soft quota.`,
    },
    bucketConfiguration: {
      type: 'AzureBlobStoreApiBucketConfiguration',
      description: `The Azure specific configuration details for the Azure object that'll contain the blob store.`,
      isRequired: true,
    },
  },
} as const;

export const $HelmHostedRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'HostedStorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    component: {
      type: 'ComponentAttributes',
    },
  },
} as const;

export const $HelmProxyRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    proxy: {
      type: 'ProxyAttributes',
      isRequired: true,
    },
    negativeCache: {
      type: 'NegativeCacheAttributes',
      isRequired: true,
    },
    httpClient: {
      type: 'HttpClientAttributes',
      isRequired: true,
    },
    routingRule: {
      type: 'string',
    },
    replication: {
      type: 'ReplicationAttributes',
    },
  },
} as const;

export const $GitLfsHostedRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'HostedStorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    component: {
      type: 'ComponentAttributes',
    },
  },
} as const;

export const $PypiGroupRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    group: {
      type: 'GroupAttributes',
      isRequired: true,
    },
  },
} as const;

export const $PypiHostedRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'HostedStorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    component: {
      type: 'ComponentAttributes',
    },
  },
} as const;

export const $PypiProxyRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    proxy: {
      type: 'ProxyAttributes',
      isRequired: true,
    },
    negativeCache: {
      type: 'NegativeCacheAttributes',
      isRequired: true,
    },
    httpClient: {
      type: 'HttpClientAttributes',
      isRequired: true,
    },
    routingRule: {
      type: 'string',
    },
    replication: {
      type: 'ReplicationAttributes',
    },
  },
} as const;

export const $CondaProxyRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    proxy: {
      type: 'ProxyAttributes',
      isRequired: true,
    },
    negativeCache: {
      type: 'NegativeCacheAttributes',
      isRequired: true,
    },
    httpClient: {
      type: 'HttpClientAttributes',
      isRequired: true,
    },
    routingRule: {
      type: 'string',
    },
    replication: {
      type: 'ReplicationAttributes',
    },
  },
} as const;

export const $ConanProxyRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    proxy: {
      type: 'ProxyAttributes',
      isRequired: true,
    },
    negativeCache: {
      type: 'NegativeCacheAttributes',
      isRequired: true,
    },
    httpClient: {
      type: 'HttpClientAttributes',
      isRequired: true,
    },
    routingRule: {
      type: 'string',
    },
    replication: {
      type: 'ReplicationAttributes',
    },
  },
} as const;

export const $RGroupRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    group: {
      type: 'GroupAttributes',
      isRequired: true,
    },
  },
} as const;

export const $RHostedRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'HostedStorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    component: {
      type: 'ComponentAttributes',
    },
  },
} as const;

export const $RProxyRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    proxy: {
      type: 'ProxyAttributes',
      isRequired: true,
    },
    negativeCache: {
      type: 'NegativeCacheAttributes',
      isRequired: true,
    },
    httpClient: {
      type: 'HttpClientAttributes',
      isRequired: true,
    },
    routingRule: {
      type: 'string',
    },
    replication: {
      type: 'ReplicationAttributes',
    },
  },
} as const;

export const $CocoapodsProxyRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    proxy: {
      type: 'ProxyAttributes',
      isRequired: true,
    },
    negativeCache: {
      type: 'NegativeCacheAttributes',
      isRequired: true,
    },
    httpClient: {
      type: 'HttpClientAttributes',
      isRequired: true,
    },
    routingRule: {
      type: 'string',
    },
    replication: {
      type: 'ReplicationAttributes',
    },
  },
} as const;

export const $GolangGroupRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    group: {
      type: 'GroupAttributes',
      isRequired: true,
    },
  },
} as const;

export const $GolangProxyRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    proxy: {
      type: 'ProxyAttributes',
      isRequired: true,
    },
    negativeCache: {
      type: 'NegativeCacheAttributes',
      isRequired: true,
    },
    httpClient: {
      type: 'HttpClientAttributes',
      isRequired: true,
    },
    routingRule: {
      type: 'string',
    },
    replication: {
      type: 'ReplicationAttributes',
    },
  },
} as const;

export const $P2ProxyRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    proxy: {
      type: 'ProxyAttributes',
      isRequired: true,
    },
    negativeCache: {
      type: 'NegativeCacheAttributes',
      isRequired: true,
    },
    httpClient: {
      type: 'HttpClientAttributes',
      isRequired: true,
    },
    routingRule: {
      type: 'string',
    },
    replication: {
      type: 'ReplicationAttributes',
    },
  },
} as const;

export const $BowerGroupRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    group: {
      type: 'GroupAttributes',
      isRequired: true,
    },
  },
} as const;

export const $BowerHostedRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'HostedStorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    component: {
      type: 'ComponentAttributes',
    },
  },
} as const;

export const $BowerAttributes = {
  properties: {
    rewritePackageUrls: {
      type: 'boolean',
      description: `Whether to force Bower to retrieve packages through this proxy repository`,
      isRequired: true,
    },
  },
} as const;

export const $BowerProxyApiRepository = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    proxy: {
      type: 'ProxyAttributes',
      isRequired: true,
    },
    negativeCache: {
      type: 'NegativeCacheAttributes',
      isRequired: true,
    },
    httpClient: {
      type: 'HttpClientAttributes',
      isRequired: true,
    },
    routingRuleName: {
      type: 'string',
      description: `The name of the routing rule assigned to this repository`,
    },
    replication: {
      type: 'ReplicationAttributes',
    },
    bower: {
      type: 'BowerAttributes',
    },
  },
} as const;

export const $BowerProxyRepositoryApiRequest = {
  properties: {
    name: {
      type: 'string',
      description: `A unique identifier for this repository`,
      isRequired: true,
      pattern: '^[a-zA-Z0-9\\-]{1}[a-zA-Z0-9_\\-\\.]*$',
    },
    online: {
      type: 'boolean',
      description: `Whether this repository accepts incoming requests`,
      isRequired: true,
    },
    storage: {
      type: 'StorageAttributes',
      isRequired: true,
    },
    cleanup: {
      type: 'CleanupPolicyAttributes',
    },
    proxy: {
      type: 'ProxyAttributes',
      isRequired: true,
    },
    negativeCache: {
      type: 'NegativeCacheAttributes',
      isRequired: true,
    },
    httpClient: {
      type: 'HttpClientAttributes',
      isRequired: true,
    },
    routingRule: {
      type: 'string',
    },
    replication: {
      type: 'ReplicationAttributes',
    },
    bower: {
      type: 'BowerAttributes',
    },
  },
} as const;
