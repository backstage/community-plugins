export type AnonymousAccessSettingsXO = {
  /**
   * Whether or not Anonymous Access is enabled
   */
  enabled?: boolean;
  /**
   * The username of the anonymous account
   */
  userId?: string;
  /**
   * The name of the authentication realm for the anonymous account
   */
  realmName?: string;
};

export type ApiUserSource = {
  id?: string;
  name?: string;
};

export type ApiUser = {
  /**
   * The userid which is required for login. This value cannot be changed.
   */
  userId?: string;
  /**
   * The first name of the user.
   */
  firstName?: string;
  /**
   * The last name of the user.
   */
  lastName?: string;
  /**
   * The email address associated with the user.
   */
  emailAddress?: string;
  /**
   * The user source which is the origin of this user. This value cannot be changed.
   */
  source?: string;
  /**
   * The user's status, e.g. active or disabled.
   */
  status: 'active' | 'locked' | 'disabled' | 'changepassword';
  /**
   * Indicates whether the user's properties could be modified by the Nexus Repository Manager. When false only roles are considered during update.
   */
  readOnly?: boolean;
  /**
   * The roles which the user has been assigned within Nexus.
   */
  roles?: Array<string>;
  /**
   * The roles which the user has been assigned in an external source, e.g. LDAP group. These cannot be changed within the Nexus Repository Manager.
   */
  externalRoles?: Array<string>;
};

export type ApiCreateUser = {
  /**
   * The userid which is required for login. This value cannot be changed.
   */
  userId?: string;
  /**
   * The first name of the user.
   */
  firstName?: string;
  /**
   * The last name of the user.
   */
  lastName?: string;
  /**
   * The email address associated with the user.
   */
  emailAddress?: string;
  /**
   * The password for the new user.
   */
  password?: string;
  /**
   * The user's status, e.g. active or disabled.
   */
  status: 'active' | 'locked' | 'disabled' | 'changepassword';
  /**
   * The roles which the user has been assigned within Nexus.
   */
  roles?: Array<string>;
};

export type ApiPrivilege = {
  /**
   * The type of privilege, each type covers different portions of the system. External values supplied to this will be ignored by the system.
   */
  type?: string;
  /**
   * The name of the privilege.  This value cannot be changed.
   */
  name?: string;
  description?: string;
  /**
   * Indicates whether the privilege can be changed. External values supplied to this will be ignored by the system.
   */
  readOnly?: boolean;
};

export type ApiPrivilegeWildcardRequest = {
  /**
   * The name of the privilege.  This value cannot be changed.
   */
  name?: string;
  description?: string;
  /**
   * A colon separated list of parts that create a permission string.
   */
  pattern?: string;
};

export type ApiPrivilegeApplicationRequest = {
  /**
   * The name of the privilege.  This value cannot be changed.
   */
  name?: string;
  description?: string;
  /**
   * A collection of actions to associate with the privilege, using BREAD syntax (browse,read,edit,add,delete,all) as well as 'run' for script privileges.
   */
  actions?: Array<
    | 'READ'
    | 'BROWSE'
    | 'EDIT'
    | 'ADD'
    | 'DELETE'
    | 'RUN'
    | 'ASSOCIATE'
    | 'DISASSOCIATE'
    | 'ALL'
  >;
  /**
   * The domain (i.e. 'blobstores', 'capabilities' or even '*' for all) that this privilege is granting access to.  Note that creating new privileges with a domain is only necessary when using plugins that define their own domain(s).
   */
  domain?: string;
};

export type RealmApiXO = {
  id?: string;
  name?: string;
};

export type RoleXOResponse = {
  /**
   * The id of the role.
   */
  id?: string;
  /**
   * The user source which is the origin of this role.
   */
  source?: string;
  /**
   * The name of the role.
   */
  name?: string;
  /**
   * The description of this role.
   */
  description?: string;
  /**
   * Indicates whether the role can be changed. The system will ignore any supplied external values.
   */
  readOnly?: boolean;
  /**
   * The list of privileges assigned to this role.
   */
  privileges?: Array<string>;
  /**
   * The list of roles assigned to this role.
   */
  roles?: Array<string>;
};

export type RoleXORequest = {
  /**
   * The id of the role.
   */
  id?: string;
  /**
   * The name of the role.
   */
  name?: string;
  /**
   * The description of this role.
   */
  description?: string;
  /**
   * The list of privileges assigned to this role.
   */
  privileges?: Array<string>;
  /**
   * The list of roles assigned to this role.
   */
  roles?: Array<string>;
};

export type Page = {
  items?: Array<unknown>;
  continuationToken?: string;
};

export type PageTaskXO = {
  items?: Array<TaskXO>;
  continuationToken?: string;
};

export type TaskXO = {
  id?: string;
  name?: string;
  type?: string;
  message?: string;
  currentState?: string;
  lastRunResult?: string;
  nextRun?: string;
  lastRun?: string;
};

export type BlobStoreQuotaResultXO = {
  isViolation?: boolean;
  message?: string;
  blobStoreName?: string;
};

export type BlobStoreApiSoftQuota = {
  /**
   * The type to use such as spaceRemainingQuota, or spaceUsedQuota
   */
  type?: 'spaceRemainingQuota' | 'spaceUsedQuota';
  /**
   * The limit in MB.
   */
  limit?: number;
};

export type GenericBlobStoreApiResponse = {
  /**
   * Settings to control the soft quota
   */
  softQuota?: BlobStoreApiSoftQuota;
  name?: string;
  type?: string;
  unavailable?: boolean;
  blobCount?: number;
  totalSizeInBytes?: number;
  availableSpaceInBytes?: number;
};

export type FileBlobStoreApiCreateRequest = {
  /**
   * Settings to control the soft quota
   */
  softQuota?: BlobStoreApiSoftQuota;
  /**
   * The path to the blobstore contents. This can be an absolute path to anywhere on the system Nexus Repository Manager has access to or it can be a path relative to the sonatype-work directory.
   */
  path?: string;
  name?: string;
};

export type FileBlobStoreApiUpdateRequest = {
  /**
   * Settings to control the soft quota
   */
  softQuota?: BlobStoreApiSoftQuota;
  /**
   * The path to the blobstore contents. This can be an absolute path to anywhere on the system Nexus Repository Manager has access to or it can be a path relative to the sonatype-work directory.
   */
  path?: string;
};

