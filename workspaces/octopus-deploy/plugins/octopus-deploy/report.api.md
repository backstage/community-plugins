## API Report File for "@backstage-community/plugin-octopus-deploy"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts
import { ApiRef } from '@backstage/core-plugin-api';
import { BackstagePlugin } from '@backstage/core-plugin-api';
import { ConfigApi } from '@backstage/core-plugin-api';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';
import { FetchApi } from '@backstage/core-plugin-api';
import { FieldExtensionComponent } from '@backstage/plugin-scaffolder-react';
import { JSX as JSX_2 } from 'react/jsx-runtime';

// @public (undocumented)
export const EntityOctopusDeployContent: (props: {
  defaultLimit?: number | undefined;
}) => JSX_2.Element;

// @public (undocumented)
export const isOctopusDeployAvailable: (entity: Entity) => boolean;

// @public (undocumented)
export const OCTOPUS_DEPLOY_PROJECT_ID_ANNOTATION = 'octopus.com/project-id';

// @public (undocumented)
export interface OctopusDeployApi {
  // (undocumented)
  getConfig(): Promise<OctopusPluginConfig>;
  // (undocumented)
  getProjectGroups(): Promise<OctopusProjectGroup[]>;
  // (undocumented)
  getProjectInfo(projectReference: ProjectReference): Promise<OctopusProject>;
  // (undocumented)
  getReleaseProgression(opts: {
    projectReference: ProjectReference;
    releaseHistoryCount: number;
  }): Promise<OctopusProgression>;
}

// @public (undocumented)
export const octopusDeployApiRef: ApiRef<OctopusDeployApi>;

// @public (undocumented)
export class OctopusDeployClient implements OctopusDeployApi {
  constructor(options: {
    configApi: ConfigApi;
    discoveryApi: DiscoveryApi;
    fetchApi: FetchApi;
    proxyPathBase?: string;
  });
  // (undocumented)
  getConfig(): Promise<OctopusPluginConfig>;
  // (undocumented)
  getProjectGroups(): Promise<OctopusProjectGroup[]>;
  // (undocumented)
  getProjectInfo(projectReference: ProjectReference): Promise<OctopusProject>;
  // (undocumented)
  getReleaseProgression(opts: {
    projectReference: ProjectReference;
    releaseHistoryCount: number;
  }): Promise<OctopusProgression>;
}

// @public (undocumented)
export const OctopusDeployDropdownFieldExtension: FieldExtensionComponent<
  string,
  {}
>;

// @public (undocumented)
export type OctopusDeployment = {
  State: string;
};

// @public (undocumented)
export const octopusDeployPlugin: BackstagePlugin<{}, {}, {}>;

// @public (undocumented)
export type OctopusEnvironment = {
  Id: string;
  Name: string;
};

// @public (undocumented)
export type OctopusLinks = {
  Self: string;
  Web: string;
};

// @public (undocumented)
export type OctopusPluginConfig = {
  WebUiBaseUrl: string;
};

// @public (undocumented)
export type OctopusProgression = {
  Environments: OctopusEnvironment[];
  Releases: OctopusReleaseProgression[];
};

// @public (undocumented)
export type OctopusProject = {
  Name: string;
  Slug: string;
  Links: OctopusLinks;
};

// @public (undocumented)
export type OctopusProjectGroup = {
  Id: string;
  Name: string;
  Description: string;
};

// @public (undocumented)
export type OctopusRelease = {
  Id: string;
  Version: string;
  Links: OctopusLinks;
};

// @public (undocumented)
export type OctopusReleaseProgression = {
  Release: OctopusRelease;
  Deployments: {
    [key: string]: OctopusDeployment[];
  };
};

// @public (undocumented)
export type ProjectReference = {
  projectId: string;
  spaceId?: string;
};

// (No @packageDocumentation comment for this package)
```
