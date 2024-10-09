import type { CancelablePromise } from './core/CancelablePromise';
import { OpenAPI } from './core/OpenAPI';
import { request as __request } from './core/request';

import type {
  AnonymousAccessSettingsXO,
  ApiUserSource,
  ApiCreateUser,
  ApiUser,
  ApiPrivilege,
  ApiPrivilegeApplicationRequest,
  ApiPrivilegeRepositoryAdminRequest,
  ApiPrivilegeRepositoryContentSelectorRequest,
  ApiPrivilegeRepositoryViewRequest,
  ApiPrivilegeScriptRequest,
  ApiPrivilegeWildcardRequest,
  RealmApiXO,
  RoleXORequest,
  RoleXOResponse,
  PageTaskXO,
  TaskXO,
  AzureBlobStoreApiModel,
  BlobStoreQuotaResultXO,
  FileBlobStoreApiCreateRequest,
  FileBlobStoreApiModel,
  FileBlobStoreApiUpdateRequest,
  GenericBlobStoreApiResponse,
  S3BlobStoreApiModel,
  ReadOnlyState,
  ApiCertificate,
  AssetXO,
  PageAssetXO,
  ComponentXO,
  PageComponentXO,
  AbstractApiRepository,
  AptHostedApiRepository,
  AptHostedRepositoryApiRequest,
  AptProxyApiRepository,
  AptProxyRepositoryApiRequest,
  BowerGroupRepositoryApiRequest,
  BowerHostedRepositoryApiRequest,
  BowerProxyApiRepository,
  BowerProxyRepositoryApiRequest,
  CocoapodsProxyRepositoryApiRequest,
  ConanProxyRepositoryApiRequest,
  CondaProxyRepositoryApiRequest,
  DockerGroupApiRepository,
  DockerGroupRepositoryApiRequest,
  DockerHostedApiRepository,
  DockerHostedRepositoryApiRequest,
  DockerProxyApiRepository,
  DockerProxyRepositoryApiRequest,
  GitLfsHostedRepositoryApiRequest,
  GolangGroupRepositoryApiRequest,
  GolangProxyRepositoryApiRequest,
  HelmHostedRepositoryApiRequest,
  HelmProxyRepositoryApiRequest,
  MavenGroupRepositoryApiRequest,
  MavenHostedApiRepository,
  MavenHostedRepositoryApiRequest,
  MavenProxyApiRepository,
  MavenProxyRepositoryApiRequest,
  NpmGroupRepositoryApiRequest,
  NpmHostedRepositoryApiRequest,
  NpmProxyApiRepository,
  NpmProxyRepositoryApiRequest,
  NugetGroupRepositoryApiRequest,
  NugetHostedRepositoryApiRequest,
  NugetProxyApiRepository,
  NugetProxyRepositoryApiRequest,
  P2ProxyRepositoryApiRequest,
  PypiGroupRepositoryApiRequest,
  PypiHostedRepositoryApiRequest,
  PypiProxyRepositoryApiRequest,
  RawGroupRepositoryApiRequest,
  RawHostedRepositoryApiRequest,
  RawProxyRepositoryApiRequest,
  RepositoryXO,
  RGroupRepositoryApiRequest,
  RHostedRepositoryApiRequest,
  RProxyRepositoryApiRequest,
  RubyGemsGroupRepositoryApiRequest,
  RubyGemsHostedRepositoryApiRequest,
  RubyGemsProxyRepositoryApiRequest,
  SimpleApiGroupDeployRepository,
  SimpleApiGroupRepository,
  SimpleApiHostedRepository,
  SimpleApiProxyRepository,
  YumGroupRepositoryApiRequest,
  YumHostedApiRepository,
  YumHostedRepositoryApiRequest,
  YumProxyRepositoryApiRequest,
  ContentSelectorApiCreateRequest,
  ContentSelectorApiResponse,
  ContentSelectorApiUpdateRequest,
  RoutingRuleXO,
  UploadDefinitionXO,
  ScriptResultXO,
  ScriptXO,
  ApiEmailConfiguration,
  ApiEmailValidation,
  Result,
  SupportZipGeneratorRequest,
  SupportZipXO,
  CreateLdapServerXo,
  UpdateLdapServerXo,
  IqConnectionXo,
  ApiLicenseDetailsXO,
  InputStream,
  AzureConnectionXO,
} from './models';

export type SecurityManagementAnonymousAccessData = {
  Update: {
    body?: AnonymousAccessSettingsXO;
  };
};

export type SecurityManagementData = {};

export type SecurityManagementUsersData = {
  UpdateUser: {
    /**
     * A representation of the user to update.
     */
    body?: ApiUser;
    /**
     * The userid the request should apply to.
     */
    userId: string;
  };
  DeleteUser: {
    /**
     * The userid the request should apply to.
     */
    userId: string;
  };
  ChangePassword: {
    /**
     * The new password to use.
     */
    body?: string;
    /**
     * The userid the request should apply to.
     */
    userId: string;
  };
  GetUsers: {
    /**
     * An optional user source to restrict the search to.
     */
    source?: string;
    /**
     * An optional term to search userids for.
     */
    userId?: string;
  };
  CreateUser: {
    /**
     * A representation of the user to create.
     */
    body?: ApiCreateUser;
  };
};

export type SecurityManagementPrivilegesData = {
  GetPrivilege: {
    /**
     * The name of the privilege to retrieve.
     */
    privilegeName: string;
  };
  DeletePrivilege: {
    /**
     * The name of the privilege to delete.
     */
    privilegeName: string;
  };
  CreatePrivilege: {
    /**
     * The privilege to create.
     */
    body?: ApiPrivilegeWildcardRequest;
  };
  CreatePrivilege1: {
    /**
     * The privilege to create.
     */
    body?: ApiPrivilegeApplicationRequest;
  };
  UpdatePrivilege: {
    /**
     * The privilege to update.
     */
    body?: ApiPrivilegeWildcardRequest;
    /**
     * The name of the privilege to update.
     */
    privilegeName: string;
  };
  UpdatePrivilege1: {
    /**
     * The privilege to update.
     */
    body?: ApiPrivilegeApplicationRequest;
    /**
     * The name of the privilege to update.
     */
    privilegeName: string;
  };
  CreatePrivilege2: {
    /**
     * The privilege to create.
     */
    body?: ApiPrivilegeRepositoryContentSelectorRequest;
  };
  CreatePrivilege3: {
    /**
     * The privilege to create.
     */
    body?: ApiPrivilegeRepositoryAdminRequest;
  };
  CreatePrivilege4: {
    /**
     * The privilege to create.
     */
    body?: ApiPrivilegeRepositoryViewRequest;
  };
  UpdatePrivilege2: {
    /**
     * The privilege to update.
     */
    body?: ApiPrivilegeRepositoryViewRequest;
    /**
     * The name of the privilege to update.
     */
    privilegeName: string;
  };
  UpdatePrivilege3: {
    /**
     * The privilege to update.
     */
    body?: ApiPrivilegeRepositoryContentSelectorRequest;
    /**
     * The name of the privilege to update.
     */
    privilegeName: string;
  };
  UpdatePrivilege4: {
    /**
     * The privilege to update.
     */
    body?: ApiPrivilegeRepositoryAdminRequest;
    /**
     * The name of the privilege to update.
     */
    privilegeName: string;
  };
  CreatePrivilege5: {
    /**
     * The privilege to create.
     */
    body?: ApiPrivilegeScriptRequest;
  };
  UpdatePrivilege5: {
    /**
     * The privilege to update.
     */
    body?: ApiPrivilegeScriptRequest;
    /**
     * The name of the privilege to update.
     */
    privilegeName: string;
  };
};

export type SecurityManagementRealmsData = {
  SetActiveRealms: {
    /**
     * The realm IDs
     */
    body?: Array<string>;
  };
};

export type SecurityManagementRolesData = {
  GetRoles: {
    /**
     * The id of the user source to filter the roles by, if supplied. Otherwise roles from all user sources will be returned.
     */
    source?: string;
  };
  Create: {
    /**
     * A role configuration
     */
    body: RoleXORequest;
  };
  GetRole: {
    /**
     * The id of the role to get
     */
    id: string;
    /**
     * The id of the user source to filter the roles by. Available sources can be fetched using the 'User Sources' endpoint.
     */
    source?: string;
  };
  Update1: {
    /**
     * A role configuration
     */
    body: RoleXORequest;
    /**
     * The id of the role to update
     */
    id: string;
  };
  Delete: {
    /**
     * The id of the role to delete
     */
    id: string;
  };
};

export type TasksData = {
  GetTasks: {
    /**
     * Type of the tasks to get
     */
    type?: string;
  };
  GetTaskById: {
    /**
     * Id of the task to get
     */
    id: string;
  };
  Run: {
    /**
     * Id of the task to run
     */
    id: string;
  };
  Stop: {
    /**
     * Id of the task to stop
     */
    id: string;
  };
};

export type BlobStoreData = {
  QuotaStatus: {
    name: string;
  };
  DeleteBlobStore: {
    /**
     * The name of the blob store to delete
     */
    name: string;
  };
  CreateFileBlobStore: {
    body?: FileBlobStoreApiCreateRequest;
  };
  GetFileBlobStoreConfiguration: {
    /**
     * The name of the file blob store to read
     */
    name: string;
  };
  UpdateFileBlobStore: {
    body?: FileBlobStoreApiUpdateRequest;
    /**
     * The name of the file blob store to update
     */
    name: string;
  };
  GetBlobStore: {
    /**
     * Name of the blob store configuration to fetch
     */
    name: string;
  };
  UpdateBlobStore: {
    body?: S3BlobStoreApiModel;
    /**
     * Name of the blob store to update
     */
    name: string;
  };
  CreateBlobStore: {
    body?: S3BlobStoreApiModel;
  };
  GetBlobStore1: {
    /**
     * Name of the blob store configuration to fetch
     */
    name: string;
  };
  UpdateBlobStore1: {
    body?: AzureBlobStoreApiModel;
    /**
     * Name of the blob store to update
     */
    name: string;
  };
  CreateBlobStore1: {
    body?: AzureBlobStoreApiModel;
  };
};

export type LifecycleData = {
  Bounce: {
    /**
     * The phase to bounce
     */
    body?: string;
  };
  SetPhase: {
    /**
     * The phase to move to
     */
    body?: string;
  };
};

export type ReadOnlyData = {};

export type SecurityCertificatesData = {
  RetrieveCertificate: {
    /**
     * The remote system's host name
     */
    host: string;
    /**
     * The port on the remote system to connect to
     */
    port?: number;
    /**
     * An optional hint of the protocol to try for the connection
     */
    protocolHint?: string;
  };
  AddCertificate: {
    /**
     * The certificate to add encoded in PEM format
     */
    body?: string;
  };
  RemoveCertificate: {
    /**
     * The id of the certificate that should be removed.
     */
    id: string;
  };
};

export type AssetsData = {
  GetAssetById: {
    /**
     * Id of the asset to get
     */
    id: string;
  };
  DeleteAsset: {
    /**
     * Id of the asset to delete
     */
    id: string;
  };
  GetAssets: {
    /**
     * A token returned by a prior request. If present, the next page of results are returned
     */
    continuationToken?: string;
    /**
     * Repository from which you would like to retrieve assets.
     */
    repository: string;
  };
};

export type ComponentsData = {
  GetComponentById: {
    /**
     * ID of the component to retrieve
     */
    id: string;
  };
  DeleteComponent: {
    /**
     * ID of the component to delete
     */
    id: string;
  };
  GetComponents: {
    /**
     * A token returned by a prior request. If present, the next page of results are returned
     */
    continuationToken?: string;
    /**
     * Repository from which you would like to retrieve components
     */
    repository: string;
  };
  UploadComponent: {
    /**
     * apt Asset
     */
    aptAsset?: Blob | File;
    /**
     * docker Asset
     */
    dockerAsset?: Blob | File;
    /**
     * helm Asset
     */
    helmAsset?: Blob | File;
    /**
     * maven2 Artifact ID
     */
    maven2ArtifactId?: string;
    /**
     * maven2 Asset 1
     */
    maven2Asset1?: Blob | File;
    /**
     * maven2 Asset 1 Classifier
     */
    maven2Asset1Classifier?: string;
    /**
     * maven2 Asset 1 Extension
     */
    maven2Asset1Extension?: string;
    /**
     * maven2 Asset 2
     */
    maven2Asset2?: Blob | File;
    /**
     * maven2 Asset 2 Classifier
     */
    maven2Asset2Classifier?: string;
    /**
     * maven2 Asset 2 Extension
     */
    maven2Asset2Extension?: string;
    /**
     * maven2 Asset 3
     */
    maven2Asset3?: Blob | File;
    /**
     * maven2 Asset 3 Classifier
     */
    maven2Asset3Classifier?: string;
    /**
     * maven2 Asset 3 Extension
     */
    maven2Asset3Extension?: string;
    /**
     * maven2 Generate a POM file with these coordinates
     */
    maven2GeneratePom?: boolean;
    /**
     * maven2 Group ID
     */
    maven2GroupId?: string;
    /**
     * maven2 Packaging
     */
    maven2Packaging?: string;
    /**
     * maven2 Version
     */
    maven2Version?: string;
    /**
     * npm Asset
     */
    npmAsset?: Blob | File;
    /**
     * nuget Asset
     */
    nugetAsset?: Blob | File;
    /**
     * pypi Asset
     */
    pypiAsset?: Blob | File;
    /**
     * r Asset
     */
    rAsset?: Blob | File;
    /**
     * r Asset  Package Path
     */
    rAssetPathId?: string;
    /**
     * raw Asset 1
     */
    rawAsset1?: Blob | File;
    /**
     * raw Asset 1 Filename
     */
    rawAsset1Filename?: string;
    /**
     * raw Asset 2
     */
    rawAsset2?: Blob | File;
    /**
     * raw Asset 2 Filename
     */
    rawAsset2Filename?: string;
    /**
     * raw Asset 3
     */
    rawAsset3?: Blob | File;
    /**
     * raw Asset 3 Filename
     */
    rawAsset3Filename?: string;
    /**
     * raw Directory
     */
    rawDirectory?: string;
    /**
     * Name of the repository to which you would like to upload the component
     */
    repository: string;
    /**
     * rubygems Asset
     */
    rubygemsAsset?: Blob | File;
    /**
     * yum Asset
     */
    yumAsset?: Blob | File;
    /**
     * yum Asset  Filename
     */
    yumAssetFilename?: string;
    /**
     * yum Directory
     */
    yumDirectory?: string;
  };
};

