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
import classNames from 'classnames';
import { DateTime } from 'luxon';
import {
  Link,
  Progress,
  TableColumn,
  TableFilter,
} from '@backstage/core-components';
import { compare } from 'compare-versions';
import { Box, IconButton, Tooltip, Typography } from '@material-ui/core';
import RetryIcon from '@material-ui/icons/Replay';
import PauseIcon from '@material-ui/icons/Pause';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import { useSyncResource, useWeaveGitOpsDeepLink } from '../hooks';
import {
  VerifiableSource,
  automationLastUpdated,
  findVerificationCondition,
  useStyles,
} from './utils';
import {
  FluxObject,
  GitRepository,
  HelmRelease,
  Kustomization,
  HelmRepository,
  OCIRepository,
  ImagePolicy,
} from '../objects';
import KubeStatusIndicator, { getIndicatorInfo } from './KubeStatusIndicator';
import { helm, kubernetes, oci, git, flux } from '../images/icons';
import { useToggleSuspendResource } from '../hooks/useToggleSuspendResource';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { useGetLatestFluxRelease } from '../hooks/useGetFluxRelease';

export type Source = GitRepository | OCIRepository | HelmRepository;
export type Deployment = HelmRelease | Kustomization;
export type Cluster = {
  clusterName: string;
  namespace: string;
  version: string;
  availableComponents: string[];
};

/**
 * Calculate a Name label for a resource with the namespace/name and link to
 * this in Weave GitOps if possible.
 */
export const NameLabel = ({
  resource,
}: {
  resource: FluxObject;
}): JSX.Element => {
  const { name, namespace } = resource;
  const deepLink = useWeaveGitOpsDeepLink(resource);
  const label = `${namespace}/${name}`;
  const classes = useStyles();

  if (!deepLink) {
    return (
      <Typography
        variant="body2"
        className={classNames(classes.textOverflow, classes.nameLabel)}
      >
        {label}
      </Typography>
    );
  }

  return (
    <Link
      className={classNames(classes.textOverflow, classes.nameLabel)}
      to={deepLink}
    >
      {label}
    </Link>
  );
};

export const Url = ({ resource }: { resource: Source }): JSX.Element => {
  const classes = useStyles();
  return (
    <Tooltip title={resource.url}>
      <Box className={classes.textOverflow}>{resource.url}</Box>
    </Tooltip>
  );
};

export function SyncButton({
  resource,
  sync,
  status,
  readOnly,
}: {
  resource: Source | Deployment | ImagePolicy;
  sync: () => Promise<void>;
  status: boolean;
  readOnly?: boolean;
}) {
  const classes = useStyles();
  const label = `${resource.namespace}/${resource.name}`;
  const title = status ? `Syncing ${label}` : `Sync ${label}`;
  return (
    <Tooltip title={readOnly ? 'Read-only mode is enabled' : title}>
      <div>
        <IconButton
          data-testid={`sync ${label}`}
          className={classes.actionButton}
          size="small"
          onClick={sync}
          disabled={resource.suspended || readOnly}
        >
          <RetryIcon />
        </IconButton>
      </div>
    </Tooltip>
  );
}

export function SuspendButton({
  resource,
  toggleSuspend,
  status,
  readOnly,
}: {
  resource: Source | Deployment;
  toggleSuspend: () => Promise<void>;
  status: boolean;
  readOnly?: boolean;
}) {
  const classes = useStyles();
  const label = `${resource.namespace}/${resource.name}`;
  const title = status ? `Suspending ${label}` : `Suspend ${label}`;

  return (
    <Tooltip title={readOnly ? 'Read-only mode is enabled' : title}>
      <div>
        <IconButton
          data-testid={`suspend ${label}`}
          className={classes.actionButton}
          size="small"
          onClick={toggleSuspend}
          disabled={resource.suspended || readOnly}
        >
          <PauseIcon />
        </IconButton>
      </div>
    </Tooltip>
  );
}