export type FileBlobStoreApiModel = {
  /**
   * Settings to control the soft quota
   */
  softQuota?: BlobStoreApiSoftQuota;
  /**
   * The path to the blobstore contents. This can be an absolute path to anywhere on the system Nexus Repository Manager has access to or it can be a path relative to the sonatype-work directory.
   */
  path?: string;
};

export type ReadOnlyState = {
  systemInitiated?: boolean;
  summaryReason?: string;
  frozen?: boolean;
};

export type ApiCertificate = {
  expiresOn?: number;
  fingerprint?: string;
  id?: string;
  issuedOn?: number;
  issuerCommonName?: string;
  issuerOrganization?: string;
  issuerOrganizationalUnit?: string;
  pem?: string;
  serialNumber?: string;
  subjectCommonName?: string;
  subjectOrganization?: string;
  subjectOrganizationalUnit?: string;
};

export type AssetXO = {
  downloadUrl?: string;
  path?: string;
  id?: string;
  repository?: string;
  format?: string;
  checksum?: Record<string, unknown>;
  contentType?: string;
  lastModified?: string;
  lastDownloaded?: string;
  uploader?: string;
  uploaderIp?: string;
  fileSize?: number;
};

export type PageAssetXO = {
  items?: Array<AssetXO>;
  continuationToken?: string;
};

export type ComponentXO = {
  id?: string;
  repository?: string;
  format?: string;
  group?: string;
  name?: string;
  version?: string;
  assets?: Array<AssetXO>;
};

export type PageComponentXO = {
  items?: Array<ComponentXO>;
  continuationToken?: string;
};

export type AbstractApiRepository = {
  /**
   * A unique identifier for this repository
   */
  name?: string;
  /**
   * Component format held in this repository
   */
  format?: string;
  /**
   * Controls if deployments of and updates to artifacts are allowed
   */
  type?: 'hosted' | 'proxy' | 'group';
  /**
   * URL to the repository
   */
  url?: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
};

export type ContentSelectorApiResponse = {
  /**
   * The content selector name cannot be changed after creation
   */
  name?: string;
  /**
   * The type of content selector the backend is using
   */
  type?: 'csel' | 'jexl';
  /**
   * A human-readable description
   */
  description?: string;
  /**
   * The expression used to identify content
   */
  expression?: string;
};

export type ContentSelectorApiCreateRequest = {
  /**
   * The content selector name cannot be changed after creation
   */
  name?: string;
  /**
   * A human-readable description
   */
  description?: string;
  /**
   * The expression used to identify content
   */
  expression?: string;
};

export type ContentSelectorApiUpdateRequest = {
  /**
   * An optional description of this content selector
   */
  description?: string;
  /**
   * The expression used to identify content
   */
  expression?: string;
};

export type RepositoryXO = {
  name?: string;
  format?: string;
  type?: string;
  url?: string;
  attributes?: Record<string, unknown>;
};

export type RoutingRuleXO = {
  name?: string;
  description?: string;
  /**
   * Determines what should be done with requests when their path matches any of the matchers
   */
  mode?: 'BLOCK' | 'ALLOW';
  /**
   * Regular expressions used to identify request paths that are allowed or blocked (depending on mode)
   */
  matchers?: Array<string>;
};

export type UploadDefinitionXO = {
  format?: string;
  multipleUpload?: boolean;
  componentFields?: Array<UploadFieldDefinitionXO>;
  assetFields?: Array<UploadFieldDefinitionXO>;
};

export type UploadFieldDefinitionXO = {
  name?: string;
  type?: string;
  description?: string;
  optional?: boolean;
  group?: string;
};

export type ApiPrivilegeRepositoryContentSelectorRequest = {
  /**
   * The name of the privilege.  This value cannot be changed.
   */
  name?: string;
  description?: string;
  /**
   * A collection of actions to associate with the privilege, using BREAD syntax (browse,read,edit,add,delete,all) as well as 'run' for script privileges.
   */
  actions?: Array<
    | 'READ'
    | 'BROWSE'
    | 'EDIT'
    | 'ADD'
    | 'DELETE'
    | 'RUN'
    | 'ASSOCIATE'
    | 'DISASSOCIATE'
    | 'ALL'
  >;
  /**
   * The repository format (i.e 'nuget', 'npm') this privilege will grant access to (or * for all).
   */
  format?: string;
  /**
   * The name of the repository this privilege will grant access to (or * for all).
   */
  repository?: string;
  /**
   * The name of a content selector that will be used to grant access to content via this privilege.
   */
  contentSelector?: string;
};

export type ApiPrivilegeRepositoryAdminRequest = {
  /**
   * The name of the privilege.  This value cannot be changed.
   */
  name?: string;
  description?: string;
  /**
   * A collection of actions to associate with the privilege, using BREAD syntax (browse,read,edit,add,delete,all) as well as 'run' for script privileges.
   */
  actions?: Array<
    | 'READ'
    | 'BROWSE'
    | 'EDIT'
    | 'ADD'
    | 'DELETE'
    | 'RUN'
    | 'ASSOCIATE'
    | 'DISASSOCIATE'
    | 'ALL'
  >;
  /**
   * The repository format (i.e 'nuget', 'npm') this privilege will grant access to (or * for all).
   */
  format?: string;
  /**
   * The name of the repository this privilege will grant access to (or * for all).
   */
  repository?: string;
};

export type ApiPrivilegeRepositoryViewRequest = {
  /**
   * The name of the privilege.  This value cannot be changed.
   */
  name?: string;
  description?: string;
  /**
   * A collection of actions to associate with the privilege, using BREAD syntax (browse,read,edit,add,delete,all) as well as 'run' for script privileges.
   */
  actions?: Array<
    | 'READ'
    | 'BROWSE'
    | 'EDIT'
    | 'ADD'
    | 'DELETE'
    | 'RUN'
    | 'ASSOCIATE'
    | 'DISASSOCIATE'
    | 'ALL'
  >;
  /**
   * The repository format (i.e 'nuget', 'npm') this privilege will grant access to (or * for all).
   */
  format?: string;
  /**
   * The name of the repository this privilege will grant access to (or * for all).
   */
  repository?: string;
};

export type GroupAttributes = {
  /**
   * Member repositories' names
   */
  memberNames?: Array<string>;
};