export type RepositoryManagementData = {
  RebuildIndex: {
    /**
     * Name of the repository to rebuild index
     */
    repositoryName: string;
  };
  InvalidateCache: {
    /**
     * Name of the repository to invalidate cache
     */
    repositoryName: string;
  };
  GetRepository: {
    /**
     * Name of the repository to get
     */
    repositoryName: string;
  };
  DeleteRepository: {
    /**
     * Name of the repository to delete
     */
    repositoryName: string;
  };
  CreateRepository: {
    body?: MavenGroupRepositoryApiRequest;
  };
  GetRepository1: {
    repositoryName: string;
  };
  UpdateRepository: {
    body?: MavenGroupRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  GetRepository2: {
    repositoryName: string;
  };
  UpdateRepository1: {
    body?: MavenHostedRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository1: {
    body?: MavenHostedRepositoryApiRequest;
  };
  GetRepository3: {
    repositoryName: string;
  };
  UpdateRepository2: {
    body?: MavenProxyRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository2: {
    body?: MavenProxyRepositoryApiRequest;
  };
  GetRepository4: {
    repositoryName: string;
  };
  UpdateRepository3: {
    body?: AptHostedRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository3: {
    body?: AptHostedRepositoryApiRequest;
  };
  GetRepository5: {
    repositoryName: string;
  };
  UpdateRepository4: {
    body?: AptProxyRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository4: {
    body?: AptProxyRepositoryApiRequest;
  };
  CreateRepository5: {
    body?: RawGroupRepositoryApiRequest;
  };
  GetRepository6: {
    repositoryName: string;
  };
  UpdateRepository5: {
    body?: RawGroupRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository6: {
    body?: RawHostedRepositoryApiRequest;
  };
  GetRepository7: {
    repositoryName: string;
  };
  UpdateRepository6: {
    body?: RawHostedRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository7: {
    body?: RawProxyRepositoryApiRequest;
  };
  GetRepository8: {
    repositoryName: string;
  };
  UpdateRepository7: {
    body?: RawProxyRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  EnableRepositoryHealthCheck: {
    /**
     * Name of the repository to enable Repository Health Check for
     */
    repositoryName: string;
  };
  DisableRepositoryHealthCheck: {
    /**
     * Name of the repository to disable Repository Health Check for
     */
    repositoryName: string;
  };
  GetRepository9: {
    repositoryName: string;
  };
  UpdateRepository8: {
    body?: NpmGroupRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository8: {
    body?: NpmGroupRepositoryApiRequest;
  };
  CreateRepository9: {
    body?: NpmHostedRepositoryApiRequest;
  };
  GetRepository10: {
    repositoryName: string;
  };
  UpdateRepository9: {
    body?: NpmHostedRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  GetRepository11: {
    repositoryName: string;
  };
  UpdateRepository10: {
    body?: NpmProxyRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository10: {
    body?: NpmProxyRepositoryApiRequest;
  };
  CreateRepository11: {
    body?: NugetGroupRepositoryApiRequest;
  };
  GetRepository12: {
    repositoryName: string;
  };
  UpdateRepository11: {
    body?: NugetGroupRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository12: {
    body?: NugetHostedRepositoryApiRequest;
  };
  GetRepository13: {
    repositoryName: string;
  };
  UpdateRepository12: {
    body?: NugetHostedRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  GetRepository14: {
    repositoryName: string;
  };
  UpdateRepository13: {
    body?: NugetProxyRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository13: {
    body?: NugetProxyRepositoryApiRequest;
  };
  CreateRepository14: {
    body?: RubyGemsGroupRepositoryApiRequest;
  };
  GetRepository15: {
    repositoryName: string;
  };
  UpdateRepository14: {
    body?: RubyGemsGroupRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository15: {
    body?: RubyGemsHostedRepositoryApiRequest;
  };
  GetRepository16: {
    repositoryName: string;
  };
  UpdateRepository15: {
    body?: RubyGemsHostedRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository16: {
    body?: RubyGemsProxyRepositoryApiRequest;
  };
  GetRepository17: {
    repositoryName: string;
  };
  UpdateRepository16: {
    body?: RubyGemsProxyRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  GetRepository18: {
    repositoryName: string;
  };
  UpdateRepository17: {
    body?: DockerGroupRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository17: {
    body?: DockerGroupRepositoryApiRequest;
  };
  GetRepository19: {
    repositoryName: string;
  };
  UpdateRepository18: {
    body?: DockerHostedRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository18: {
    body?: DockerHostedRepositoryApiRequest;
  };
  GetRepository20: {
    repositoryName: string;
  };
  UpdateRepository19: {
    body?: DockerProxyRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository19: {
    body?: DockerProxyRepositoryApiRequest;
  };
  CreateRepository20: {
    body?: YumGroupRepositoryApiRequest;
  };
  GetRepository21: {
    repositoryName: string;
  };
  UpdateRepository20: {
    body?: YumGroupRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  GetRepository22: {
    repositoryName: string;
  };
  UpdateRepository21: {
    body?: YumHostedRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository21: {
    body?: YumHostedRepositoryApiRequest;
  };
  CreateRepository22: {
    body?: YumProxyRepositoryApiRequest;
  };
  GetRepository23: {
    repositoryName: string;
  };
  UpdateRepository22: {
    body?: YumProxyRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository23: {
    body?: HelmHostedRepositoryApiRequest;
  };
  GetRepository24: {
    repositoryName: string;
  };
  UpdateRepository23: {
    body?: HelmHostedRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository24: {
    body?: HelmProxyRepositoryApiRequest;
  };
  GetRepository25: {
    repositoryName: string;
  };
  UpdateRepository24: {
    body?: HelmProxyRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository25: {
    body?: GitLfsHostedRepositoryApiRequest;
  };
  GetRepository26: {
    repositoryName: string;
  };
  UpdateRepository25: {
    body?: GitLfsHostedRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository26: {
    body?: PypiGroupRepositoryApiRequest;
  };
  GetRepository27: {
    repositoryName: string;
  };
  UpdateRepository26: {
    body?: PypiGroupRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository27: {
    body?: PypiHostedRepositoryApiRequest;
  };
  GetRepository28: {
    repositoryName: string;
  };
  UpdateRepository27: {
    body?: PypiHostedRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository28: {
    body?: PypiProxyRepositoryApiRequest;
  };
  GetRepository29: {
    repositoryName: string;
  };
  UpdateRepository28: {
    body?: PypiProxyRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository29: {
    body?: CondaProxyRepositoryApiRequest;
  };
  GetRepository30: {
    repositoryName: string;
  };
  UpdateRepository29: {
    body?: CondaProxyRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository30: {
    body?: ConanProxyRepositoryApiRequest;
  };
  GetRepository31: {
    repositoryName: string;
  };
  UpdateRepository30: {
    body?: ConanProxyRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository31: {
    body?: RGroupRepositoryApiRequest;
  };
  GetRepository32: {
    repositoryName: string;
  };
  UpdateRepository31: {
    body?: RGroupRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository32: {
    body?: RHostedRepositoryApiRequest;
  };
  GetRepository33: {
    repositoryName: string;
  };
  UpdateRepository32: {
    body?: RHostedRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository33: {
    body?: RProxyRepositoryApiRequest;
  };
  GetRepository34: {
    repositoryName: string;
  };
  UpdateRepository33: {
    body?: RProxyRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository34: {
    body?: CocoapodsProxyRepositoryApiRequest;
  };
  GetRepository35: {
    repositoryName: string;
  };
  UpdateRepository34: {
    body?: CocoapodsProxyRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository35: {
    body?: GolangGroupRepositoryApiRequest;
  };
  GetRepository36: {
    repositoryName: string;
  };
  UpdateRepository35: {
    body?: GolangGroupRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository36: {
    body?: GolangProxyRepositoryApiRequest;
  };
  GetRepository37: {
    repositoryName: string;
  };
  UpdateRepository36: {
    body?: GolangProxyRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository37: {
    body?: P2ProxyRepositoryApiRequest;
  };
  GetRepository38: {
    repositoryName: string;
  };
  UpdateRepository37: {
    body?: P2ProxyRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository38: {
    body?: BowerGroupRepositoryApiRequest;
  };
  GetRepository39: {
    repositoryName: string;
  };
  UpdateRepository38: {
    body?: BowerGroupRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository39: {
    body?: BowerHostedRepositoryApiRequest;
  };
  GetRepository40: {
    repositoryName: string;
  };
  UpdateRepository39: {
    body?: BowerHostedRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  GetRepository41: {
    repositoryName: string;
  };
  UpdateRepository40: {
    body?: BowerProxyRepositoryApiRequest;
    /**
     * Name of the repository to update
     */
    repositoryName: string;
  };
  CreateRepository40: {
    body?: BowerProxyRepositoryApiRequest;
  };
};

export type ContentSelectorsData = {
  CreateContentSelector: {
    body?: ContentSelectorApiCreateRequest;
  };
  GetContentSelector: {
    /**
     * The content selector name
     */
    name: string;
  };
  UpdateContentSelector: {
    body?: ContentSelectorApiUpdateRequest;
    /**
     * The content selector name
     */
    name: string;
  };
  DeleteContentSelector: {
    name: string;
  };
};

export type RoutingRulesData = {
  GetRoutingRule: {
    /**
     * The name of the routing rule to get
     */
    name: string;
  };
  UpdateRoutingRule: {
    /**
     * A routing rule configuration
     */
    body: RoutingRuleXO;
    /**
     * The name of the routing rule to update
     */
    name: string;
  };
  DeleteRoutingRule: {
    /**
     * The name of the routing rule to delete
     */
    name: string;
  };
  CreateRoutingRule: {
    /**
     * A routing rule configuration
     */
    body: RoutingRuleXO;
  };
};

export type SearchData = {
  SearchAssets: {
    /**
     * Conan base version
     */
    conanBaseVersion?: string;
    /**
     * Conan channel
     */
    conanChannel?: string;
    /**
     * Conan package id
     */
    conanPackageId?: string;
    /**
     * Conan package revision
     */
    conanPackageRevision?: string;
    /**
     * Conan recipe revision
     */
    conanRevision?: string;
    /**
     * A token returned by a prior request. If present, the next page of results are returned
     */
    continuationToken?: string;
    /**
     * The direction to sort records in, defaults to ascending ('asc') for all sort fields, except version, which defaults to descending ('desc')
     */
    direction?: 'asc' | 'desc';
    /**
     * Docker content digest
     */
    dockerContentDigest?: string;
    /**
     * Docker image name
     */
    dockerImageName?: string;
    /**
     * Docker image tag
     */
    dockerImageTag?: string;
    /**
     * Docker layer ID
     */
    dockerLayerId?: string;
    /**
     * Query by format
     */
    format?: string;
    /**
     * Group asset version extension classifier
     */
    gavec?: string;
    /**
     * Component group
     */
    group?: string;
    /**
     * Maven artifactId
     */
    mavenArtifactId?: string;
    /**
     * Maven base version
     */
    mavenBaseVersion?: string;
    /**
     * Maven classifier of component's asset
     */
    mavenClassifier?: string;
    /**
     * Maven extension of component's asset
     */
    mavenExtension?: string;
    /**
     * Maven groupId
     */
    mavenGroupId?: string;
    /**
     * Specific MD5 hash of component's asset
     */
    md5?: string;
    /**
     * Component name
     */
    name?: string;
    /**
     * npm author
     */
    npmAuthor?: string;
    /**
     * npm description
     */
    npmDescription?: string;
    /**
     * npm keywords
     */
    npmKeywords?: string;
    /**
     * npm license
     */
    npmLicense?: string;
    /**
     * npm scope
     */
    npmScope?: string;
    /**
     * npm tagged is
     */
    npmTaggedIs?: string;
    /**
     * npm tagged not
     */
    npmTaggedNot?: string;
    /**
     * NuGet authors
     */
    nugetAuthors?: string;
    /**
     * NuGet description
     */
    nugetDescription?: string;
    /**
     * NuGet id
     */
    nugetId?: string;
    /**
     * NuGet summary
     */
    nugetSummary?: string;
    /**
     * NuGet tags
     */
    nugetTags?: string;
    /**
     * NuGet title
     */
    nugetTitle?: string;
    /**
     * p2 plugin name
     */
    p2PluginName?: string;
    /**
     * Prerelease version flag
     */
    prerelease?: string;
    /**
     * PyPI classifiers
     */
    pypiClassifiers?: string;
    /**
     * PyPI description
     */
    pypiDescription?: string;
    /**
     * PyPI keywords
     */
    pypiKeywords?: string;
    /**
     * PyPI summary
     */
    pypiSummary?: string;
    /**
     * Query by keyword
     */
    q?: string;
    /**
     * Repository name
     */
    repository?: string;
    /**
     * RubyGems description
     */
    rubygemsDescription?: string;
    /**
     * RubyGems platform
     */
    rubygemsPlatform?: string;
    /**
     * RubyGems summary
     */
    rubygemsSummary?: string;
    /**
     * Specific SHA-1 hash of component's asset
     */
    sha1?: string;
    /**
     * Specific SHA-256 hash of component's asset
     */
    sha256?: string;
    /**
     * Specific SHA-512 hash of component's asset
     */
    sha512?: string;
    /**
     * The field to sort the results against, if left empty, a sort based on match weight will be used.
     */
    sort?: 'group' | 'name' | 'version' | 'repository';
    /**
     * How long to wait for search results in seconds. If this value is not provided, the system default timeout will be used.
     */
    timeout?: number;
    /**
     * Component version
     */
    version?: string;
    /**
     * Yum architecture
     */
    yumArchitecture?: string;
    /**
     * Yum package name
     */
    yumName?: string;
  };
  SearchAndDownloadAssets: {
    /**
     * Conan base version
     */
    conanBaseVersion?: string;
    /**
     * Conan channel
     */
    conanChannel?: string;
    /**
     * Conan package id
     */
    conanPackageId?: string;
    /**
     * Conan package revision
     */
    conanPackageRevision?: string;
    /**
     * Conan recipe revision
     */
    conanRevision?: string;
    /**
     * The direction to sort records in, defaults to ascending ('asc') for all sort fields, except version, which defaults to descending ('desc')
     */
    direction?: 'asc' | 'desc';
    /**
     * Docker content digest
     */
    dockerContentDigest?: string;
    /**
     * Docker image name
     */
    dockerImageName?: string;
    /**
     * Docker image tag
     */
    dockerImageTag?: string;
    /**
     * Docker layer ID
     */
    dockerLayerId?: string;
    /**
     * Query by format
     */
    format?: string;
    /**
     * Group asset version extension classifier
     */
    gavec?: string;
    /**
     * Component group
     */
    group?: string;
    /**
     * Maven artifactId
     */
    mavenArtifactId?: string;
    /**
     * Maven base version
     */
    mavenBaseVersion?: string;
    /**
     * Maven classifier of component's asset
     */
    mavenClassifier?: string;
    /**
     * Maven extension of component's asset
     */
    mavenExtension?: string;
    /**
     * Maven groupId
     */
    mavenGroupId?: string;
    /**
     * Specific MD5 hash of component's asset
     */
    md5?: string;
    /**
     * Component name
     */
    name?: string;
    /**
     * npm author
     */
    npmAuthor?: string;
    /**
     * npm description
     */
    npmDescription?: string;
    /**
     * npm keywords
     */
    npmKeywords?: string;
    /**
     * npm license
     */
    npmLicense?: string;
    /**
     * npm scope
     */
    npmScope?: string;
    /**
     * npm tagged is
     */
    npmTaggedIs?: string;
    /**
     * npm tagged not
     */
    npmTaggedNot?: string;
    /**
     * NuGet authors
     */
    nugetAuthors?: string;
    /**
     * NuGet description
     */
    nugetDescription?: string;
    /**
     * NuGet id
     */
    nugetId?: string;
    /**
     * NuGet summary
     */
    nugetSummary?: string;
    /**
     * NuGet tags
     */
    nugetTags?: string;
    /**
     * NuGet title
     */
    nugetTitle?: string;
    /**
     * p2 plugin name
     */
    p2PluginName?: string;
    /**
     * Prerelease version flag
     */
    prerelease?: string;
    /**
     * PyPI classifiers
     */
    pypiClassifiers?: string;
    /**
     * PyPI description
     */
    pypiDescription?: string;
    /**
     * PyPI keywords
     */
    pypiKeywords?: string;
    /**
     * PyPI summary
     */
    pypiSummary?: string;
    /**
     * Query by keyword
     */
    q?: string;
    /**
     * Repository name
     */
    repository?: string;
    /**
     * RubyGems description
     */
    rubygemsDescription?: string;
    /**
     * RubyGems platform
     */
    rubygemsPlatform?: string;
    /**
     * RubyGems summary
     */
    rubygemsSummary?: string;
    /**
     * Specific SHA-1 hash of component's asset
     */
    sha1?: string;
    /**
     * Specific SHA-256 hash of component's asset
     */
    sha256?: string;
    /**
     * Specific SHA-512 hash of component's asset
     */
    sha512?: string;
    /**
     * The field to sort the results against, if left empty and more than 1 result is returned, the request will fail.
     */
    sort?: 'group' | 'name' | 'version' | 'repository';
    /**
     * How long to wait for search results in seconds. If this value is not provided, the system default timeout will be used.
     */
    timeout?: number;
    /**
     * Component version
     */
    version?: string;
    /**
     * Yum architecture
     */
    yumArchitecture?: string;
    /**
     * Yum package name
     */
    yumName?: string;
  };
  Search: {
    /**
     * Conan base version
     */
    conanBaseVersion?: string;
    /**
     * Conan channel
     */
    conanChannel?: string;
    /**
     * Conan package id
     */
    conanPackageId?: string;
    /**
     * Conan package revision
     */
    conanPackageRevision?: string;
    /**
     * Conan recipe revision
     */
    conanRevision?: string;
    /**
     * A token returned by a prior request. If present, the next page of results are returned
     */
    continuationToken?: string;
    /**
     * The direction to sort records in, defaults to ascending ('asc') for all sort fields, except version, which defaults to descending ('desc')
     */
    direction?: 'asc' | 'desc';
    /**
     * Docker content digest
     */
    dockerContentDigest?: string;
    /**
     * Docker image name
     */
    dockerImageName?: string;
    /**
     * Docker image tag
     */
    dockerImageTag?: string;
    /**
     * Docker layer ID
     */
    dockerLayerId?: string;
    /**
     * Query by format
     */
    format?: string;
    /**
     * Group asset version extension classifier
     */
    gavec?: string;
    /**
     * Component group
     */
    group?: string;
    /**
     * Maven artifactId
     */
    mavenArtifactId?: string;
    /**
     * Maven base version
     */
    mavenBaseVersion?: string;
    /**
     * Maven classifier of component's asset
     */
    mavenClassifier?: string;
    /**
     * Maven extension of component's asset
     */
    mavenExtension?: string;
    /**
     * Maven groupId
     */
    mavenGroupId?: string;
    /**
     * Specific MD5 hash of component's asset
     */
    md5?: string;
    /**
     * Component name
     */
    name?: string;
    /**
     * npm author
     */
    npmAuthor?: string;
    /**
     * npm description
     */
    npmDescription?: string;
    /**
     * npm keywords
     */
    npmKeywords?: string;
    /**
     * npm license
     */
    npmLicense?: string;
    /**
     * npm scope
     */
    npmScope?: string;
    /**
     * npm tagged is
     */
    npmTaggedIs?: string;
    /**
     * npm tagged not
     */
    npmTaggedNot?: string;
    /**
     * NuGet authors
     */
    nugetAuthors?: string;
    /**
     * NuGet description
     */
    nugetDescription?: string;
    /**
     * NuGet id
     */
    nugetId?: string;
    /**
     * NuGet summary
     */
    nugetSummary?: string;
    /**
     * NuGet tags
     */
    nugetTags?: string;
    /**
     * NuGet title
     */
    nugetTitle?: string;
    /**
     * p2 plugin name
     */
    p2PluginName?: string;
    /**
     * Prerelease version flag
     */
    prerelease?: string;
    /**
     * PyPI classifiers
     */
    pypiClassifiers?: string;
    /**
     * PyPI description
     */
    pypiDescription?: string;
    /**
     * PyPI keywords
     */
    pypiKeywords?: string;
    /**
     * PyPI summary
     */
    pypiSummary?: string;
    /**
     * Query by keyword
     */
    q?: string;
    /**
     * Repository name
     */
    repository?: string;
    /**
     * RubyGems description
     */
    rubygemsDescription?: string;
    /**
     * RubyGems platform
     */
    rubygemsPlatform?: string;
    /**
     * RubyGems summary
     */
    rubygemsSummary?: string;
    /**
     * Specific SHA-1 hash of component's asset
     */
    sha1?: string;
    /**
     * Specific SHA-256 hash of component's asset
     */
    sha256?: string;
    /**
     * Specific SHA-512 hash of component's asset
     */
    sha512?: string;
    /**
     * The field to sort the results against, if left empty, a sort based on match weight will be used.
     */
    sort?: 'group' | 'name' | 'version' | 'repository';
    /**
     * How long to wait for search results in seconds. If this value is not provided, the system default timeout will be used.
     */
    timeout?: number;
    /**
     * Component version
     */
    version?: string;
    /**
     * Yum architecture
     */
    yumArchitecture?: string;
    /**
     * Yum package name
     */
    yumName?: string;
  };
};

export type FormatsData = {
  Get1: {
    /**
     * The desired repository format
     */
    format: string;
  };
};

export type ScriptData = {
  Add: {
    body?: ScriptXO;
  };
  Read1: {
    name: string;
  };
  Edit: {
    body?: ScriptXO;
    name: string;
  };
  Delete1: {
    name: string;
  };
  Run1: {
    body?: string;
    name: string;
  };
};

export type EmailData = {
  SetEmailConfiguration: {
    body: ApiEmailConfiguration;
  };
  TestEmailConfiguration: {
    /**
     * An email address to send a test email to
     */
    body: string;
  };
};

export type StatusData = {};

export type SupportData = {
  Supportzippath: {
    body?: SupportZipGeneratorRequest;
  };
  Supportzip: {
    body?: SupportZipGeneratorRequest;
  };
};

export type SecurityManagementLdapData = {
  CreateLdapServer: {
    body?: CreateLdapServerXo;
  };
  GetLdapServer: {
    /**
     * Name of the LDAP server to retrieve
     */
    name: string;
  };
  UpdateLdapServer: {
    /**
     * Updated values of LDAP server
     */
    body?: UpdateLdapServerXo;
    /**
     * Name of the LDAP server to update
     */
    name: string;
  };
  DeleteLdapServer: {
    /**
     * Name of the LDAP server to delete
     */
    name: string;
  };
  ChangeOrder: {
    /**
     * Ordered list of LDAP server names
     */
    body?: Array<string>;
  };
};

export type ManageSonatypeRepositoryFirewallConfigurationData = {
  UpdateConfiguration: {
    body?: IqConnectionXo;
  };
};

export type ProductLicensingData = {
  SetLicense: {
    body?: InputStream;
  };
};

export type AzureBlobStoreData = {
  VerifyConnection1: {
    body?: AzureConnectionXO;
  };
};

export class SecurityManagementAnonymousAccessService {
  /**
   * Get Anonymous Access settings
   * @returns AnonymousAccessSettingsXO successful operation
   * @throws ApiError
   */
  public static read(): CancelablePromise<AnonymousAccessSettingsXO> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/security/anonymous',
      errors: {
        403: `Insufficient permissions to update settings`,
      },
    });
  }

  /**
   * Update Anonymous Access settings
   * @returns AnonymousAccessSettingsXO successful operation
   * @throws ApiError
   */
  public static update(
    data: SecurityManagementAnonymousAccessData['Update'] = {},
  ): CancelablePromise<AnonymousAccessSettingsXO> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/security/anonymous',
      body: body,
      errors: {
        403: `Insufficient permissions to update settings`,
      },
    });
  }
}

export class SecurityManagementService {
  /**
   * Retrieve a list of the available user sources.
   * @returns ApiUserSource successful operation
   * @throws ApiError
   */
  public static getUserSources(): CancelablePromise<Array<ApiUserSource>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/security/user-sources',
      errors: {
        403: `The user does not have permission to perform the operation.`,
      },
    });
  }
}

export class SecurityManagementUsersService {
  /**
   * Update an existing user.
   * @throws ApiError
   */
  public static updateUser(
    data: SecurityManagementUsersData['UpdateUser'],
  ): CancelablePromise<void> {
    const { userId, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/security/users/{userId}',
      path: {
        userId,
      },
      body: body,
      errors: {
        400: `Password was not supplied in the body of the request`,
        403: `The user does not have permission to perform the operation.`,
        404: `User or user source not found in the system.`,
      },
    });
  }

  /**
   * Delete a user.
   * @throws ApiError
   */
  public static deleteUser(
    data: SecurityManagementUsersData['DeleteUser'],
  ): CancelablePromise<void> {
    const { userId } = data;
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/security/users/{userId}',
      path: {
        userId,
      },
      errors: {
        400: `There was problem deleting a user. Consult the response body for more details`,
        403: `The user does not have permission to perform the operation.`,
        404: `User or user source not found in the system.`,
      },
    });
  }

  /**
   * Change a user's password.
   * @throws ApiError
   */
  public static changePassword(
    data: SecurityManagementUsersData['ChangePassword'],
  ): CancelablePromise<void> {
    const { userId, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/security/users/{userId}/change-password',
      path: {
        userId,
      },
      body: body,
      errors: {
        400: `Password was not supplied in the body of the request`,
        403: `The user does not have permission to perform the operation.`,
        404: `User not found in the system.`,
      },
    });
  }

  /**
   * Retrieve a list of users. Note if the source is not 'default' the response is limited to 100 users.
   * @returns ApiUser successful operation
   * @throws ApiError
   */
  public static getUsers(
    data: SecurityManagementUsersData['GetUsers'] = {},
  ): CancelablePromise<Array<ApiUser>> {
    const { userId, source } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/security/users',
      query: {
        userId,
        source,
      },
      errors: {
        400: `Password was not supplied in the body of the request`,
        403: `The user does not have permission to perform the operation.`,
      },
    });
  }

  /**
   * Create a new user in the default source.
   * @returns ApiUser successful operation
   * @throws ApiError
   */
  public static createUser(
    data: SecurityManagementUsersData['CreateUser'] = {},
  ): CancelablePromise<ApiUser> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/security/users',
      body: body,
      errors: {
        400: `Password was not supplied in the body of the request`,
        403: `The user does not have permission to perform the operation.`,
      },
    });
  }
}

export class SecurityManagementPrivilegesService {
  /**
   * Retrieve a list of privileges.
   * @returns ApiPrivilege successful operation
   * @throws ApiError
   */
  public static getPrivileges(): CancelablePromise<Array<ApiPrivilege>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/security/privileges',
      errors: {
        403: `The user does not have permission to perform the operation.`,
      },
    });
  }

  /**
   * Retrieve a privilege by name.
   * @returns ApiPrivilege successful operation
   * @throws ApiError
   */
  public static getPrivilege(
    data: SecurityManagementPrivilegesData['GetPrivilege'],
  ): CancelablePromise<ApiPrivilege> {
    const { privilegeName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/security/privileges/{privilegeName}',
      path: {
        privilegeName,
      },
      errors: {
        403: `The user does not have permission to perform the operation.`,
        404: `Privilege not found in the system.`,
      },
    });
  }

  /**
   * Delete a privilege by name.
   * @throws ApiError
   */
  public static deletePrivilege(
    data: SecurityManagementPrivilegesData['DeletePrivilege'],
  ): CancelablePromise<void> {
    const { privilegeName } = data;
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/security/privileges/{privilegeName}',
      path: {
        privilegeName,
      },
      errors: {
        400: `The privilege is internal and may not be altered.`,
        403: `The user does not have permission to perform the operation.`,
        404: `Privilege not found in the system.`,
      },
    });
  }

  /**
   * Create a wildcard type privilege.
   * @throws ApiError
   */
  public static createPrivilege(
    data: SecurityManagementPrivilegesData['CreatePrivilege'] = {},
  ): CancelablePromise<void> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/security/privileges/wildcard',
      body: body,
      errors: {
        400: `Privilege object not configured properly.`,
        403: `The user does not have permission to perform the operation.`,
      },
    });
  }

  /**
   * Create an application type privilege.
   * @throws ApiError
   */
  public static createPrivilege1(
    data: SecurityManagementPrivilegesData['CreatePrivilege1'] = {},
  ): CancelablePromise<void> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/security/privileges/application',
      body: body,
      errors: {
        400: `Privilege object not configured properly.`,
        403: `The user does not have permission to perform the operation.`,
      },
    });
  }

  /**
   * Update a wildcard type privilege.
   * @throws ApiError
   */
  public static updatePrivilege(
    data: SecurityManagementPrivilegesData['UpdatePrivilege'],
  ): CancelablePromise<void> {
    const { privilegeName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/security/privileges/wildcard/{privilegeName}',
      path: {
        privilegeName,
      },
      body: body,
      errors: {
        400: `Privilege object not configured properly.`,
        403: `The user does not have permission to perform the operation.`,
        404: `Privilege not found in the system.`,
      },
    });
  }

  /**
   * Update an application type privilege.
   * @throws ApiError
   */
  public static updatePrivilege1(
    data: SecurityManagementPrivilegesData['UpdatePrivilege1'],
  ): CancelablePromise<void> {
    const { privilegeName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/security/privileges/application/{privilegeName}',
      path: {
        privilegeName,
      },
      body: body,
      errors: {
        400: `Privilege object not configured properly.`,
        403: `The user does not have permission to perform the operation.`,
        404: `Privilege not found in the system.`,
      },
    });
  }

  /**
   * Create a repository content selector type privilege.
   * @throws ApiError
   */
  public static createPrivilege2(
    data: SecurityManagementPrivilegesData['CreatePrivilege2'] = {},
  ): CancelablePromise<void> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/security/privileges/repository-content-selector',
      body: body,
      errors: {
        400: `Privilege object not configured properly.`,
        403: `The user does not have permission to perform the operation.`,
      },
    });
  }

  /**
   * Create a repository admin type privilege.
   * @throws ApiError
   */
  public static createPrivilege3(
    data: SecurityManagementPrivilegesData['CreatePrivilege3'] = {},
  ): CancelablePromise<void> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/security/privileges/repository-admin',
      body: body,
      errors: {
        400: `Privilege object not configured properly.`,
        403: `The user does not have permission to perform the operation.`,
      },
    });
  }

  /**
   * Create a repository view type privilege.
   * @throws ApiError
   */
  public static createPrivilege4(
    data: SecurityManagementPrivilegesData['CreatePrivilege4'] = {},
  ): CancelablePromise<void> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/security/privileges/repository-view',
      body: body,
      errors: {
        400: `Privilege object not configured properly.`,
        403: `The user does not have permission to perform the operation.`,
      },
    });
  }

  /**
   * Update a repository view type privilege.
   * @throws ApiError
   */
  public static updatePrivilege2(
    data: SecurityManagementPrivilegesData['UpdatePrivilege2'],
  ): CancelablePromise<void> {
    const { privilegeName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/security/privileges/repository-view/{privilegeName}',
      path: {
        privilegeName,
      },
      body: body,
      errors: {
        400: `Privilege object not configured properly.`,
        403: `The user does not have permission to perform the operation.`,
        404: `Privilege not found in the system.`,
      },
    });
  }

  /**
   * Update a repository content selector type privilege.
   * @throws ApiError
   */
  public static updatePrivilege3(
    data: SecurityManagementPrivilegesData['UpdatePrivilege3'],
  ): CancelablePromise<void> {
    const { privilegeName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/security/privileges/repository-content-selector/{privilegeName}',
      path: {
        privilegeName,
      },
      body: body,
      errors: {
        400: `Privilege object not configured properly.`,
        403: `The user does not have permission to perform the operation.`,
        404: `Privilege not found in the system.`,
      },
    });
  }

  /**
   * Update a repository admin type privilege.
   * @throws ApiError
   */
  public static updatePrivilege4(
    data: SecurityManagementPrivilegesData['UpdatePrivilege4'],
  ): CancelablePromise<void> {
    const { privilegeName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/security/privileges/repository-admin/{privilegeName}',
      path: {
        privilegeName,
      },
      body: body,
      errors: {
        400: `Privilege object not configured properly.`,
        403: `The user does not have permission to perform the operation.`,
        404: `Privilege not found in the system.`,
      },
    });
  }

  /**
   * Create a script type privilege.
   * @throws ApiError
   */
  public static createPrivilege5(
    data: SecurityManagementPrivilegesData['CreatePrivilege5'] = {},
  ): CancelablePromise<void> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/security/privileges/script',
      body: body,
      errors: {
        400: `Privilege object not configured properly.`,
        403: `The user does not have permission to perform the operation.`,
      },
    });
  }

  /**
   * Update a script type privilege.
   * @throws ApiError
   */
  public static updatePrivilege5(
    data: SecurityManagementPrivilegesData['UpdatePrivilege5'],
  ): CancelablePromise<void> {
    const { privilegeName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/security/privileges/script/{privilegeName}',
      path: {
        privilegeName,
      },
      body: body,
      errors: {
        400: `Privilege object not configured properly.`,
        403: `The user does not have permission to perform the operation.`,
        404: `Privilege not found in the system.`,
      },
    });
  }
}