export function ResumeButton({
  resource,
  toggleResume,
  status,
  readOnly,
}: {
  resource: Source | Deployment;
  toggleResume: () => Promise<void>;
  status: boolean;
  readOnly?: boolean;
}) {
  const classes = useStyles();
  const label = `${resource.namespace}/${resource.name}`;
  const title = status ? `Resuming ${label}` : `Resume ${label}`;

  return (
    <Tooltip title={readOnly ? 'Read-only mode is enabled' : title}>
      <div>
        <IconButton
          data-testid={`resume ${label}`}
          className={classes.actionButton}
          size="small"
          onClick={toggleResume}
          disabled={!resource.suspended || readOnly}
        >
          <PlayArrowIcon />
        </IconButton>
      </div>
    </Tooltip>
  );
}

export function GroupAction({
  resource,
}: {
  resource: Source | Deployment | ImagePolicy;
}) {
  const { sync, isSyncing } = useSyncResource(resource);
  const { loading: isSuspending, toggleSuspend } = useToggleSuspendResource(
    resource as Source | Deployment,
    true,
  );
  const { loading: isResuming, toggleSuspend: toogleResume } =
    useToggleSuspendResource(resource as Source | Deployment, false);
  const isLoading = isSyncing || isSuspending || isResuming;
  const config = useApi(configApiRef);

  const readOnly = config.getOptionalBoolean('flux.gitops.readOnly');

  return (
    <>
      {isLoading ? (
        <Progress data-testid="loading" />
      ) : (
        <Box display="flex" alignItems="start" flexDirection="row">
          <SyncButton
            readOnly={readOnly}
            resource={resource}
            sync={sync}
            status={isSyncing}
          />
          {!(resource.type === 'ImagePolicy') ? (
            <>
              <SuspendButton
                readOnly={readOnly}
                resource={resource as Source | Deployment}
                toggleSuspend={toggleSuspend}
                status={isSuspending}
              />
              <ResumeButton
                readOnly={readOnly}
                resource={resource as Source | Deployment}
                toggleResume={toogleResume}
                status={isResuming}
              />
            </>
          ) : null}
        </Box>
      )}
    </>
  );
}

export function actionColumn<T extends Source | Deployment | ImagePolicy>() {
  return {
    title: 'Actions',
    render: row => <GroupAction resource={row} />,
    width: '24px',
  } as TableColumn<T>;
}

export const VerifiedStatus = ({
  resource,
}: {
  resource: VerifiableSource;
}): JSX.Element | null => {
  const classes = useStyles();

  if (!resource.isVerifiable) return null;

  const condition = findVerificationCondition(resource);

  let className;
  if (condition?.status === 'True') {
    className = classNames(classes.verifiedOK, classes.statusIconSize);
  } else if (condition?.status === 'False') {
    className = classNames(classes.verifiedError, classes.statusIconSize);
  } else if (!condition?.status) {
    className = classNames(classes.verifiedWarning, classes.statusIconSize);
  }

  return (
    <Tooltip title={condition?.message || 'pending verification'}>
      <VerifiedUserIcon className={className} />
    </Tooltip>
  );
};

export const nameAndClusterName = ({
  resource,
}: {
  resource: FluxObject;
}): JSX.Element => (
  <Box display="flux" alignItems="start" flexDirection="column">
    <NameLabel resource={resource} />
    <Typography>cluster: {resource.clusterName}</Typography>
  </Box>
);

export const idColumn = <T extends FluxObject | Cluster>() => {
  return {
    title: 'Id',
    field: 'id',
    hidden: true,
  } as TableColumn<T>;
};

// Added hidden column to allow checkbox filtering by clusterName
export const clusterNameFilteringColumn = <
  T extends FluxObject | Cluster,
>() => {
  return {
    title: 'Cluster name',
    hidden: true,
    field: 'clusterName',
  } as TableColumn<T>;
};

export const clusterColumn = <T extends Cluster>() => {
  return {
    title: 'Cluster',
    render: resource => <Typography>{resource?.clusterName}</Typography>,
    ...sortAndFilterOptions(resource => resource?.clusterName),
  } as TableColumn<T>;
};

export const namespaceColumn = <T extends Cluster>() => {
  return {
    title: 'Namespace',
    render: resource => <Typography>{resource?.namespace}</Typography>,
    ...sortAndFilterOptions(resource => resource?.namespace),
  } as TableColumn<T>;
};

export const versionColumn = <T extends Cluster>() => {
  return {
    title: 'Version',
    render: resource => <Typography>{resource?.version}</Typography>,
    ...sortAndFilterOptions(resource => resource?.version),
  } as TableColumn<T>;
};