export type MavenGroupRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  group: GroupAttributes;
};

export type StorageAttributes = {
  /**
   * Blob store used to store repository contents
   */
  blobStoreName?: string;
  /**
   * Whether to validate uploaded content's MIME type appropriate for the repository format
   */
  strictContentTypeValidation: boolean;
};

export type SimpleApiGroupRepository = {
  /**
   * A unique identifier for this repository
   */
  name?: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  group: GroupAttributes;
};

export type CleanupPolicyAttributes = {
  /**
   * Components that match any of the applied policies will be deleted
   */
  policyNames?: Array<string>;
};

export type ComponentAttributes = {
  /**
   * Components in this repository count as proprietary for namespace conflict attacks (requires Sonatype Nexus Firewall)
   */
  proprietaryComponents?: boolean;
};

export type HostedStorageAttributes = {
  /**
   * Blob store used to store repository contents
   */
  blobStoreName?: string;
  /**
   * Whether to validate uploaded content's MIME type appropriate for the repository format
   */
  strictContentTypeValidation: boolean;
  /**
   * Controls if deployments of and updates to assets are allowed
   */
  writePolicy: 'allow' | 'allow_once' | 'deny';
};

export type MavenAttributes = {
  /**
   * What type of artifacts does this repository store?
   */
  versionPolicy?: 'RELEASE' | 'SNAPSHOT' | 'MIXED';
  /**
   * Validate that all paths are maven artifact or metadata paths
   */
  layoutPolicy?: 'STRICT' | 'PERMISSIVE';
  /**
   * Content Disposition
   */
  contentDisposition?: 'INLINE' | 'ATTACHMENT';
};

export type MavenHostedApiRepository = {
  /**
   * A unique identifier for this repository
   */
  name?: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: HostedStorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  component?: ComponentAttributes;
  maven: MavenAttributes;
};

export type MavenHostedRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: HostedStorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  component?: ComponentAttributes;
  maven: MavenAttributes;
};

export type HttpClientAttributes = {
  /**
   * Whether to block outbound connections on the repository
   */
  blocked: boolean;
  /**
   * Whether to auto-block outbound connections if remote peer is detected as unreachable/unresponsive
   */
  autoBlock: boolean;
  connection?: HttpClientConnectionAttributes;
  authentication?: HttpClientConnectionAuthenticationAttributes;
};

export type HttpClientConnectionAttributes = {
  /**
   * Total retries if the initial connection attempt suffers a timeout
   */
  retries?: number;
  /**
   * Custom fragment to append to User-Agent header in HTTP requests
   */
  userAgentSuffix?: string;
  /**
   * Seconds to wait for activity before stopping and retrying the connection
   */
  timeout?: number;
  /**
   * Whether to enable redirects to the same location (may be required by some servers)
   */
  enableCircularRedirects?: boolean;
  /**
   * Whether to allow cookies to be stored and used
   */
  enableCookies?: boolean;
  /**
   * Use certificates stored in the Nexus Repository Manager truststore to connect to external systems
   */
  useTrustStore?: boolean;
};

export type HttpClientConnectionAuthenticationAttributes = {
  /**
   * Authentication type
   */
  type?: 'username' | 'ntlm';
  username?: string;
  password?: string;
  ntlmHost?: string;
  ntlmDomain?: string;
};

export type MavenProxyApiRepository = {
  /**
   * A unique identifier for this repository
   */
  name?: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  proxy: ProxyAttributes;
  negativeCache: NegativeCacheAttributes;
  httpClient: HttpClientAttributes;
  /**
   * The name of the routing rule assigned to this repository
   */
  routingRuleName?: string;
  replication?: ReplicationAttributes;
  maven: MavenAttributes;
};

export type NegativeCacheAttributes = {
  /**
   * Whether to cache responses for content not present in the proxied repository
   */
  enabled: boolean;
  /**
   * How long to cache the fact that a file was not found in the repository (in minutes)
   */
  timeToLive: number;
};

export type ProxyAttributes = {
  /**
   * Location of the remote repository being proxied
   */
  remoteUrl?: string;
  /**
   * How long to cache artifacts before rechecking the remote repository (in minutes)
   */
  contentMaxAge: number;
  /**
   * How long to cache metadata before rechecking the remote repository (in minutes)
   */
  metadataMaxAge: number;
};

export type ReplicationAttributes = {
  /**
   * Whether pre-emptive pull is enabled
   */
  preemptivePullEnabled: boolean;
  /**
   * Regular Expression of Asset Paths to pull pre-emptively pull
   */
  assetPathRegex?: string;
};

export type HttpClientAttributesWithPreemptiveAuth = {
  /**
   * Whether to block outbound connections on the repository
   */
  blocked: boolean;
  /**
   * Whether to auto-block outbound connections if remote peer is detected as unreachable/unresponsive
   */
  autoBlock: boolean;
  connection?: HttpClientConnectionAttributes;
  authentication?: HttpClientConnectionAuthenticationAttributesWithPreemptive;
};

export type HttpClientConnectionAuthenticationAttributesWithPreemptive = {
  /**
   * Authentication type
   */
  type?: 'username' | 'ntlm';
  username?: string;
  password?: string;
  ntlmHost?: string;
  ntlmDomain?: string;
  /**
   * Whether to use pre-emptive authentication. Use with caution. Defaults to false.
   */
  preemptive?: boolean;
};

export type MavenProxyRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  proxy: ProxyAttributes;
  negativeCache: NegativeCacheAttributes;
  httpClient: HttpClientAttributesWithPreemptiveAuth;
  routingRule?: string;
  replication?: ReplicationAttributes;
  maven: MavenAttributes;
};

export type ApiPrivilegeScriptRequest = {
  /**
   * The name of the privilege.  This value cannot be changed.
   */
  name?: string;
  description?: string;
  /**
   * A collection of actions to associate with the privilege, using BREAD syntax (browse,read,edit,add,delete,all) as well as 'run' for script privileges.
   */
  actions?: Array<
    | 'READ'
    | 'BROWSE'
    | 'EDIT'
    | 'ADD'
    | 'DELETE'
    | 'RUN'
    | 'ASSOCIATE'
    | 'DISASSOCIATE'
    | 'ALL'
  >;
  /**
   * The name of a script to give access to.
   */
  scriptName?: string;
};