export class SecurityManagementRealmsService {
  /**
   * List the active realm IDs in order
   * @returns string successful operation
   * @throws ApiError
   */
  public static getActiveRealms(): CancelablePromise<Array<string>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/security/realms/active',
    });
  }

  /**
   * Set the active security realms in the order they should be used
   * @returns any successful operation
   * @throws ApiError
   */
  public static setActiveRealms(
    data: SecurityManagementRealmsData['SetActiveRealms'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/security/realms/active',
      body: body,
    });
  }

  /**
   * List the available realms
   * @returns RealmApiXO successful operation
   * @throws ApiError
   */
  public static getRealms(): CancelablePromise<Array<RealmApiXO>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/security/realms/available',
    });
  }
}

export class SecurityManagementRolesService {
  /**
   * List roles
   * @returns RoleXOResponse successful operation
   * @throws ApiError
   */
  public static getRoles(
    data: SecurityManagementRolesData['GetRoles'] = {},
  ): CancelablePromise<Array<RoleXOResponse>> {
    const { source } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/security/roles',
      query: {
        source,
      },
      errors: {
        400: `The specified source does not exist`,
        403: `Insufficient permissions to read roles`,
      },
    });
  }

  /**
   * Create role
   * @returns RoleXOResponse successful operation
   * @throws ApiError
   */
  public static create(
    data: SecurityManagementRolesData['Create'],
  ): CancelablePromise<RoleXOResponse> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/security/roles',
      body: body,
      errors: {
        403: `Insufficient permissions to create role`,
      },
    });
  }

  /**
   * Get role
   * @returns RoleXOResponse successful operation
   * @throws ApiError
   */
  public static getRole(
    data: SecurityManagementRolesData['GetRole'],
  ): CancelablePromise<RoleXOResponse> {
    const { id, source = 'default' } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/security/roles/{id}',
      path: {
        id,
      },
      query: {
        source,
      },
      errors: {
        400: `The specified source does not exist`,
        403: `Insufficient permissions to read roles`,
        404: `Role not found`,
      },
    });
  }

  /**
   * Update role
   * @throws ApiError
   */
  public static update1(
    data: SecurityManagementRolesData['Update1'],
  ): CancelablePromise<void> {
    const { id, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/security/roles/{id}',
      path: {
        id,
      },
      body: body,
      errors: {
        403: `Insufficient permissions to update role`,
        404: `Role not found`,
      },
    });
  }

  /**
   * Delete role
   * @throws ApiError
   */
  public static delete(
    data: SecurityManagementRolesData['Delete'],
  ): CancelablePromise<void> {
    const { id } = data;
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/security/roles/{id}',
      path: {
        id,
      },
      errors: {
        403: `Insufficient permissions to delete role`,
        404: `Role not found`,
      },
    });
  }
}