export const availableComponentsColumn = <T extends Cluster>() => {
  return {
    title: 'Available Components',
    render: resource => (
      <Typography>{resource?.availableComponents.join(', ')}</Typography>
    ),
    ...sortAndFilterOptions(resource =>
      resource?.availableComponents.join(', '),
    ),
  } as TableColumn<T>;
};

/**
 * Compare the latest Flux release with the flux version present on the cluster and return
 * a link to the Flux releases page if there is a newer version available.
 **/
export const FluxReleasesLink = ({
  resource,
}: {
  resource: Cluster;
}): JSX.Element | null => {
  const { data: latestFluxRelease } = useGetLatestFluxRelease();
  const FLUX_RELEASES_URL = 'https://github.com/fluxcd/flux2/releases';

  return latestFluxRelease &&
    compare(
      latestFluxRelease?.name?.substring(1),
      resource.version.substring(1),
      '>',
    ) ? (
    <Link to={FLUX_RELEASES_URL}>Update available</Link>
  ) : null;
};

export const fluxUpdate = <T extends Cluster>() => {
  return {
    title: 'Flux update',
    render: resource => <FluxReleasesLink resource={resource} />,
  } as TableColumn<T>;
};

export const nameAndClusterNameColumn = <T extends FluxObject>() => {
  return {
    title: 'Name',
    render: resource => nameAndClusterName({ resource }),
    ...sortAndFilterOptions(
      resource =>
        `${resource.namespace}/${resource.name}/${resource.clusterName}`,
    ),
    minWidth: '200px',
  } as TableColumn<T>;
};

export const verifiedColumn = <T extends GitRepository | OCIRepository>() => {
  return {
    title: (
      <Tooltip title="Verification status">
        <VerifiedUserIcon style={{ height: '16px' }} />
      </Tooltip>
    ),
    render: resource => <VerifiedStatus resource={resource} />,
    ...sortAndFilterOptions(resource =>
      resource.isVerifiable
        ? findVerificationCondition(resource)?.status || 'unknown'
        : '',
    ),
    ...sortAndFilterOptions(resource => {
      const condition = findVerificationCondition(resource);
      return condition?.message || '';
    }),
    width: '90px',
  } as TableColumn<T>;
};

export const urlColumn = <T extends Source>() => {
  return {
    title: 'URL',
    field: 'url',
    render: resource => <Url resource={resource} />,
  } as TableColumn<T>;
};

export function shortenSha(sha: string | undefined) {
  const shaPattern = sha?.split(':')[0];
  if (!sha || shaPattern !== 'sha256') return sha;
  return sha.slice(0, 14);
}

export const artifactColumn = <T extends Source>() => {
  return {
    title: 'Artifact',
    render: resource => (
      <Tooltip
        // This is the sha of the commit that the artifact was built from
        title={
          resource.artifact?.revision?.split('@')[1] ||
          resource.artifact?.revision?.split('@')[0] ||
          'unknown tag'
        }
      >
        <Typography>
          {shortenSha(resource.artifact?.revision?.split('@')[0])}
        </Typography>
      </Tooltip>
    ),
    ...sortAndFilterOptions(resource => resource.artifact?.revision),
    ...sortAndFilterOptions(
      resource => resource.artifact?.revision?.split('@')[1],
    ),
  } as TableColumn<T>;
};

export const sourceColumn = <T extends Deployment>() => {
  const formatContent = (resource: Deployment) => {
    if (resource.type === 'HelmRelease') {
      return `${(resource as HelmRelease)?.helmChart?.chart}/${
        resource?.lastAppliedRevision
      }`;
    }
    return '';
  };

  return {
    title: 'Source',
    render: (resource: Deployment) =>
      resource.type === 'HelmRelease' ? (
        formatContent(resource)
      ) : (
        <Typography>
          {resource.type === 'Kustomization'
            ? (resource as Kustomization)?.path
            : ''}
        </Typography>
      ),
    ...sortAndFilterOptions(resource =>
      resource.type === 'HelmRelease'
        ? formatContent(resource)
        : (resource as Kustomization)?.path,
    ),
  } as TableColumn<T>;
};