export type ScriptXO = {
  name?: string;
  content?: string;
  type?: string;
};

export type ScriptResultXO = {
  name?: string;
  result?: string;
};

export type S3BlobStoreApiAdvancedBucketConnection = {
  /**
   * A custom endpoint URL for third party object stores using the S3 API.
   */
  endpoint?: string;
  /**
   * An API signature version which may be required for third party object stores using the S3 API.
   */
  signerType?: string;
  /**
   * Setting this flag will result in path-style access being used for all requests.
   */
  forcePathStyle?: boolean;
  /**
   * Setting this value will override the default connection pool size of Nexus of the s3 client for this blobstore.
   */
  maxConnectionPoolSize?: number;
};

export type S3BlobStoreApiBucket = {
  /**
   * The AWS region to create a new S3 bucket in or an existing S3 bucket's region
   */
  region: string;
  /**
   * The name of the S3 bucket
   */
  name: string;
  /**
   * The S3 blob store (i.e S3 object) key prefix
   */
  prefix?: string;
  /**
   * How many days until deleted blobs are finally removed from the S3 bucket (-1 to disable)
   */
  expiration: number;
};

export type S3BlobStoreApiBucketConfiguration = {
  /**
   * Details of the S3 bucket such as name and region
   */
  readonly bucket: S3BlobStoreApiBucket;
  /**
   * The type of encryption to use if any
   */
  readonly encryption?: S3BlobStoreApiEncryption;
  /**
   * Security details for granting access the S3 API
   */
  bucketSecurity?: S3BlobStoreApiBucketSecurity;
  /**
   * A custom endpoint URL, signer type and whether path style access is enabled
   */
  advancedBucketConnection?: S3BlobStoreApiAdvancedBucketConnection;
};

export type S3BlobStoreApiBucketSecurity = {
  /**
   * An IAM access key ID for granting access to the S3 bucket
   */
  accessKeyId?: string;
  /**
   * The secret access key associated with the specified IAM access key ID
   */
  secretAccessKey?: string;
  /**
   * An IAM role to assume in order to access the S3 bucket
   */
  role?: string;
  /**
   * An AWS STS session token associated with temporary security credentials which grant access to the S3 bucket
   */
  sessionToken?: string;
};

export type S3BlobStoreApiEncryption = {
  /**
   * The type of S3 server side encryption to use.
   */
  encryptionType?: 's3ManagedEncryption' | 'kmsManagedEncryption';
  /**
   * The encryption key.
   */
  encryptionKey?: string;
};

export type S3BlobStoreApiModel = {
  /**
   * The name of the S3 blob store.
   */
  name: string;
  /**
   * Settings to control the soft quota.
   */
  softQuota?: BlobStoreApiSoftQuota;
  /**
   * The S3 specific configuration details for the S3 object that'll contain the blob store.
   */
  bucketConfiguration: S3BlobStoreApiBucketConfiguration;
  /**
   * The blob store type.
   */
  readonly type?: string;
};

export type AptHostedApiRepository = {
  /**
   * A unique identifier for this repository
   */
  name?: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: HostedStorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  component?: ComponentAttributes;
  apt: AptHostedRepositoriesAttributes;
  aptSigning: AptSigningRepositoriesAttributes;
};

export type AptHostedRepositoriesAttributes = {
  /**
   * Distribution to fetch
   */
  distribution?: string;
};

export type AptSigningRepositoriesAttributes = {
  /**
   * PGP signing key pair (armored private key e.g. gpg --export-secret-key --armor)
   */
  keypair?: string;
  /**
   * Passphrase to access PGP signing key
   */
  passphrase?: string;
};

export type AptHostedRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: HostedStorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  component?: ComponentAttributes;
  apt: AptHostedRepositoriesAttributes;
  aptSigning: AptSigningRepositoriesAttributes;
};

export type AptProxyApiRepository = {
  /**
   * A unique identifier for this repository
   */
  name?: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  proxy: ProxyAttributes;
  negativeCache: NegativeCacheAttributes;
  httpClient: HttpClientAttributes;
  /**
   * The name of the routing rule assigned to this repository
   */
  routingRuleName?: string;
  replication?: ReplicationAttributes;
  apt: AptProxyRepositoriesAttributes;
};

export type AptProxyRepositoriesAttributes = {
  /**
   * Distribution to fetch
   */
  distribution?: string;
  /**
   * Whether this repository is flat
   */
  flat: boolean;
};

export type AptProxyRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  proxy: ProxyAttributes;
  negativeCache: NegativeCacheAttributes;
  httpClient: HttpClientAttributes;
  routingRule?: string;
  replication?: ReplicationAttributes;
  apt: AptProxyRepositoriesAttributes;
};

export type RawAttributes = {
  /**
   * Content Disposition
   */
  contentDisposition?: 'INLINE' | 'ATTACHMENT';
};

export type RawGroupRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  group: GroupAttributes;
  raw?: RawAttributes;
};

export type RawHostedRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: HostedStorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  component?: ComponentAttributes;
  raw?: RawAttributes;
};

export type SimpleApiHostedRepository = {
  /**
   * A unique identifier for this repository
   */
  name?: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: HostedStorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  component?: ComponentAttributes;
};

export type RawProxyRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  proxy: ProxyAttributes;
  negativeCache: NegativeCacheAttributes;
  httpClient: HttpClientAttributes;
  routingRule?: string;
  replication?: ReplicationAttributes;
  raw?: RawAttributes;
};

export type SimpleApiProxyRepository = {
  /**
   * A unique identifier for this repository
   */
  name?: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  proxy: ProxyAttributes;
  negativeCache: NegativeCacheAttributes;
  httpClient: HttpClientAttributes;
  /**
   * The name of the routing rule assigned to this repository
   */
  routingRuleName?: string;
  replication?: ReplicationAttributes;
};

export type ApiEmailConfiguration = {
  enabled?: boolean;
  host?: string;
  port: number;
  username?: string;
  password?: string;
  fromAddress?: string;
  /**
   * A prefix to add to all email subjects to aid in identifying automated emails
   */
  subjectPrefix?: string;
  /**
   * Enable STARTTLS Support for Insecure Connections
   */
  startTlsEnabled?: boolean;
  /**
   * Require STARTTLS Support
   */
  startTlsRequired?: boolean;
  /**
   * Enable SSL/TLS Encryption upon Connection
   */
  sslOnConnectEnabled?: boolean;
  /**
   * Verify the server certificate when using TLS or SSL
   */
  sslServerIdentityCheckEnabled?: boolean;
  /**
   * Use the Nexus Repository Manager's certificate truststore
   */
  nexusTrustStoreEnabled?: boolean;
};