export class TasksService {
  /**
   * List tasks
   * @returns PageTaskXO successful operation
   * @throws ApiError
   */
  public static getTasks(
    data: TasksData['GetTasks'] = {},
  ): CancelablePromise<PageTaskXO> {
    const { type } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/tasks',
      query: {
        type,
      },
    });
  }

  /**
   * Get a single task by id
   * @returns TaskXO successful operation
   * @throws ApiError
   */
  public static getTaskById(
    data: TasksData['GetTaskById'],
  ): CancelablePromise<TaskXO> {
    const { id } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/tasks/{id}',
      path: {
        id,
      },
      errors: {
        404: `Task not found`,
      },
    });
  }

  /**
   * Run task
   * @returns void Task was run
   * @throws ApiError
   */
  public static run(data: TasksData['Run']): CancelablePromise<void> {
    const { id } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/tasks/{id}/run',
      path: {
        id,
      },
      errors: {
        404: `Task not found`,
        405: `Task is disabled`,
      },
    });
  }

  /**
   * Stop task
   * @returns void Task was stopped
   * @throws ApiError
   */
  public static stop(data: TasksData['Stop']): CancelablePromise<void> {
    const { id } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/tasks/{id}/stop',
      path: {
        id,
      },
      errors: {
        404: `Task not found`,
        409: `Unable to stop task`,
      },
    });
  }
}

export class BlobStoreService {
  /**
   * Get quota status for a given blob store
   * @returns BlobStoreQuotaResultXO successful operation
   * @throws ApiError
   */
  public static quotaStatus(
    data: BlobStoreData['QuotaStatus'],
  ): CancelablePromise<BlobStoreQuotaResultXO> {
    const { name } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/blobstores/{name}/quota-status',
      path: {
        name,
      },
    });
  }

  /**
   * Delete a blob store by name
   * @returns any successful operation
   * @throws ApiError
   */
  public static deleteBlobStore(
    data: BlobStoreData['DeleteBlobStore'],
  ): CancelablePromise<any> {
    const { name } = data;
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/blobstores/{name}',
      path: {
        name,
      },
    });
  }

  /**
   * List the blob stores
   * @returns GenericBlobStoreApiResponse successful operation
   * @throws ApiError
   */
  public static listBlobStores(): CancelablePromise<
    Array<GenericBlobStoreApiResponse>
  > {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/blobstores',
    });
  }

  /**
   * Create a file blob store
   * @returns void Success
   * @throws ApiError
   */
  public static createFileBlobStore(
    data: BlobStoreData['CreateFileBlobStore'] = {},
  ): CancelablePromise<void> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/blobstores/file',
      body: body,
      errors: {
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get a file blob store configuration by name
   * @returns FileBlobStoreApiModel Success
   * @throws ApiError
   */
  public static getFileBlobStoreConfiguration(
    data: BlobStoreData['GetFileBlobStoreConfiguration'],
  ): CancelablePromise<FileBlobStoreApiModel> {
    const { name } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/blobstores/file/{name}',
      path: {
        name,
      },
      errors: {
        403: `Insufficient permissions`,
        404: `Blob store not found`,
      },
    });
  }

  /**
   * Update a file blob store configuration by name
   * @returns void Success
   * @throws ApiError
   */
  public static updateFileBlobStore(
    data: BlobStoreData['UpdateFileBlobStore'],
  ): CancelablePromise<void> {
    const { name, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/blobstores/file/{name}',
      path: {
        name,
      },
      body: body,
      errors: {
        403: `Insufficient permissions`,
        404: `Blob store not found`,
      },
    });
  }

  /**
   * Get a S3 blob store configuration by name
   * @returns S3BlobStoreApiModel Success
   * @throws ApiError
   */
  public static getBlobStore(
    data: BlobStoreData['GetBlobStore'],
  ): CancelablePromise<S3BlobStoreApiModel> {
    const { name } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/blobstores/s3/{name}',
      path: {
        name,
      },
      errors: {
        400: `Specified S3 blob store doesn't exist`,
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Update an S3 blob store configuration by name
   * @returns void S3 blob store updated
   * @throws ApiError
   */
  public static updateBlobStore(
    data: BlobStoreData['UpdateBlobStore'],
  ): CancelablePromise<void> {
    const { name, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/blobstores/s3/{name}',
      path: {
        name,
      },
      body: body,
      errors: {
        400: `Specified S3 blob store doesn't exist`,
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create an S3 blob store
   * @returns any S3 blob store created
   * @throws ApiError
   */
  public static createBlobStore(
    data: BlobStoreData['CreateBlobStore'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/blobstores/s3',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get an Azure blob store configuration by name
   * @returns AzureBlobStoreApiModel Success
   * @throws ApiError
   */
  public static getBlobStore1(
    data: BlobStoreData['GetBlobStore1'],
  ): CancelablePromise<AzureBlobStoreApiModel> {
    const { name } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/blobstores/azure/{name}',
      path: {
        name,
      },
      errors: {
        400: `Specified Azure blob store doesn't exist`,
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Update an Azure blob store configuration by name
   * @returns void Azure blob store updated
   * @throws ApiError
   */
  public static updateBlobStore1(
    data: BlobStoreData['UpdateBlobStore1'],
  ): CancelablePromise<void> {
    const { name, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/blobstores/azure/{name}',
      path: {
        name,
      },
      body: body,
      errors: {
        400: `Specified Azure blob store doesn't exist`,
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create an Azure blob store
   * @returns any Azure blob store created
   * @throws ApiError
   */
  public static createBlobStore1(
    data: BlobStoreData['CreateBlobStore1'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/blobstores/azure',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }
}

export class LifecycleService {
  /**
   * Bounce lifecycle phase
   * Re-runs all phases from the given phase to the current phase
   * @returns any successful operation
   * @throws ApiError
   */
  public static bounce(
    data: LifecycleData['Bounce'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/lifecycle/bounce',
      body: body,
    });
  }

  /**
   * Get current lifecycle phase
   * @returns string successful operation
   * @throws ApiError
   */
  public static getPhase(): CancelablePromise<string> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/lifecycle/phase',
    });
  }

  /**
   * Move to new lifecycle phase
   * @returns any successful operation
   * @throws ApiError
   */
  public static setPhase(
    data: LifecycleData['SetPhase'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/lifecycle/phase',
      body: body,
    });
  }
}

export class ReadOnlyService {
  /**
   * Enable read-only
   * @returns void System is now read-only
   * @throws ApiError
   */
  public static freeze(): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/read-only/freeze',
      errors: {
        403: `Authentication required`,
        404: `No change to read-only state`,
      },
    });
  }

  /**
   * Forcibly release read-only
   * Forcibly release read-only status, including System initiated tasks. Warning: may result in data loss.
   * @returns void System is no longer read-only
   * @throws ApiError
   */
  public static forceRelease(): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/read-only/force-release',
      errors: {
        403: `Authentication required`,
        404: `No change to read-only state`,
      },
    });
  }

  /**
   * Release read-only
   * Release administrator initiated read-only status. Will not release read-only caused by system tasks.
   * @returns void System is no longer read-only
   * @throws ApiError
   */
  public static release(): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/read-only/release',
      errors: {
        403: `Authentication required`,
        404: `No change to read-only state`,
      },
    });
  }

  /**
   * Get read-only state
   * @returns ReadOnlyState successful operation
   * @throws ApiError
   */
  public static get(): CancelablePromise<ReadOnlyState> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/read-only',
    });
  }
}