export const getIconType = (type: string) => {
  switch (type) {
    case 'HelmRelease':
    case 'HelmRepository':
      return helm;
    case 'Kustomization':
      return kubernetes;
    case 'GitRepository':
      return git;
    case 'OCIRepository':
      return oci;
    case 'ImagePolicy':
      return flux;
    default:
      return null;
  }
};

export const typeColumn = <
  T extends
    | Deployment
    | OCIRepository
    | GitRepository
    | HelmRepository
    | ImagePolicy,
>() => {
  const paddingLeft = 0;
  return {
    title: 'Kind',
    align: 'right',
    cellStyle: { paddingLeft, paddingRight: 6 },
    headerStyle: { paddingLeft, paddingRight: 0 },
    field: 'type',
    render: resource => (
      <Tooltip title={resource.type || 'Unknown'}>
        <div>{getIconType(resource.type as string)}</div>
      </Tooltip>
    ),
    ...sortAndFilterOptions(resource => resource?.type as string | undefined),
    width: '20px',
  } as TableColumn<T>;
};

export const repoColumn = <T extends Deployment>() => {
  return {
    title: 'Repo',
    field: 'repo',
    render: resource => <Typography>{resource?.sourceRef?.name}</Typography>,
    ...sortAndFilterOptions(resource => resource?.sourceRef?.name),
  } as TableColumn<T>;
};

export function statusColumn<T extends FluxObject>() {
  return {
    title: 'Status',
    render: resource => (
      <KubeStatusIndicator
        short
        conditions={resource.conditions}
        suspended={resource.suspended}
      />
    ),
    ...sortAndFilterOptions(
      resource =>
        getIndicatorInfo(resource.suspended, resource.conditions).type,
    ),
    minWidth: '130px',
  } as TableColumn<T>;
}

export const updatedColumn = <T extends FluxObject>() => {
  return {
    title: 'Updated',
    render: resource =>
      DateTime.fromISO(automationLastUpdated(resource)).toRelative({
        locale: 'en',
      }),
    ...sortAndFilterOptions(
      resource =>
        DateTime.fromISO(automationLastUpdated(resource)).toRelative({
          locale: 'en',
        }) as string,
    ),
    minWidth: '130px',
  } as TableColumn<T>;
};

export const policy = <T extends ImagePolicy>() => {
  return {
    title: 'Image Policy',
    field: 'imagepolicy',
    render: resource => (
      <Typography>
        {resource?.imagePolicy.type} / {resource?.imagePolicy.value}
      </Typography>
    ),
    ...sortAndFilterOptions(
      resource =>
        `${resource?.imagePolicy.type} / ${resource?.imagePolicy.value}`,
    ),
  } as TableColumn<T>;
};

export const imageRepository = <T extends ImagePolicy>() => {
  return {
    title: 'Image Repository',
    field: 'imagerepository',
    render: resource => <Typography>{resource?.imageRepositoryRef}</Typography>,
    ...sortAndFilterOptions(resource => resource?.imageRepositoryRef),
  } as TableColumn<T>;
};

export const latestImageSelected = <T extends ImagePolicy>() => {
  return {
    title: 'Latest Image',
    field: 'latestimage',
    render: resource => <Typography>{resource?.latestImage}</Typography>,
    ...sortAndFilterOptions(resource => resource?.latestImage),
  } as TableColumn<T>;
};

//
// sorting and filtering helpers
//

export function sortAndFilterOptions<T extends object>(
  fn: (item: T) => string | undefined,
) {
  return {
    customFilterAndSearch: stringCompareFilter(fn),
    customSort: stringCompareSort(fn),
  } as TableColumn<T>;
}

export function stringCompareSort<T>(fn: (item: T) => string | undefined) {
  return (a: T, b: T) => {
    return (fn(a) || '').localeCompare(fn(b) || '');
  };
}

export function stringCompareFilter<T>(fn: (item: T) => string | undefined) {
  return (filter: any, item: T) => {
    return (fn(item) || '')
      .toLocaleLowerCase()
      .includes((filter as string).toLocaleLowerCase());
  };
}

// checkbox filters
export const filters: TableFilter[] = [
  {
    column: 'Cluster name',
    type: 'multiple-select',
  },
];