export type ApiEmailValidation = {
  success?: boolean;
  reason?: string;
};

export type Result = {
  healthy?: boolean;
  message?: string;
  error?: Throwable;
  details?: Record<string, unknown>;
  time?: number;
  duration?: number;
  timestamp?: string;
};

export type StackTraceElement = {
  methodName?: string;
  fileName?: string;
  lineNumber?: number;
  className?: string;
  nativeMethod?: boolean;
};

export type Throwable = {
  cause?: Throwable;
  stackTrace?: Array<StackTraceElement>;
  message?: string;
  localizedMessage?: string;
  suppressed?: Array<Throwable>;
};

export type SupportZipXO = {
  file?: string;
  name?: string;
  size?: string;
  truncated?: boolean;
};

export type SupportZipGeneratorRequest = {
  systemInformation?: boolean;
  threadDump?: boolean;
  metrics?: boolean;
  configuration?: boolean;
  security?: boolean;
  log?: boolean;
  taskLog?: boolean;
  auditLog?: boolean;
  jmx?: boolean;
  replication?: boolean;
  limitFileSizes?: boolean;
  limitZipSize?: boolean;
  hostname?: string;
};

export type ReadLdapServerXo = {
  /**
   * LDAP server name
   */
  name: string;
  /**
   * LDAP server connection Protocol to use
   */
  protocol: 'ldap' | 'ldaps';
  /**
   * Whether to use certificates stored in Nexus Repository Manager's truststore
   */
  useTrustStore?: boolean;
  /**
   * LDAP server connection hostname
   */
  host: string;
  /**
   * LDAP server connection port to use
   */
  port: number;
  /**
   * LDAP location to be added to the connection URL
   */
  searchBase: string;
  /**
   * Authentication scheme used for connecting to LDAP server
   */
  authScheme: 'NONE' | 'SIMPLE' | 'DIGEST_MD5' | 'CRAM_MD5';
  /**
   * The SASL realm to bind to. Required if authScheme is CRAM_MD5 or DIGEST_MD5
   */
  authRealm?: string;
  /**
   * This must be a fully qualified username if simple authentication is used. Required if authScheme other than none.
   */
  authUsername?: string;
  /**
   * How long to wait before timeout
   */
  connectionTimeoutSeconds: number;
  /**
   * How long to wait before retrying
   */
  connectionRetryDelaySeconds: number;
  /**
   * How many retry attempts
   */
  maxIncidentsCount: number;
  /**
   * The relative DN where user objects are found (e.g. ou=people). This value will have the Search base DN value appended to form the full User search base DN.
   */
  userBaseDn?: string;
  /**
   * Are users located in structures below the user base DN?
   */
  userSubtree?: boolean;
  /**
   * LDAP class for user objects
   */
  userObjectClass?: string;
  /**
   * LDAP search filter to limit user search
   */
  userLdapFilter?: string;
  /**
   * This is used to find a user given its user ID
   */
  userIdAttribute?: string;
  /**
   * This is used to find a real name given the user ID
   */
  userRealNameAttribute?: string;
  /**
   * This is used to find an email address given the user ID
   */
  userEmailAddressAttribute?: string;
  /**
   * If this field is blank the user will be authenticated against a bind with the LDAP server
   */
  userPasswordAttribute?: string;
  /**
   * Denotes whether LDAP assigned roles are used as Nexus Repository Manager roles
   */
  ldapGroupsAsRoles?: boolean;
  /**
   * Defines a type of groups used: static (a group contains a list of users) or dynamic (a user contains a list of groups). Required if ldapGroupsAsRoles is true.
   */
  groupType: 'static' | 'dynamic';
  /**
   * The relative DN where group objects are found (e.g. ou=Group). This value will have the Search base DN value appended to form the full Group search base DN.
   */
  groupBaseDn?: string;
  /**
   * Are groups located in structures below the group base DN
   */
  groupSubtree?: boolean;
  /**
   * LDAP class for group objects. Required if groupType is static
   */
  groupObjectClass?: string;
  /**
   * This field specifies the attribute of the Object class that defines the Group ID. Required if groupType is static
   */
  groupIdAttribute?: string;
  /**
   * LDAP attribute containing the usernames for the group. Required if groupType is static
   */
  groupMemberAttribute?: string;
  /**
   * The format of user ID stored in the group member attribute. Required if groupType is static
   */
  groupMemberFormat?: string;
  /**
   * Set this to the attribute used to store the attribute which holds groups DN in the user object. Required if groupType is dynamic
   */
  userMemberOfAttribute?: string;
  /**
   * LDAP server ID
   */
  id?: string;
  /**
   * Order number in which the server is being used when looking for a user
   */
  order?: number;
};