export class SecurityCertificatesService {
  /**
   * Helper method to retrieve certificate details from a remote system.
   * @returns ApiCertificate successful operation
   * @throws ApiError
   */
  public static retrieveCertificate(
    data: SecurityCertificatesData['RetrieveCertificate'],
  ): CancelablePromise<ApiCertificate> {
    const { host, port = 443, protocolHint } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/security/ssl',
      query: {
        host,
        port,
        protocolHint,
      },
      errors: {
        400: `A certificate could not be retrieved, see the message for details.`,
        403: `Insufficient permissions to retrieve remote certificate.`,
      },
    });
  }

  /**
   * Retrieve a list of certificates added to the trust store.
   * @returns ApiCertificate successful operation
   * @throws ApiError
   */
  public static getTrustStoreCertificates(): CancelablePromise<
    Array<ApiCertificate>
  > {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/security/ssl/truststore',
      errors: {
        403: `Insufficient permissions to list certificates in the trust store.`,
      },
    });
  }

  /**
   * Add a certificate to the trust store.
   * @returns ApiCertificate The certificate was successfully added.
   * @throws ApiError
   */
  public static addCertificate(
    data: SecurityCertificatesData['AddCertificate'] = {},
  ): CancelablePromise<ApiCertificate> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/security/ssl/truststore',
      body: body,
      errors: {
        403: `Insufficient permissions to add certificate to the trust store.`,
        409: `The certificate already exists in the system.`,
      },
    });
  }

  /**
   * Remove a certificate in the trust store.
   * @throws ApiError
   */
  public static removeCertificate(
    data: SecurityCertificatesData['RemoveCertificate'],
  ): CancelablePromise<void> {
    const { id } = data;
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/security/ssl/truststore/{id}',
      path: {
        id,
      },
      errors: {
        403: `Insufficient permissions to remove certificate from the trust store`,
      },
    });
  }
}

export class AssetsService {
  /**
   * Get a single asset
   * @returns AssetXO successful operation
   * @throws ApiError
   */
  public static getAssetById(
    data: AssetsData['GetAssetById'],
  ): CancelablePromise<AssetXO> {
    const { id } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/assets/{id}',
      path: {
        id,
      },
      errors: {
        403: `Insufficient permissions to get asset`,
        404: `Asset not found`,
        422: `Malformed ID`,
      },
    });
  }

  /**
   * Delete a single asset
   * @returns void Asset was successfully deleted
   * @throws ApiError
   */
  public static deleteAsset(
    data: AssetsData['DeleteAsset'],
  ): CancelablePromise<void> {
    const { id } = data;
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/assets/{id}',
      path: {
        id,
      },
      errors: {
        403: `Insufficient permissions to delete asset`,
        404: `Asset not found`,
        422: `Malformed ID`,
      },
    });
  }

  /**
   * List assets
   * @returns PageAssetXO successful operation
   * @throws ApiError
   */
  public static getAssets(
    data: AssetsData['GetAssets'],
  ): CancelablePromise<PageAssetXO> {
    const { repository, continuationToken } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/assets',
      query: {
        continuationToken,
        repository,
      },
      errors: {
        403: `Insufficient permissions to list assets`,
        422: `Parameter 'repository' is required`,
      },
    });
  }
}

export class ComponentsService {
  /**
   * Get a single component
   * @returns ComponentXO successful operation
   * @throws ApiError
   */
  public static getComponentById(
    data: ComponentsData['GetComponentById'],
  ): CancelablePromise<ComponentXO> {
    const { id } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/components/{id}',
      path: {
        id,
      },
      errors: {
        403: `Insufficient permissions to get component`,
        404: `Component not found`,
        422: `Malformed ID`,
      },
    });
  }

  /**
   * Delete a single component
   * @returns void Component was successfully deleted
   * @throws ApiError
   */
  public static deleteComponent(
    data: ComponentsData['DeleteComponent'],
  ): CancelablePromise<void> {
    const { id } = data;
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/components/{id}',
      path: {
        id,
      },
      errors: {
        403: `Insufficient permissions to delete component`,
        404: `Component not found`,
        422: `Malformed ID`,
      },
    });
  }

  /**
   * List components
   * @returns PageComponentXO successful operation
   * @throws ApiError
   */
  public static getComponents(
    data: ComponentsData['GetComponents'],
  ): CancelablePromise<PageComponentXO> {
    const { repository, continuationToken } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/components',
      query: {
        continuationToken,
        repository,
      },
      errors: {
        403: `Insufficient permissions to list components`,
        422: `Parameter 'repository' is required`,
      },
    });
  }

  /**
   * Upload a single component
   * @throws ApiError
   */
  public static uploadComponent(
    data: ComponentsData['UploadComponent'],
  ): CancelablePromise<void> {
    const {
      repository,
      rAsset,
      rAssetPathId,
      pypiAsset,
      helmAsset,
      yumDirectory,
      yumAsset,
      yumAssetFilename,
      dockerAsset,
      rubygemsAsset,
      nugetAsset,
      npmAsset,
      rawDirectory,
      rawAsset1,
      rawAsset1Filename,
      rawAsset2,
      rawAsset2Filename,
      rawAsset3,
      rawAsset3Filename,
      aptAsset,
      maven2GroupId,
      maven2ArtifactId,
      maven2Version,
      maven2GeneratePom,
      maven2Packaging,
      maven2Asset1,
      maven2Asset1Classifier,
      maven2Asset1Extension,
      maven2Asset2,
      maven2Asset2Classifier,
      maven2Asset2Extension,
      maven2Asset3,
      maven2Asset3Classifier,
      maven2Asset3Extension,
    } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/components',
      query: {
        repository,
      },
      formData: {
        'r.asset': rAsset,
        'r.asset.pathId': rAssetPathId,
        'pypi.asset': pypiAsset,
        'helm.asset': helmAsset,
        'yum.directory': yumDirectory,
        'yum.asset': yumAsset,
        'yum.asset.filename': yumAssetFilename,
        'docker.asset': dockerAsset,
        'rubygems.asset': rubygemsAsset,
        'nuget.asset': nugetAsset,
        'npm.asset': npmAsset,
        'raw.directory': rawDirectory,
        'raw.asset1': rawAsset1,
        'raw.asset1.filename': rawAsset1Filename,
        'raw.asset2': rawAsset2,
        'raw.asset2.filename': rawAsset2Filename,
        'raw.asset3': rawAsset3,
        'raw.asset3.filename': rawAsset3Filename,
        'apt.asset': aptAsset,
        'maven2.groupId': maven2GroupId,
        'maven2.artifactId': maven2ArtifactId,
        'maven2.version': maven2Version,
        'maven2.generate-pom': maven2GeneratePom,
        'maven2.packaging': maven2Packaging,
        'maven2.asset1': maven2Asset1,
        'maven2.asset1.classifier': maven2Asset1Classifier,
        'maven2.asset1.extension': maven2Asset1Extension,
        'maven2.asset2': maven2Asset2,
        'maven2.asset2.classifier': maven2Asset2Classifier,
        'maven2.asset2.extension': maven2Asset2Extension,
        'maven2.asset3': maven2Asset3,
        'maven2.asset3.classifier': maven2Asset3Classifier,
        'maven2.asset3.extension': maven2Asset3Extension,
      },
      errors: {
        403: `Insufficient permissions to upload a component`,
        422: `Parameter 'repository' is required`,
      },
    });
  }
}

export class RepositoryManagementService {
  /**
   * Schedule a 'Repair - Rebuild repository search' Task. Hosted or proxy repositories only.
   * @returns void Repository search index rebuild has been scheduled
   * @throws ApiError
   */
  public static rebuildIndex(
    data: RepositoryManagementData['RebuildIndex'],
  ): CancelablePromise<void> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/{repositoryName}/rebuild-index',
      path: {
        repositoryName,
      },
      errors: {
        400: `Repository is not of hosted or proxy type`,
        401: `Authentication required`,
        403: `Insufficient permissions`,
        404: `Repository not found`,
      },
    });
  }

  /**
   * Invalidate repository cache. Proxy or group repositories only.
   * @returns void Repository cache invalidated
   * @throws ApiError
   */
  public static invalidateCache(
    data: RepositoryManagementData['InvalidateCache'],
  ): CancelablePromise<void> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/{repositoryName}/invalidate-cache',
      path: {
        repositoryName,
      },
      errors: {
        400: `Repository is not of proxy or group type`,
        401: `Authentication required`,
        403: `Insufficient permissions`,
        404: `Repository not found`,
      },
    });
  }

  /**
   * Get repository details
   * @returns RepositoryXO successful operation
   * @throws ApiError
   */
  public static getRepository(
    data: RepositoryManagementData['GetRepository'],
  ): CancelablePromise<RepositoryXO> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/{repositoryName}',
      path: {
        repositoryName,
      },
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        404: `Repository not found`,
      },
    });
  }

  /**
   * Delete repository of any format
   * @returns void Repository deleted
   * @throws ApiError
   */
  public static deleteRepository(
    data: RepositoryManagementData['DeleteRepository'],
  ): CancelablePromise<void> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/repositories/{repositoryName}',
      path: {
        repositoryName,
      },
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        404: `Repository not found`,
      },
    });
  }

  /**
   * List repositories
   * @returns AbstractApiRepository Repositories list returned
   * @throws ApiError
   */
  public static getRepositories(): CancelablePromise<
    Array<AbstractApiRepository>
  > {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositorySettings',
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * List repositories
   * @returns RepositoryXO successful operation
   * @throws ApiError
   */
  public static getRepositories1(): CancelablePromise<Array<RepositoryXO>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories',
    });
  }

  /**
   * Create Maven group repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository(
    data: RepositoryManagementData['CreateRepository'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/maven/group',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiGroupRepository successful operation
   * @throws ApiError
   */
  public static getRepository1(
    data: RepositoryManagementData['GetRepository1'],
  ): CancelablePromise<SimpleApiGroupRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/maven/group/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update Maven group repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository(
    data: RepositoryManagementData['UpdateRepository'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/maven/group/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get repository
   * @returns MavenHostedApiRepository successful operation
   * @throws ApiError
   */
  public static getRepository2(
    data: RepositoryManagementData['GetRepository2'],
  ): CancelablePromise<MavenHostedApiRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/maven/hosted/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update Maven hosted repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository1(
    data: RepositoryManagementData['UpdateRepository1'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/maven/hosted/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create Maven hosted repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository1(
    data: RepositoryManagementData['CreateRepository1'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/maven/hosted',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get repository
   * @returns MavenProxyApiRepository successful operation
   * @throws ApiError
   */
  public static getRepository3(
    data: RepositoryManagementData['GetRepository3'],
  ): CancelablePromise<MavenProxyApiRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/maven/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update Maven proxy repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository2(
    data: RepositoryManagementData['UpdateRepository2'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/maven/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create Maven proxy repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository2(
    data: RepositoryManagementData['CreateRepository2'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/maven/proxy',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get repository
   * @returns AptHostedApiRepository successful operation
   * @throws ApiError
   */
  public static getRepository4(
    data: RepositoryManagementData['GetRepository4'],
  ): CancelablePromise<AptHostedApiRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/apt/hosted/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update APT hosted repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository3(
    data: RepositoryManagementData['UpdateRepository3'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/apt/hosted/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        404: `Repository not found`,
      },
    });
  }

  /**
   * Create APT hosted repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository3(
    data: RepositoryManagementData['CreateRepository3'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/apt/hosted',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        405: `Feature is disabled in High Availability`,
      },
    });
  }

  /**
   * Get repository
   * @returns AptProxyApiRepository successful operation
   * @throws ApiError
   */
  public static getRepository5(
    data: RepositoryManagementData['GetRepository5'],
  ): CancelablePromise<AptProxyApiRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/apt/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update APT proxy repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository4(
    data: RepositoryManagementData['UpdateRepository4'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/apt/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        404: `Repository not found`,
      },
    });
  }

  /**
   * Create APT proxy repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository4(
    data: RepositoryManagementData['CreateRepository4'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/apt/proxy',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        405: `Feature is disabled in High Availability`,
      },
    });
  }

  /**
   * Create raw group repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository5(
    data: RepositoryManagementData['CreateRepository5'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/raw/group',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiGroupRepository successful operation
   * @throws ApiError
   */
  public static getRepository6(
    data: RepositoryManagementData['GetRepository6'],
  ): CancelablePromise<SimpleApiGroupRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/raw/group/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update raw group repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository5(
    data: RepositoryManagementData['UpdateRepository5'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/raw/group/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create raw hosted repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository6(
    data: RepositoryManagementData['CreateRepository6'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/raw/hosted',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiHostedRepository successful operation
   * @throws ApiError
   */
  public static getRepository7(
    data: RepositoryManagementData['GetRepository7'],
  ): CancelablePromise<SimpleApiHostedRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/raw/hosted/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update raw hosted repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository6(
    data: RepositoryManagementData['UpdateRepository6'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/raw/hosted/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create raw proxy repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository7(
    data: RepositoryManagementData['CreateRepository7'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/raw/proxy',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiProxyRepository successful operation
   * @throws ApiError
   */
  public static getRepository8(
    data: RepositoryManagementData['GetRepository8'],
  ): CancelablePromise<SimpleApiProxyRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/raw/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update raw proxy repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository7(
    data: RepositoryManagementData['UpdateRepository7'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/raw/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Enable repository health check. Proxy repositories only.
   * @returns void Repository Health Check enabled
   * @throws ApiError
   */
  public static enableRepositoryHealthCheck(
    data: RepositoryManagementData['EnableRepositoryHealthCheck'],
  ): CancelablePromise<void> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/{repositoryName}/health-check',
      path: {
        repositoryName,
      },
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        404: `Repository not found`,
        409: `EULA not accepted or Repository Health Check capability not active`,
      },
    });
  }

  /**
   * Disable repository health check. Proxy repositories only.
   * @returns void Repository Health Check disabled
   * @throws ApiError
   */
  public static disableRepositoryHealthCheck(
    data: RepositoryManagementData['DisableRepositoryHealthCheck'],
  ): CancelablePromise<void> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/repositories/{repositoryName}/health-check',
      path: {
        repositoryName,
      },
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        404: `Repository not found`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiGroupDeployRepository successful operation
   * @throws ApiError
   */
  public static getRepository9(
    data: RepositoryManagementData['GetRepository9'],
  ): CancelablePromise<SimpleApiGroupDeployRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/npm/group/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update npm group repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository8(
    data: RepositoryManagementData['UpdateRepository8'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/npm/group/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create npm group repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository8(
    data: RepositoryManagementData['CreateRepository8'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/npm/group',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create npm hosted repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository9(
    data: RepositoryManagementData['CreateRepository9'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/npm/hosted',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiHostedRepository successful operation
   * @throws ApiError
   */
  public static getRepository10(
    data: RepositoryManagementData['GetRepository10'],
  ): CancelablePromise<SimpleApiHostedRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/npm/hosted/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update npm hosted repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository9(
    data: RepositoryManagementData['UpdateRepository9'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/npm/hosted/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get repository
   * @returns NpmProxyApiRepository successful operation
   * @throws ApiError
   */
  public static getRepository11(
    data: RepositoryManagementData['GetRepository11'],
  ): CancelablePromise<NpmProxyApiRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/npm/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update npm proxy repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository10(
    data: RepositoryManagementData['UpdateRepository10'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/npm/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create npm proxy repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository10(
    data: RepositoryManagementData['CreateRepository10'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/npm/proxy',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create NuGet group repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository11(
    data: RepositoryManagementData['CreateRepository11'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/nuget/group',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiGroupRepository successful operation
   * @throws ApiError
   */
  public static getRepository12(
    data: RepositoryManagementData['GetRepository12'],
  ): CancelablePromise<SimpleApiGroupRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/nuget/group/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update NuGet group repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository11(
    data: RepositoryManagementData['UpdateRepository11'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/nuget/group/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create NuGet hosted repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository12(
    data: RepositoryManagementData['CreateRepository12'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/nuget/hosted',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiHostedRepository successful operation
   * @throws ApiError
   */
  public static getRepository13(
    data: RepositoryManagementData['GetRepository13'],
  ): CancelablePromise<SimpleApiHostedRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/nuget/hosted/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update NuGet hosted repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository12(
    data: RepositoryManagementData['UpdateRepository12'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/nuget/hosted/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get repository
   * @returns NugetProxyApiRepository successful operation
   * @throws ApiError
   */
  public static getRepository14(
    data: RepositoryManagementData['GetRepository14'],
  ): CancelablePromise<NugetProxyApiRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/nuget/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update NuGet proxy repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository13(
    data: RepositoryManagementData['UpdateRepository13'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/nuget/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create NuGet proxy repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository13(
    data: RepositoryManagementData['CreateRepository13'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/nuget/proxy',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create RubyGems group repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository14(
    data: RepositoryManagementData['CreateRepository14'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/rubygems/group',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiGroupRepository successful operation
   * @throws ApiError
   */
  public static getRepository15(
    data: RepositoryManagementData['GetRepository15'],
  ): CancelablePromise<SimpleApiGroupRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/rubygems/group/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update RubyGems group repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository14(
    data: RepositoryManagementData['UpdateRepository14'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/rubygems/group/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create RubyGems hosted repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository15(
    data: RepositoryManagementData['CreateRepository15'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/rubygems/hosted',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiHostedRepository successful operation
   * @throws ApiError
   */
  public static getRepository16(
    data: RepositoryManagementData['GetRepository16'],
  ): CancelablePromise<SimpleApiHostedRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/rubygems/hosted/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update RubyGems hosted repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository15(
    data: RepositoryManagementData['UpdateRepository15'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/rubygems/hosted/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create RubyGems proxy repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository16(
    data: RepositoryManagementData['CreateRepository16'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/rubygems/proxy',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiProxyRepository successful operation
   * @throws ApiError
   */
  public static getRepository17(
    data: RepositoryManagementData['GetRepository17'],
  ): CancelablePromise<SimpleApiProxyRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/rubygems/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update RubyGems proxy repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository16(
    data: RepositoryManagementData['UpdateRepository16'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/rubygems/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get repository
   * @returns DockerGroupApiRepository successful operation
   * @throws ApiError
   */
  public static getRepository18(
    data: RepositoryManagementData['GetRepository18'],
  ): CancelablePromise<DockerGroupApiRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/docker/group/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update Docker group repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository17(
    data: RepositoryManagementData['UpdateRepository17'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/docker/group/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        404: `Repository not found`,
      },
    });
  }

  /**
   * Create Docker group repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository17(
    data: RepositoryManagementData['CreateRepository17'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/docker/group',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get repository
   * @returns DockerHostedApiRepository successful operation
   * @throws ApiError
   */
  public static getRepository19(
    data: RepositoryManagementData['GetRepository19'],
  ): CancelablePromise<DockerHostedApiRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/docker/hosted/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update Docker hosted repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository18(
    data: RepositoryManagementData['UpdateRepository18'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/docker/hosted/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        404: `Repository not found`,
      },
    });
  }

  /**
   * Create Docker hosted repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository18(
    data: RepositoryManagementData['CreateRepository18'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/docker/hosted',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Repository not found`,
      },
    });
  }

  /**
   * Get repository
   * @returns DockerProxyApiRepository successful operation
   * @throws ApiError
   */
  public static getRepository20(
    data: RepositoryManagementData['GetRepository20'],
  ): CancelablePromise<DockerProxyApiRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/docker/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update Docker group repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository19(
    data: RepositoryManagementData['UpdateRepository19'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/docker/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        404: `Repository not found`,
      },
    });
  }

  /**
   * Create Docker proxy repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository19(
    data: RepositoryManagementData['CreateRepository19'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/docker/proxy',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create Yum group repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository20(
    data: RepositoryManagementData['CreateRepository20'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/yum/group',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiGroupRepository successful operation
   * @throws ApiError
   */
  public static getRepository21(
    data: RepositoryManagementData['GetRepository21'],
  ): CancelablePromise<SimpleApiGroupRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/yum/group/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update Yum group repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository20(
    data: RepositoryManagementData['UpdateRepository20'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/yum/group/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get repository
   * @returns YumHostedApiRepository successful operation
   * @throws ApiError
   */
  public static getRepository22(
    data: RepositoryManagementData['GetRepository22'],
  ): CancelablePromise<YumHostedApiRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/yum/hosted/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update Yum hosted repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository21(
    data: RepositoryManagementData['UpdateRepository21'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/yum/hosted/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create Yum hosted repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository21(
    data: RepositoryManagementData['CreateRepository21'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/yum/hosted',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create Yum proxy repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository22(
    data: RepositoryManagementData['CreateRepository22'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/yum/proxy',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiProxyRepository successful operation
   * @throws ApiError
   */
  public static getRepository23(
    data: RepositoryManagementData['GetRepository23'],
  ): CancelablePromise<SimpleApiProxyRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/yum/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update Yum proxy repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository22(
    data: RepositoryManagementData['UpdateRepository22'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/yum/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create Helm hosted repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository23(
    data: RepositoryManagementData['CreateRepository23'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/helm/hosted',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        405: `Feature is disabled in High Availability`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiHostedRepository successful operation
   * @throws ApiError
   */
  public static getRepository24(
    data: RepositoryManagementData['GetRepository24'],
  ): CancelablePromise<SimpleApiHostedRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/helm/hosted/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update Helm hosted repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository23(
    data: RepositoryManagementData['UpdateRepository23'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/helm/hosted/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create Helm proxy repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository24(
    data: RepositoryManagementData['CreateRepository24'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/helm/proxy',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        405: `Feature is disabled in High Availability`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiProxyRepository successful operation
   * @throws ApiError
   */
  public static getRepository25(
    data: RepositoryManagementData['GetRepository25'],
  ): CancelablePromise<SimpleApiProxyRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/helm/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update Helm proxy repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository24(
    data: RepositoryManagementData['UpdateRepository24'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/helm/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create Git LFS hosted repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository25(
    data: RepositoryManagementData['CreateRepository25'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/gitlfs/hosted',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiHostedRepository successful operation
   * @throws ApiError
   */
  public static getRepository26(
    data: RepositoryManagementData['GetRepository26'],
  ): CancelablePromise<SimpleApiHostedRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/gitlfs/hosted/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update Git LFS hosted repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository25(
    data: RepositoryManagementData['UpdateRepository25'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/gitlfs/hosted/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create PyPI group repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository26(
    data: RepositoryManagementData['CreateRepository26'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/pypi/group',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiGroupRepository successful operation
   * @throws ApiError
   */
  public static getRepository27(
    data: RepositoryManagementData['GetRepository27'],
  ): CancelablePromise<SimpleApiGroupRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/pypi/group/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update PyPI group repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository26(
    data: RepositoryManagementData['UpdateRepository26'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/pypi/group/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create PyPI hosted repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository27(
    data: RepositoryManagementData['CreateRepository27'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/pypi/hosted',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiHostedRepository successful operation
   * @throws ApiError
   */
  public static getRepository28(
    data: RepositoryManagementData['GetRepository28'],
  ): CancelablePromise<SimpleApiHostedRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/pypi/hosted/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update PyPI hosted repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository27(
    data: RepositoryManagementData['UpdateRepository27'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/pypi/hosted/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create PyPI proxy repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository28(
    data: RepositoryManagementData['CreateRepository28'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/pypi/proxy',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiProxyRepository successful operation
   * @throws ApiError
   */
  public static getRepository29(
    data: RepositoryManagementData['GetRepository29'],
  ): CancelablePromise<SimpleApiProxyRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/pypi/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update PyPI proxy repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository28(
    data: RepositoryManagementData['UpdateRepository28'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/pypi/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create conda proxy repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository29(
    data: RepositoryManagementData['CreateRepository29'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/conda/proxy',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        405: `Feature is disabled in High Availability`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiProxyRepository successful operation
   * @throws ApiError
   */
  public static getRepository30(
    data: RepositoryManagementData['GetRepository30'],
  ): CancelablePromise<SimpleApiProxyRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/conda/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update conda proxy repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository29(
    data: RepositoryManagementData['UpdateRepository29'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/conda/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create Conan proxy repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository30(
    data: RepositoryManagementData['CreateRepository30'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/conan/proxy',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        405: `Feature is disabled in High Availability`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiProxyRepository successful operation
   * @throws ApiError
   */
  public static getRepository31(
    data: RepositoryManagementData['GetRepository31'],
  ): CancelablePromise<SimpleApiProxyRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/conan/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update Conan proxy repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository30(
    data: RepositoryManagementData['UpdateRepository30'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/conan/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        404: `Repository not found`,
      },
    });
  }

  /**
   * Create R group repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository31(
    data: RepositoryManagementData['CreateRepository31'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/r/group',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        405: `Feature is disabled in High Availability`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiGroupRepository successful operation
   * @throws ApiError
   */
  public static getRepository32(
    data: RepositoryManagementData['GetRepository32'],
  ): CancelablePromise<SimpleApiGroupRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/r/group/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update R group repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository31(
    data: RepositoryManagementData['UpdateRepository31'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/r/group/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create R hosted repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository32(
    data: RepositoryManagementData['CreateRepository32'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/r/hosted',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        405: `Feature is disabled in High Availability`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiHostedRepository successful operation
   * @throws ApiError
   */
  public static getRepository33(
    data: RepositoryManagementData['GetRepository33'],
  ): CancelablePromise<SimpleApiHostedRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/r/hosted/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update R hosted repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository32(
    data: RepositoryManagementData['UpdateRepository32'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/r/hosted/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create R proxy repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository33(
    data: RepositoryManagementData['CreateRepository33'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/r/proxy',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        405: `Feature is disabled in High Availability`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiProxyRepository successful operation
   * @throws ApiError
   */
  public static getRepository34(
    data: RepositoryManagementData['GetRepository34'],
  ): CancelablePromise<SimpleApiProxyRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/r/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update R proxy repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository33(
    data: RepositoryManagementData['UpdateRepository33'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/r/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        404: `Repository not found`,
      },
    });
  }

  /**
   * Create Cocoapods proxy repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository34(
    data: RepositoryManagementData['CreateRepository34'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/cocoapods/proxy',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        405: `Feature is disabled in High Availability`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiProxyRepository successful operation
   * @throws ApiError
   */
  public static getRepository35(
    data: RepositoryManagementData['GetRepository35'],
  ): CancelablePromise<SimpleApiProxyRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/cocoapods/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update Cocoapods proxy repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository34(
    data: RepositoryManagementData['UpdateRepository34'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/cocoapods/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create a Go group repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository35(
    data: RepositoryManagementData['CreateRepository35'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/go/group',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        405: `Feature is disabled in High Availability`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiGroupRepository successful operation
   * @throws ApiError
   */
  public static getRepository36(
    data: RepositoryManagementData['GetRepository36'],
  ): CancelablePromise<SimpleApiGroupRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/go/group/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update a Go group repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository35(
    data: RepositoryManagementData['UpdateRepository35'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/go/group/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        404: `Repository not found`,
      },
    });
  }

  /**
   * Create a Go proxy repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository36(
    data: RepositoryManagementData['CreateRepository36'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/go/proxy',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        405: `Feature is disabled in High Availability`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiProxyRepository successful operation
   * @throws ApiError
   */
  public static getRepository37(
    data: RepositoryManagementData['GetRepository37'],
  ): CancelablePromise<SimpleApiProxyRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/go/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update a Go proxy repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository36(
    data: RepositoryManagementData['UpdateRepository36'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/go/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        404: `Repository not found`,
      },
    });
  }

  /**
   * Create p2 proxy repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository37(
    data: RepositoryManagementData['CreateRepository37'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/p2/proxy',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        405: `Feature is disabled in High Availability`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiProxyRepository successful operation
   * @throws ApiError
   */
  public static getRepository38(
    data: RepositoryManagementData['GetRepository38'],
  ): CancelablePromise<SimpleApiProxyRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/p2/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update p2 proxy repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository37(
    data: RepositoryManagementData['UpdateRepository37'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/p2/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create Bower group repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository38(
    data: RepositoryManagementData['CreateRepository38'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/bower/group',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiGroupRepository successful operation
   * @throws ApiError
   */
  public static getRepository39(
    data: RepositoryManagementData['GetRepository39'],
  ): CancelablePromise<SimpleApiGroupRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/bower/group/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update Bower group repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository38(
    data: RepositoryManagementData['UpdateRepository38'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/bower/group/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create Bower hosted repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository39(
    data: RepositoryManagementData['CreateRepository39'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/bower/hosted',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get repository
   * @returns SimpleApiHostedRepository successful operation
   * @throws ApiError
   */
  public static getRepository40(
    data: RepositoryManagementData['GetRepository40'],
  ): CancelablePromise<SimpleApiHostedRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/bower/hosted/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update Bower hosted repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository39(
    data: RepositoryManagementData['UpdateRepository39'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/bower/hosted/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get repository
   * @returns BowerProxyApiRepository successful operation
   * @throws ApiError
   */
  public static getRepository41(
    data: RepositoryManagementData['GetRepository41'],
  ): CancelablePromise<BowerProxyApiRepository> {
    const { repositoryName } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/repositories/bower/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
    });
  }

  /**
   * Update Bower proxy repository
   * @returns void Repository updated
   * @throws ApiError
   */
  public static updateRepository40(
    data: RepositoryManagementData['UpdateRepository40'],
  ): CancelablePromise<void> {
    const { repositoryName, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/repositories/bower/proxy/{repositoryName}',
      path: {
        repositoryName,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create Bower proxy repository
   * @returns any Repository created
   * @throws ApiError
   */
  public static createRepository40(
    data: RepositoryManagementData['CreateRepository40'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/repositories/bower/proxy',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }
}

export class ContentSelectorsService {
  /**
   * List content selectors
   * @returns ContentSelectorApiResponse successful operation
   * @throws ApiError
   */
  public static getContentSelectors(): CancelablePromise<
    Array<ContentSelectorApiResponse>
  > {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/security/content-selectors',
      errors: {
        403: `Insufficient permissions to read content selectors`,
      },
    });
  }

  /**
   * Create a new content selector
   * @returns void Content selector successfully created
   * @throws ApiError
   */
  public static createContentSelector(
    data: ContentSelectorsData['CreateContentSelector'] = {},
  ): CancelablePromise<void> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/security/content-selectors',
      body: body,
      errors: {
        400: `Invalid request`,
        403: `Insufficient permissions to create content selectors`,
      },
    });
  }

  /**
   * Get a content selector by name
   * @returns ContentSelectorApiResponse successful operation
   * @throws ApiError
   */
  public static getContentSelector(
    data: ContentSelectorsData['GetContentSelector'],
  ): CancelablePromise<ContentSelectorApiResponse> {
    const { name } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/security/content-selectors/{name}',
      path: {
        name,
      },
      errors: {
        403: `Insufficient permissions to read the content selector`,
      },
    });
  }

  /**
   * Update a content selector
   * @returns void Content selector updated successfully
   * @throws ApiError
   */
  public static updateContentSelector(
    data: ContentSelectorsData['UpdateContentSelector'],
  ): CancelablePromise<void> {
    const { name, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/security/content-selectors/{name}',
      path: {
        name,
      },
      body: body,
      errors: {
        400: `Invalid request`,
        403: `Insufficient permissions to update the content selector`,
      },
    });
  }

  /**
   * Delete a content selector
   * @returns void Content selector deleted successfully
   * @throws ApiError
   */
  public static deleteContentSelector(
    data: ContentSelectorsData['DeleteContentSelector'],
  ): CancelablePromise<void> {
    const { name } = data;
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/security/content-selectors/{name}',
      path: {
        name,
      },
      errors: {
        400: `Invalid request`,
        403: `Insufficient permissions to delete the content selector`,
      },
    });
  }
}

export class RoutingRulesService {
  /**
   * Get a single routing rule
   * @returns RoutingRuleXO successful operation
   * @throws ApiError
   */
  public static getRoutingRule(
    data: RoutingRulesData['GetRoutingRule'],
  ): CancelablePromise<RoutingRuleXO> {
    const { name } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/routing-rules/{name}',
      path: {
        name,
      },
      errors: {
        403: `Insufficient permissions to read routing rules`,
        404: `Routing rule not found`,
      },
    });
  }

  /**
   * Update a single routing rule
   * @returns void Routing rule was successfully updated
   * @throws ApiError
   */
  public static updateRoutingRule(
    data: RoutingRulesData['UpdateRoutingRule'],
  ): CancelablePromise<void> {
    const { name, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/routing-rules/{name}',
      path: {
        name,
      },
      body: body,
      errors: {
        400: `Another routing rule with the same name already exists or required parameters missing`,
        403: `Insufficient permissions to edit routing rules`,
        404: `Routing rule not found`,
      },
    });
  }

  /**
   * Delete a single routing rule
   * @returns void Routing rule was successfully deleted
   * @throws ApiError
   */
  public static deleteRoutingRule(
    data: RoutingRulesData['DeleteRoutingRule'],
  ): CancelablePromise<void> {
    const { name } = data;
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/routing-rules/{name}',
      path: {
        name,
      },
      errors: {
        403: `Insufficient permissions to delete routing rules`,
        404: `Routing rule not found`,
      },
    });
  }

  /**
   * List routing rules
   * @returns RoutingRuleXO successful operation
   * @throws ApiError
   */
  public static getRoutingRules(): CancelablePromise<Array<RoutingRuleXO>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/routing-rules',
      errors: {
        403: `Insufficient permissions to read routing rules`,
      },
    });
  }

  /**
   * Create a single routing rule
   * @returns void Routing rule was successfully created
   * @throws ApiError
   */
  public static createRoutingRule(
    data: RoutingRulesData['CreateRoutingRule'],
  ): CancelablePromise<void> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/routing-rules',
      body: body,
      errors: {
        400: `A routing rule with the same name already exists or required parameters missing`,
        403: `Insufficient permissions to create routing rule`,
      },
    });
  }
}

export class SearchService {
  /**
   * Search assets
   * @returns PageAssetXO successful operation
   * @throws ApiError
   */
  public static searchAssets(
    data: SearchData['SearchAssets'] = {},
  ): CancelablePromise<PageAssetXO> {
    const {
      continuationToken,
      sort,
      direction,
      timeout,
      q,
      repository,
      format,
      group,
      name,
      version,
      prerelease,
      md5,
      sha1,
      sha256,
      sha512,
      conanBaseVersion,
      conanChannel,
      conanRevision,
      conanPackageId,
      conanPackageRevision,
      dockerImageName,
      dockerImageTag,
      dockerLayerId,
      dockerContentDigest,
      mavenGroupId,
      mavenArtifactId,
      mavenBaseVersion,
      mavenExtension,
      mavenClassifier,
      gavec,
      npmScope,
      npmAuthor,
      npmDescription,
      npmKeywords,
      npmLicense,
      npmTaggedIs,
      npmTaggedNot,
      nugetId,
      nugetTags,
      nugetTitle,
      nugetAuthors,
      nugetDescription,
      nugetSummary,
      p2PluginName,
      pypiClassifiers,
      pypiDescription,
      pypiKeywords,
      pypiSummary,
      rubygemsDescription,
      rubygemsPlatform,
      rubygemsSummary,
      yumArchitecture,
      yumName,
    } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/search/assets',
      query: {
        continuationToken,
        sort,
        direction,
        timeout,
        q,
        repository,
        format,
        group,
        name,
        version,
        prerelease,
        md5,
        sha1,
        sha256,
        sha512,
        'conan.baseVersion': conanBaseVersion,
        'conan.channel': conanChannel,
        'conan.revision': conanRevision,
        'conan.packageId': conanPackageId,
        'conan.packageRevision': conanPackageRevision,
        'docker.imageName': dockerImageName,
        'docker.imageTag': dockerImageTag,
        'docker.layerId': dockerLayerId,
        'docker.contentDigest': dockerContentDigest,
        'maven.groupId': mavenGroupId,
        'maven.artifactId': mavenArtifactId,
        'maven.baseVersion': mavenBaseVersion,
        'maven.extension': mavenExtension,
        'maven.classifier': mavenClassifier,
        gavec,
        'npm.scope': npmScope,
        'npm.author': npmAuthor,
        'npm.description': npmDescription,
        'npm.keywords': npmKeywords,
        'npm.license': npmLicense,
        'npm.tagged_is': npmTaggedIs,
        'npm.tagged_not': npmTaggedNot,
        'nuget.id': nugetId,
        'nuget.tags': nugetTags,
        'nuget.title': nugetTitle,
        'nuget.authors': nugetAuthors,
        'nuget.description': nugetDescription,
        'nuget.summary': nugetSummary,
        'p2.pluginName': p2PluginName,
        'pypi.classifiers': pypiClassifiers,
        'pypi.description': pypiDescription,
        'pypi.keywords': pypiKeywords,
        'pypi.summary': pypiSummary,
        'rubygems.description': rubygemsDescription,
        'rubygems.platform': rubygemsPlatform,
        'rubygems.summary': rubygemsSummary,
        'yum.architecture': yumArchitecture,
        'yum.name': yumName,
      },
    });
  }

  /**
   * Search and download asset
   * Returns a 302 Found with location header field set to download URL. Unless a sort parameter is supplied, the search must return a single asset to receive download URL.
   * @throws ApiError
   */
  public static searchAndDownloadAssets(
    data: SearchData['SearchAndDownloadAssets'] = {},
  ): CancelablePromise<void> {
    const {
      sort,
      direction,
      timeout,
      q,
      repository,
      format,
      group,
      name,
      version,
      prerelease,
      md5,
      sha1,
      sha256,
      sha512,
      conanBaseVersion,
      conanChannel,
      conanRevision,
      conanPackageId,
      conanPackageRevision,
      dockerImageName,
      dockerImageTag,
      dockerLayerId,
      dockerContentDigest,
      mavenGroupId,
      mavenArtifactId,
      mavenBaseVersion,
      mavenExtension,
      mavenClassifier,
      gavec,
      npmScope,
      npmAuthor,
      npmDescription,
      npmKeywords,
      npmLicense,
      npmTaggedIs,
      npmTaggedNot,
      nugetId,
      nugetTags,
      nugetTitle,
      nugetAuthors,
      nugetDescription,
      nugetSummary,
      p2PluginName,
      pypiClassifiers,
      pypiDescription,
      pypiKeywords,
      pypiSummary,
      rubygemsDescription,
      rubygemsPlatform,
      rubygemsSummary,
      yumArchitecture,
      yumName,
    } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/search/assets/download',
      query: {
        sort,
        direction,
        timeout,
        q,
        repository,
        format,
        group,
        name,
        version,
        prerelease,
        md5,
        sha1,
        sha256,
        sha512,
        'conan.baseVersion': conanBaseVersion,
        'conan.channel': conanChannel,
        'conan.revision': conanRevision,
        'conan.packageId': conanPackageId,
        'conan.packageRevision': conanPackageRevision,
        'docker.imageName': dockerImageName,
        'docker.imageTag': dockerImageTag,
        'docker.layerId': dockerLayerId,
        'docker.contentDigest': dockerContentDigest,
        'maven.groupId': mavenGroupId,
        'maven.artifactId': mavenArtifactId,
        'maven.baseVersion': mavenBaseVersion,
        'maven.extension': mavenExtension,
        'maven.classifier': mavenClassifier,
        gavec,
        'npm.scope': npmScope,
        'npm.author': npmAuthor,
        'npm.description': npmDescription,
        'npm.keywords': npmKeywords,
        'npm.license': npmLicense,
        'npm.tagged_is': npmTaggedIs,
        'npm.tagged_not': npmTaggedNot,
        'nuget.id': nugetId,
        'nuget.tags': nugetTags,
        'nuget.title': nugetTitle,
        'nuget.authors': nugetAuthors,
        'nuget.description': nugetDescription,
        'nuget.summary': nugetSummary,
        'p2.pluginName': p2PluginName,
        'pypi.classifiers': pypiClassifiers,
        'pypi.description': pypiDescription,
        'pypi.keywords': pypiKeywords,
        'pypi.summary': pypiSummary,
        'rubygems.description': rubygemsDescription,
        'rubygems.platform': rubygemsPlatform,
        'rubygems.summary': rubygemsSummary,
        'yum.architecture': yumArchitecture,
        'yum.name': yumName,
      },
      errors: {
        400: `ValidationErrorXO{id='*', message='Search returned multiple assets, please refine search criteria to find a single asset or use the sort query parameter to retrieve the first result.'}`,
        404: `Asset search returned no results`,
      },
    });
  }

  /**
   * Search components
   * @returns PageComponentXO successful operation
   * @throws ApiError
   */
  public static search(
    data: SearchData['Search'] = {},
  ): CancelablePromise<PageComponentXO> {
    const {
      continuationToken,
      sort,
      direction,
      timeout,
      q,
      repository,
      format,
      group,
      name,
      version,
      prerelease,
      md5,
      sha1,
      sha256,
      sha512,
      conanBaseVersion,
      conanChannel,
      conanRevision,
      conanPackageId,
      conanPackageRevision,
      dockerImageName,
      dockerImageTag,
      dockerLayerId,
      dockerContentDigest,
      mavenGroupId,
      mavenArtifactId,
      mavenBaseVersion,
      mavenExtension,
      mavenClassifier,
      gavec,
      npmScope,
      npmAuthor,
      npmDescription,
      npmKeywords,
      npmLicense,
      npmTaggedIs,
      npmTaggedNot,
      nugetId,
      nugetTags,
      nugetTitle,
      nugetAuthors,
      nugetDescription,
      nugetSummary,
      p2PluginName,
      pypiClassifiers,
      pypiDescription,
      pypiKeywords,
      pypiSummary,
      rubygemsDescription,
      rubygemsPlatform,
      rubygemsSummary,
      yumArchitecture,
      yumName,
    } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/search',
      query: {
        continuationToken,
        sort,
        direction,
        timeout,
        q,
        repository,
        format,
        group,
        name,
        version,
        prerelease,
        md5,
        sha1,
        sha256,
        sha512,
        'conan.baseVersion': conanBaseVersion,
        'conan.channel': conanChannel,
        'conan.revision': conanRevision,
        'conan.packageId': conanPackageId,
        'conan.packageRevision': conanPackageRevision,
        'docker.imageName': dockerImageName,
        'docker.imageTag': dockerImageTag,
        'docker.layerId': dockerLayerId,
        'docker.contentDigest': dockerContentDigest,
        'maven.groupId': mavenGroupId,
        'maven.artifactId': mavenArtifactId,
        'maven.baseVersion': mavenBaseVersion,
        'maven.extension': mavenExtension,
        'maven.classifier': mavenClassifier,
        gavec,
        'npm.scope': npmScope,
        'npm.author': npmAuthor,
        'npm.description': npmDescription,
        'npm.keywords': npmKeywords,
        'npm.license': npmLicense,
        'npm.tagged_is': npmTaggedIs,
        'npm.tagged_not': npmTaggedNot,
        'nuget.id': nugetId,
        'nuget.tags': nugetTags,
        'nuget.title': nugetTitle,
        'nuget.authors': nugetAuthors,
        'nuget.description': nugetDescription,
        'nuget.summary': nugetSummary,
        'p2.pluginName': p2PluginName,
        'pypi.classifiers': pypiClassifiers,
        'pypi.description': pypiDescription,
        'pypi.keywords': pypiKeywords,
        'pypi.summary': pypiSummary,
        'rubygems.description': rubygemsDescription,
        'rubygems.platform': rubygemsPlatform,
        'rubygems.summary': rubygemsSummary,
        'yum.architecture': yumArchitecture,
        'yum.name': yumName,
      },
    });
  }
}

export class FormatsService {
  /**
   * Get upload field requirements for the desired format
   * @returns UploadDefinitionXO successful operation
   * @throws ApiError
   */
  public static get1(
    data: FormatsData['Get1'],
  ): CancelablePromise<UploadDefinitionXO> {
    const { format } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/formats/{format}/upload-specs',
      path: {
        format,
      },
    });
  }

  /**
   * Get upload field requirements for each supported format
   * @returns UploadDefinitionXO successful operation
   * @throws ApiError
   */
  public static get2(): CancelablePromise<Array<UploadDefinitionXO>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/formats/upload-specs',
    });
  }
}

export class ScriptService {
  /**
   * List all stored scripts
   * @returns ScriptXO successful operation
   * @throws ApiError
   */
  public static browse(): CancelablePromise<Array<ScriptXO>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/script',
    });
  }

  /**
   * Add a new script
   * @returns void Script was added
   * @throws ApiError
   */
  public static add(data: ScriptData['Add'] = {}): CancelablePromise<void> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/script',
      body: body,
      errors: {
        410: `Script creation is disabled`,
      },
    });
  }

  /**
   * Read stored script by name
   * @returns ScriptXO successful operation
   * @throws ApiError
   */
  public static read1(data: ScriptData['Read1']): CancelablePromise<ScriptXO> {
    const { name } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/script/{name}',
      path: {
        name,
      },
      errors: {
        404: `No script with the specified name`,
      },
    });
  }

  /**
   * Update stored script by name
   * @returns void Script was updated
   * @throws ApiError
   */
  public static edit(data: ScriptData['Edit']): CancelablePromise<void> {
    const { name, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/script/{name}',
      path: {
        name,
      },
      body: body,
      errors: {
        404: `No script with the specified name`,
        410: `Script updating is disabled`,
      },
    });
  }

  /**
   * Delete stored script by name
   * @returns void Script was deleted
   * @throws ApiError
   */
  public static delete1(data: ScriptData['Delete1']): CancelablePromise<void> {
    const { name } = data;
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/script/{name}',
      path: {
        name,
      },
      errors: {
        404: `No script with the specified name`,
      },
    });
  }

  /**
   * Run stored script by name
   * @returns ScriptResultXO successful operation
   * @throws ApiError
   */
  public static run1(
    data: ScriptData['Run1'],
  ): CancelablePromise<ScriptResultXO> {
    const { name, body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/script/{name}/run',
      path: {
        name,
      },
      body: body,
      errors: {
        404: `No script with the specified name`,
        500: `Script execution failed with exception`,
      },
    });
  }
}

export class EmailService {
  /**
   * Retrieve the current email configuration
   * @returns ApiEmailConfiguration successful operation
   * @throws ApiError
   */
  public static getEmailConfiguration(): CancelablePromise<ApiEmailConfiguration> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/email',
      errors: {
        403: `Insufficient permissions to retrieve the email configuration`,
      },
    });
  }

  /**
   * Set the current email configuration
   * @returns void Email configuration was successfully updated
   * @throws ApiError
   */
  public static setEmailConfiguration(
    data: EmailData['SetEmailConfiguration'],
  ): CancelablePromise<void> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/email',
      body: body,
      errors: {
        400: `Invalid request`,
        403: `Insufficient permissions to update the email configuration`,
      },
    });
  }

  /**
   * Disable and clear the email configuration
   * @returns void Email configuration was successfully cleared
   * @throws ApiError
   */
  public static deleteEmailConfiguration(): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/email',
    });
  }

  /**
   * Send a test email to the email address provided in the request body
   * @returns ApiEmailValidation Validation was complete, look at the body to determine success
   * @throws ApiError
   */
  public static testEmailConfiguration(
    data: EmailData['TestEmailConfiguration'],
  ): CancelablePromise<ApiEmailValidation> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/email/verify',
      body: body,
      errors: {
        403: `Insufficient permissions to verify the email configuration`,
      },
    });
  }
}

export class StatusService {
  /**
   * Health check endpoint that returns the results of the system status checks
   * @returns Result The system status check results
   * @throws ApiError
   */
  public static getSystemStatusChecks(): CancelablePromise<
    Record<string, Result>
  > {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/status/check',
    });
  }

  /**
   * Health check endpoint that validates server can respond to read requests
   * @returns any Available to service requests
   * @throws ApiError
   */
  public static isAvailable(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/status',
      errors: {
        503: `Unavailable to service requests`,
      },
    });
  }

  /**
   * Health check endpoint that validates server can respond to read and write requests
   * @returns any Available to service requests
   * @throws ApiError
   */
  public static isWritable(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/status/writable',
      errors: {
        503: `Unavailable to service requests`,
      },
    });
  }
}

export class SupportService {
  /**
   * Creates a support zip and returns the path
   * @returns SupportZipXO successful operation
   * @throws ApiError
   */
  public static supportzippath(
    data: SupportData['Supportzippath'] = {},
  ): CancelablePromise<SupportZipXO> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/support/supportzippath',
      body: body,
    });
  }

  /**
   * Creates and downloads a support zip
   * @returns any successful operation
   * @throws ApiError
   */
  public static supportzip(
    data: SupportData['Supportzip'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/support/supportzip',
      body: body,
    });
  }
}

export class SecurityManagementLdapService {
  /**
   * List LDAP servers
   * @returns any LDAP server list returned
   * @throws ApiError
   */
  public static getLdapServers(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/security/ldap',
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Create LDAP server
   * @returns any LDAP server created
   * @throws ApiError
   */
  public static createLdapServer(
    data: SecurityManagementLdapData['CreateLdapServer'] = {},
  ): CancelablePromise<any> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/security/ldap',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }

  /**
   * Get LDAP server
   * @returns any LDAP server returned
   * @throws ApiError
   */
  public static getLdapServer(
    data: SecurityManagementLdapData['GetLdapServer'],
  ): CancelablePromise<any> {
    const { name } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/security/ldap/{name}',
      path: {
        name,
      },
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        404: `LDAP server not found`,
      },
    });
  }

  /**
   * Update LDAP server
   * @returns void LDAP server updated
   * @throws ApiError
   */
  public static updateLdapServer(
    data: SecurityManagementLdapData['UpdateLdapServer'],
  ): CancelablePromise<void> {
    const { name, body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/security/ldap/{name}',
      path: {
        name,
      },
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        404: `LDAP server not found`,
      },
    });
  }

  /**
   * Delete LDAP server
   * @returns void LDAP server deleted
   * @throws ApiError
   */
  public static deleteLdapServer(
    data: SecurityManagementLdapData['DeleteLdapServer'],
  ): CancelablePromise<void> {
    const { name } = data;
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/security/ldap/{name}',
      path: {
        name,
      },
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
        404: `LDAP server not found`,
      },
    });
  }

  /**
   * Change LDAP server order
   * @returns void LDAP server order changed
   * @throws ApiError
   */
  public static changeOrder(
    data: SecurityManagementLdapData['ChangeOrder'] = {},
  ): CancelablePromise<void> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/security/ldap/change-order',
      body: body,
      errors: {
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }
}

export class ManageSonatypeRepositoryFirewallConfigurationService {
  /**
   * Verify Sonatype Repository Firewall connection
   * @returns any Connection verification complete, check response body for result
   * @throws ApiError
   */
  public static verifyConnection(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/iq/verify-connection',
    });
  }

  /**
   * Get Sonatype Repository Firewall configuration
   * @returns any Sonatype Repository Firewall configuration returned
   * @throws ApiError
   */
  public static getConfiguration(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/iq',
    });
  }

  /**
   * Update Sonatype Repository Firewall configuration
   * @returns void Sonatype Repository Firewall configuration has been updated
   * @throws ApiError
   */
  public static updateConfiguration(
    data: ManageSonatypeRepositoryFirewallConfigurationData['UpdateConfiguration'] = {},
  ): CancelablePromise<void> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/iq',
      body: body,
    });
  }

  /**
   * Enable Sonatype Repository Firewall
   * @returns void Sonatype Repository Firewall has been enabled
   * @throws ApiError
   */
  public static enableIq(): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/iq/enable',
      errors: {
        400: `Sonatype Repository Firewall connection not configured`,
      },
    });
  }

  /**
   * Disable Sonatype Repository Firewall
   * @returns void Sonatype Repository Firewall has been disabled
   * @throws ApiError
   */
  public static disableIq(): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/iq/disable',
      errors: {
        400: `Sonatype Repository Firewall connection not configured`,
      },
    });
  }
}

export class ProductLicensingService {
  /**
   * Get the current license status.
   * @returns ApiLicenseDetailsXO successful operation
   * @throws ApiError
   */
  public static getLicenseStatus(): CancelablePromise<ApiLicenseDetailsXO> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/system/license',
    });
  }

  /**
   * Upload a new license file.
   * Server must be restarted to take effect
   * @returns ApiLicenseDetailsXO successful operation
   * @throws ApiError
   */
  public static setLicense(
    data: ProductLicensingData['SetLicense'] = {},
  ): CancelablePromise<ApiLicenseDetailsXO> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/system/license',
      body: body,
    });
  }

  /**
   * Uninstall license if present.
   * @returns any successful operation
   * @throws ApiError
   */
  public static removeLicense(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/system/license',
    });
  }
}

export class AzureBlobStoreService {
  /**
   * Verify connection using supplied Azure Blob Store settings
   * @returns void Azure Blob Store connection was successful
   * @throws ApiError
   */
  public static verifyConnection1(
    data: AzureBlobStoreData['VerifyConnection1'] = {},
  ): CancelablePromise<void> {
    const { body } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/azureblobstore/test-connection',
      body: body,
      errors: {
        400: `Azure Blob Store connection failed`,
        401: `Authentication required`,
        403: `Insufficient permissions`,
      },
    });
  }
}