export type CreateLdapServerXo = {
  /**
   * LDAP server name
   */
  name: string;
  /**
   * LDAP server connection Protocol to use
   */
  protocol: 'ldap' | 'ldaps';
  /**
   * Whether to use certificates stored in Nexus Repository Manager's truststore
   */
  useTrustStore?: boolean;
  /**
   * LDAP server connection hostname
   */
  host: string;
  /**
   * LDAP server connection port to use
   */
  port: number;
  /**
   * LDAP location to be added to the connection URL
   */
  searchBase: string;
  /**
   * Authentication scheme used for connecting to LDAP server
   */
  authScheme: 'NONE' | 'SIMPLE' | 'DIGEST_MD5' | 'CRAM_MD5';
  /**
   * The SASL realm to bind to. Required if authScheme is CRAM_MD5 or DIGEST_MD5
   */
  authRealm?: string;
  /**
   * This must be a fully qualified username if simple authentication is used. Required if authScheme other than none.
   */
  authUsername?: string;
  /**
   * How long to wait before timeout
   */
  connectionTimeoutSeconds: number;
  /**
   * How long to wait before retrying
   */
  connectionRetryDelaySeconds: number;
  /**
   * How many retry attempts
   */
  maxIncidentsCount: number;
  /**
   * The relative DN where user objects are found (e.g. ou=people). This value will have the Search base DN value appended to form the full User search base DN.
   */
  userBaseDn?: string;
  /**
   * Are users located in structures below the user base DN?
   */
  userSubtree?: boolean;
  /**
   * LDAP class for user objects
   */
  userObjectClass?: string;
  /**
   * LDAP search filter to limit user search
   */
  userLdapFilter?: string;
  /**
   * This is used to find a user given its user ID
   */
  userIdAttribute?: string;
  /**
   * This is used to find a real name given the user ID
   */
  userRealNameAttribute?: string;
  /**
   * This is used to find an email address given the user ID
   */
  userEmailAddressAttribute?: string;
  /**
   * If this field is blank the user will be authenticated against a bind with the LDAP server
   */
  userPasswordAttribute?: string;
  /**
   * Denotes whether LDAP assigned roles are used as Nexus Repository Manager roles
   */
  ldapGroupsAsRoles?: boolean;
  /**
   * Defines a type of groups used: static (a group contains a list of users) or dynamic (a user contains a list of groups). Required if ldapGroupsAsRoles is true.
   */
  groupType: 'static' | 'dynamic';
  /**
   * The relative DN where group objects are found (e.g. ou=Group). This value will have the Search base DN value appended to form the full Group search base DN.
   */
  groupBaseDn?: string;
  /**
   * Are groups located in structures below the group base DN
   */
  groupSubtree?: boolean;
  /**
   * LDAP class for group objects. Required if groupType is static
   */
  groupObjectClass?: string;
  /**
   * This field specifies the attribute of the Object class that defines the Group ID. Required if groupType is static
   */
  groupIdAttribute?: string;
  /**
   * LDAP attribute containing the usernames for the group. Required if groupType is static
   */
  groupMemberAttribute?: string;
  /**
   * The format of user ID stored in the group member attribute. Required if groupType is static
   */
  groupMemberFormat?: string;
  /**
   * Set this to the attribute used to store the attribute which holds groups DN in the user object. Required if groupType is dynamic
   */
  userMemberOfAttribute?: string;
  /**
   * The password to bind with. Required if authScheme other than none.
   */
  authPassword: string;
};

export type UpdateLdapServerXo = {
  /**
   * LDAP server name
   */
  name: string;
  /**
   * LDAP server connection Protocol to use
   */
  protocol: 'ldap' | 'ldaps';
  /**
   * Whether to use certificates stored in Nexus Repository Manager's truststore
   */
  useTrustStore?: boolean;
  /**
   * LDAP server connection hostname
   */
  host: string;
  /**
   * LDAP server connection port to use
   */
  port: number;
  /**
   * LDAP location to be added to the connection URL
   */
  searchBase: string;
  /**
   * Authentication scheme used for connecting to LDAP server
   */
  authScheme: 'NONE' | 'SIMPLE' | 'DIGEST_MD5' | 'CRAM_MD5';
  /**
   * The SASL realm to bind to. Required if authScheme is CRAM_MD5 or DIGEST_MD5
   */
  authRealm?: string;
  /**
   * This must be a fully qualified username if simple authentication is used. Required if authScheme other than none.
   */
  authUsername?: string;
  /**
   * How long to wait before timeout
   */
  connectionTimeoutSeconds: number;
  /**
   * How long to wait before retrying
   */
  connectionRetryDelaySeconds: number;
  /**
   * How many retry attempts
   */
  maxIncidentsCount: number;
  /**
   * The relative DN where user objects are found (e.g. ou=people). This value will have the Search base DN value appended to form the full User search base DN.
   */
  userBaseDn?: string;
  /**
   * Are users located in structures below the user base DN?
   */
  userSubtree?: boolean;
  /**
   * LDAP class for user objects
   */
  userObjectClass?: string;
  /**
   * LDAP search filter to limit user search
   */
  userLdapFilter?: string;
  /**
   * This is used to find a user given its user ID
   */
  userIdAttribute?: string;
  /**
   * This is used to find a real name given the user ID
   */
  userRealNameAttribute?: string;
  /**
   * This is used to find an email address given the user ID
   */
  userEmailAddressAttribute?: string;
  /**
   * If this field is blank the user will be authenticated against a bind with the LDAP server
   */
  userPasswordAttribute?: string;
  /**
   * Denotes whether LDAP assigned roles are used as Nexus Repository Manager roles
   */
  ldapGroupsAsRoles?: boolean;
  /**
   * Defines a type of groups used: static (a group contains a list of users) or dynamic (a user contains a list of groups). Required if ldapGroupsAsRoles is true.
   */
  groupType: 'static' | 'dynamic';
  /**
   * The relative DN where group objects are found (e.g. ou=Group). This value will have the Search base DN value appended to form the full Group search base DN.
   */
  groupBaseDn?: string;
  /**
   * Are groups located in structures below the group base DN
   */
  groupSubtree?: boolean;
  /**
   * LDAP class for group objects. Required if groupType is static
   */
  groupObjectClass?: string;
  /**
   * This field specifies the attribute of the Object class that defines the Group ID. Required if groupType is static
   */
  groupIdAttribute?: string;
  /**
   * LDAP attribute containing the usernames for the group. Required if groupType is static
   */
  groupMemberAttribute?: string;
  /**
   * The format of user ID stored in the group member attribute. Required if groupType is static
   */
  groupMemberFormat?: string;
  /**
   * Set this to the attribute used to store the attribute which holds groups DN in the user object. Required if groupType is dynamic
   */
  userMemberOfAttribute?: string;
  /**
   * The password to bind with. Required if authScheme other than none.
   */
  authPassword: string;
  /**
   * LDAP server ID
   */
  id?: string;
};

export type IqConnectionVerificationXo = {
  success?: boolean;
  reason?: string;
};

export type IqConnectionXo = {
  /**
   * Whether to use Sonatype Repository Firewall
   */
  enabled?: boolean;
  /**
   * Show Sonatype Repository Firewall link in Browse menu when server is enabled
   */
  showLink?: boolean;
  /**
   * The address of your Sonatype Repository Firewall
   */
  url?: string;
  /**
   * Authentication method
   */
  authenticationType: 'USER' | 'PKI';
  /**
   * User with access to Sonatype Repository Firewall
   */
  username?: string;
  /**
   * Credentials for the Sonatype Repository Firewall User
   */
  password?: string;
  /**
   * Use certificates stored in the Nexus Repository Manager truststore to connect to Sonatype Repository Firewall
   */
  useTrustStoreForUrl?: boolean;
  /**
   * Seconds to wait for activity before stopping and retrying the connection. Leave blank to use the globally defined HTTP timeout.
   */
  timeoutSeconds?: number;
  /**
   * Additional properties to configure for Sonatype Repository Firewall
   */
  properties?: string;
};

export type ApiLicenseDetailsXO = {
  contactEmail?: string;
  contactCompany?: string;
  contactName?: string;
  effectiveDate?: string;
  expirationDate?: string;
  licenseType?: string;
  licensedUsers?: string;
  fingerprint?: string;
  features?: string;
};

export type InputStream = {};

export type GroupDeployAttributes = {
  /**
   * Member repositories' names
   */
  memberNames?: Array<string>;
  /**
   * Pro-only: This field is for the Group Deployment feature available in NXRM Pro.
   */
  writableMember?: string;
};

export type SimpleApiGroupDeployRepository = {
  /**
   * A unique identifier for this repository
   */
  readonly name?: string;
  /**
   * Whether this repository accepts incoming requests
   */
  readonly online: boolean;
  readonly storage: StorageAttributes;
  readonly group: GroupDeployAttributes;
};

export type NpmGroupRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  group: GroupDeployAttributes;
};

export type NpmHostedRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: HostedStorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  component?: ComponentAttributes;
};

export type NpmAttributes = {
  /**
   * Remove Non-Cataloged Versions
   */
  removeNonCataloged: boolean;
  /**
   * Remove Quarantined Versions
   */
  removeQuarantined: boolean;
};

export type NpmProxyApiRepository = {
  /**
   * A unique identifier for this repository
   */
  name?: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  proxy: ProxyAttributes;
  negativeCache: NegativeCacheAttributes;
  httpClient: HttpClientAttributes;
  /**
   * The name of the routing rule assigned to this repository
   */
  routingRuleName?: string;
  replication?: ReplicationAttributes;
  npm?: NpmAttributes;
};

export type NpmProxyRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  proxy: ProxyAttributes;
  negativeCache: NegativeCacheAttributes;
  httpClient: HttpClientAttributes;
  routingRule?: string;
  replication?: ReplicationAttributes;
  npm?: NpmAttributes;
};

export type NugetGroupRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  group: GroupAttributes;
};

export type NugetHostedRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: HostedStorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  component?: ComponentAttributes;
};

export type NugetAttributes = {
  /**
   * How long to cache query results from the proxied repository (in seconds)
   */
  queryCacheItemMaxAge?: number;
  /**
   * Nuget protocol version
   */
  nugetVersion?: 'V2' | 'V3';
};

export type NugetProxyApiRepository = {
  /**
   * A unique identifier for this repository
   */
  name?: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  proxy: ProxyAttributes;
  negativeCache: NegativeCacheAttributes;
  httpClient: HttpClientAttributes;
  /**
   * The name of the routing rule assigned to this repository
   */
  routingRuleName?: string;
  replication?: ReplicationAttributes;
  nugetProxy: NugetAttributes;
};

export type NugetProxyRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  proxy: ProxyAttributes;
  negativeCache: NegativeCacheAttributes;
  httpClient: HttpClientAttributes;
  routingRule?: string;
  replication?: ReplicationAttributes;
  nugetProxy: NugetAttributes;
};

export type RubyGemsGroupRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  group: GroupAttributes;
};

export type RubyGemsHostedRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: HostedStorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  component?: ComponentAttributes;
};

export type RubyGemsProxyRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  proxy: ProxyAttributes;
  negativeCache: NegativeCacheAttributes;
  httpClient: HttpClientAttributes;
  routingRule?: string;
  replication?: ReplicationAttributes;
};

export type DockerAttributes = {
  /**
   * Whether to allow clients to use the V1 API to interact with this repository
   */
  v1Enabled: boolean;
  /**
   * Whether to force authentication (Docker Bearer Token Realm required if false)
   */
  forceBasicAuth: boolean;
  /**
   * Create an HTTP connector at specified port
   */
  httpPort?: number;
  /**
   * Create an HTTPS connector at specified port
   */
  httpsPort?: number;
  /**
   * Allows to use subdomain
   */
  subdomain?: string;
};

export type DockerGroupApiRepository = {
  /**
   * A unique identifier for this repository
   */
  name?: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  group: GroupDeployAttributes;
  docker: DockerAttributes;
};

export type DockerGroupRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  group: GroupDeployAttributes;
  docker: DockerAttributes;
};

export type DockerHostedApiRepository = {
  /**
   * A unique identifier for this repository
   */
  name?: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: HostedStorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  component?: ComponentAttributes;
  docker: DockerAttributes;
};

export type DockerHostedRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: DockerHostedStorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  component?: ComponentAttributes;
  docker: DockerAttributes;
};

export type DockerHostedStorageAttributes = {
  /**
   * Blob store used to store repository contents
   */
  blobStoreName?: string;
  /**
   * Whether to validate uploaded content's MIME type appropriate for the repository format
   */
  strictContentTypeValidation: boolean;
  /**
   * Controls if deployments of and updates to assets are allowed
   */
  writePolicy: 'allow' | 'allow_once' | 'deny';
  /**
   * Whether to allow redeploying the 'latest' tag but defer to the Deployment Policy for all other tags
   */
  latestPolicy?: boolean;
};

export type DockerProxyApiRepository = {
  /**
   * A unique identifier for this repository
   */
  name?: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  proxy: ProxyAttributes;
  negativeCache: NegativeCacheAttributes;
  httpClient: HttpClientAttributes;
  /**
   * The name of the routing rule assigned to this repository
   */
  routingRuleName?: string;
  replication?: ReplicationAttributes;
  docker: DockerAttributes;
  dockerProxy: DockerProxyAttributes;
};

export type DockerProxyAttributes = {
  /**
   * Type of Docker Index
   */
  indexType?: 'HUB' | 'REGISTRY' | 'CUSTOM';
  /**
   * Url of Docker Index to use
   */
  indexUrl?: string;
  /**
   * Allow Nexus Repository Manager to download and cache foreign layers
   */
  cacheForeignLayers?: boolean;
  /**
   * Regular expressions used to identify URLs that are allowed for foreign layer requests
   */
  foreignLayerUrlWhitelist?: Array<string>;
};

export type DockerProxyRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  proxy: ProxyAttributes;
  negativeCache: NegativeCacheAttributes;
  httpClient: HttpClientAttributes;
  routingRule?: string;
  replication?: ReplicationAttributes;
  docker: DockerAttributes;
  dockerProxy: DockerProxyAttributes;
};

export type YumGroupRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  group: GroupAttributes;
  yumSigning?: YumSigningRepositoriesAttributes;
};

export type YumSigningRepositoriesAttributes = {
  /**
   * PGP signing key pair (armored private key e.g. gpg --export-secret-key --armor)
   */
  keypair?: string;
  /**
   * Passphrase to access PGP signing key
   */
  passphrase?: string;
};

export type YumAttributes = {
  /**
   * Specifies the repository depth where repodata folder(s) are created
   */
  repodataDepth: number;
  /**
   * Validate that all paths are RPMs or yum metadata
   */
  deployPolicy?: 'PERMISSIVE' | 'STRICT';
};

export type YumHostedApiRepository = {
  /**
   * A unique identifier for this repository
   */
  name?: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: HostedStorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  component?: ComponentAttributes;
  yum: YumAttributes;
};

export type YumHostedRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: HostedStorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  component?: ComponentAttributes;
  yum: YumAttributes;
};

export type YumProxyRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  proxy: ProxyAttributes;
  negativeCache: NegativeCacheAttributes;
  httpClient: HttpClientAttributes;
  routingRule?: string;
  replication?: ReplicationAttributes;
  yumSigning?: YumSigningRepositoriesAttributes;
};

export type AzureConnectionXO = {
  accountName?: string;
  accountKey?: string;
  containerName?: string;
  authenticationMethod?: string;
};

export type AzureBlobStoreApiAuthentication = {
  /**
   * The type of Azure authentication to use.
   */
  authenticationMethod:
    | 'ACCOUNTKEY'
    | 'MANAGEDIDENTITY'
    | 'ENVIRONMENTVARIABLE';
  /**
   * The account key.
   */
  accountKey?: string;
};

export type AzureBlobStoreApiBucketConfiguration = {
  /**
   * Account name found under Access keys for the storage account.
   */
  accountName: string;
  /**
   * The name of an existing container to be used for storage.
   */
  containerName: string;
  /**
   * The Azure specific authentication details.
   */
  authentication: AzureBlobStoreApiAuthentication;
};

export type AzureBlobStoreApiModel = {
  /**
   * The name of the Azure blob store.
   */
  name: string;
  /**
   * Settings to control the soft quota.
   */
  softQuota?: BlobStoreApiSoftQuota;
  /**
   * The Azure specific configuration details for the Azure object that'll contain the blob store.
   */
  bucketConfiguration: AzureBlobStoreApiBucketConfiguration;
};

export type HelmHostedRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: HostedStorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  component?: ComponentAttributes;
};

export type HelmProxyRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  proxy: ProxyAttributes;
  negativeCache: NegativeCacheAttributes;
  httpClient: HttpClientAttributes;
  routingRule?: string;
  replication?: ReplicationAttributes;
};

export type GitLfsHostedRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: HostedStorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  component?: ComponentAttributes;
};

export type PypiGroupRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  group: GroupAttributes;
};

export type PypiHostedRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: HostedStorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  component?: ComponentAttributes;
};

export type PypiProxyRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  proxy: ProxyAttributes;
  negativeCache: NegativeCacheAttributes;
  httpClient: HttpClientAttributes;
  routingRule?: string;
  replication?: ReplicationAttributes;
};

export type CondaProxyRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  proxy: ProxyAttributes;
  negativeCache: NegativeCacheAttributes;
  httpClient: HttpClientAttributes;
  routingRule?: string;
  replication?: ReplicationAttributes;
};

export type ConanProxyRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  proxy: ProxyAttributes;
  negativeCache: NegativeCacheAttributes;
  httpClient: HttpClientAttributes;
  routingRule?: string;
  replication?: ReplicationAttributes;
};

export type RGroupRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  group: GroupAttributes;
};

export type RHostedRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: HostedStorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  component?: ComponentAttributes;
};

export type RProxyRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  proxy: ProxyAttributes;
  negativeCache: NegativeCacheAttributes;
  httpClient: HttpClientAttributes;
  routingRule?: string;
  replication?: ReplicationAttributes;
};

export type CocoapodsProxyRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  proxy: ProxyAttributes;
  negativeCache: NegativeCacheAttributes;
  httpClient: HttpClientAttributes;
  routingRule?: string;
  replication?: ReplicationAttributes;
};

export type GolangGroupRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  group: GroupAttributes;
};

export type GolangProxyRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  proxy: ProxyAttributes;
  negativeCache: NegativeCacheAttributes;
  httpClient: HttpClientAttributes;
  routingRule?: string;
  replication?: ReplicationAttributes;
};

export type P2ProxyRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  proxy: ProxyAttributes;
  negativeCache: NegativeCacheAttributes;
  httpClient: HttpClientAttributes;
  routingRule?: string;
  replication?: ReplicationAttributes;
};

export type BowerGroupRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  group: GroupAttributes;
};

export type BowerHostedRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: HostedStorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  component?: ComponentAttributes;
};

export type BowerAttributes = {
  /**
   * Whether to force Bower to retrieve packages through this proxy repository
   */
  rewritePackageUrls: boolean;
};

export type BowerProxyApiRepository = {
  /**
   * A unique identifier for this repository
   */
  name?: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  proxy: ProxyAttributes;
  negativeCache: NegativeCacheAttributes;
  httpClient: HttpClientAttributes;
  /**
   * The name of the routing rule assigned to this repository
   */
  routingRuleName?: string;
  replication?: ReplicationAttributes;
  bower?: BowerAttributes;
};

export type BowerProxyRepositoryApiRequest = {
  /**
   * A unique identifier for this repository
   */
  name: string;
  /**
   * Whether this repository accepts incoming requests
   */
  online: boolean;
  storage: StorageAttributes;
  cleanup?: CleanupPolicyAttributes;
  proxy: ProxyAttributes;
  negativeCache: NegativeCacheAttributes;
  httpClient: HttpClientAttributes;
  routingRule?: string;
  replication?: ReplicationAttributes;
  bower?: BowerAttributes;
};
