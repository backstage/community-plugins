import { Entity } from '@backstage/catalog-model';
import { match } from 'path-to-regexp';
import type { QueryParams } from '../api';
import {
  ProjectStatisticsSuccessResponseData,
  EntityURL,
  OrganizationProjectSuccessResponseData,
  PaginationQueryParams,
  Project,
  CodeFindingSuccessResponseData,
  DependenciesFindingSuccessResponseData,
  ContainersFindingSuccessResponseData,
  Finding,
  StatisticsEngine,
  StatisticsName,
} from './data.service.types';
import { AZURE_HOST_NAME } from '../constants';

enum FINDING_TYPE {
  DEPENDENCIES = 'ALERTS',
  CODE = 'SAST_VULNERABILITIES_BY_SEVERITY',
  CONTAINERS = 'IMG_SECURITY',
  LAST_SCAN = 'LAST_SCAN',
}

type OverviewData = {
  projectList: Project[];
};

export const dataProjectParser = (
  projectStatistics: Array<
    ProjectStatisticsSuccessResponseData & { entity: EntityURL }
  >,
  organizationProjects: OrganizationProjectSuccessResponseData[],
) => {
  const organizationData = organizationProjects.reduce((prev, next) => {
    prev[next.uuid] = next;
    return prev;
  }, {} as { [key: string]: OrganizationProjectSuccessResponseData });

  const projectData = projectStatistics.reduce(
    (
      prev: OverviewData,
      next: ProjectStatisticsSuccessResponseData & { entity: EntityURL },
    ) => {
      const dependenciesCritical =
        next.statistics[FINDING_TYPE.DEPENDENCIES]
          .criticalSeverityVulnerabilities;
      const dependenciesHigh =
        next.statistics[FINDING_TYPE.DEPENDENCIES].highSeverityVulnerabilities;
      const dependenciesMedium =
        next.statistics[FINDING_TYPE.DEPENDENCIES]
          .mediumSeverityVulnerabilities;
      const dependenciesLow =
        next.statistics[FINDING_TYPE.DEPENDENCIES].lowSeverityVulnerabilities;
      const dependeciesTotal =
        dependenciesCritical +
        dependenciesHigh +
        dependenciesMedium +
        dependenciesLow;

      const codeHigh =
        next.statistics[FINDING_TYPE.CODE].sastHighVulnerabilities;
      const codeMedium =
        next.statistics[FINDING_TYPE.CODE].sastMediumVulnerabilities;
      const codeLow = next.statistics[FINDING_TYPE.CODE].sastLowVulnerabilities;
      const codeTotal = codeHigh + codeMedium + codeLow;

      const containersCritical =
        next.statistics[FINDING_TYPE.CONTAINERS].imgCriticalVulnerabilities;
      const containersHigh =
        next.statistics[FINDING_TYPE.CONTAINERS].imgHighVulnerabilities;
      const containersMedium =
        next.statistics[FINDING_TYPE.CONTAINERS].imgMediumVulnerabilities;
      const containersLow =
        next.statistics[FINDING_TYPE.CONTAINERS].imgLowVulnerabilities;
      const containersTotal =
        containersCritical + containersHigh + containersMedium + containersLow;

      const criticalTotal = dependenciesCritical + containersCritical;
      const highTotal = dependenciesHigh + codeHigh + containersHigh;
      const mediumTotal = dependenciesMedium + codeMedium + containersMedium;
      const lowTotal = dependenciesLow + codeLow + containersLow;
      const total = dependeciesTotal + codeTotal + containersTotal;

      const statistics = {
        [StatisticsEngine.DEPENDENCIES]: {
          critical: dependenciesCritical,
          high: dependenciesHigh,
          medium: dependenciesMedium,
          low: dependenciesLow,
          total: dependeciesTotal,
        },
        [StatisticsEngine.CODE]: {
          critical: null,
          high: codeHigh,
          medium: codeMedium,
          low: codeLow,
          total: codeTotal,
        },
        [StatisticsEngine.CONTAINERS]: {
          critical: containersCritical,
          high: containersHigh,
          medium: containersMedium,
          low: containersLow,
          total: containersTotal,
        },
        critical: criticalTotal,
        high: highTotal,
        medium: mediumTotal,
        low: lowTotal,
        total: total,
      };

      const project = {
        statistics,
        uuid: next.uuid,
        name: next.name,
        path: next.path,
        entity: next.entity,
        applicationName: organizationData[next.uuid].applicationName,
        applicationUuid: next.applicationUuid,
        lastScan: next.statistics[FINDING_TYPE.LAST_SCAN].lastScanTime,
        languages: next.statistics?.LIBRARY_TYPE_HISTOGRAM
          ? Object.entries(next.statistics.LIBRARY_TYPE_HISTOGRAM).sort(
              (a, b) => b[1] - a[1],
            )
          : ([] as [string, number][]),
      };

      prev.projectList.unshift(project);
      return prev;
    },
    {
      projectList: [],
    },
  );

  projectData.projectList.sort(
    (a, b) => b.statistics.critical - a.statistics.critical,
  );

  return projectData;
};

export const parseEntityURL = (entityUrl?: string) => {
  try {
    if (!entityUrl) {
      return null;
    }

    const matches = entityUrl.match(
      /https?:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(:[0-9]{1,5})?(\/.*)?/g,
    );

    if (!matches) {
      return null;
    }
    const url = new URL(matches[0]);
    const hostname = url.host.toLowerCase();
    let matcher = match('/:org/:repo', { end: false });

    if (hostname === AZURE_HOST_NAME) {
      matcher = match('/:org/:project/_git/:repo', { end: false });
    }
    const extractedContent = matcher(url.pathname);
    if (extractedContent) {
      return { ...extractedContent, host: hostname };
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const dataMatcher = (
  entities: Entity[],
  projects: ProjectStatisticsSuccessResponseData[],
) => {
  const projectSourceURL = getSourceURLWiseProject(projects);
  return entities.reduce(
    (
      prev: Array<
        ProjectStatisticsSuccessResponseData & {
          entity: EntityURL;
        }
      >,
      next: Entity,
    ) => {
      const entityURL = parseEntityURL(
        next?.metadata?.annotations?.['backstage.io/source-location'],
      );

      if (!entityURL) {
        return prev;
      }

      // NOTE: Find project based on Github URL
      const relatedProjects =
        projectSourceURL[`${entityURL?.host}${entityURL?.path}`]?.projectObjs;

      if (!relatedProjects) {
        return prev;
      }

      const entity = {
        path: entityURL.path,
        params: entityURL.params,
        namespace: next.metadata.namespace,
        kind: 'component',
        source: 'catalog',
      };

      relatedProjects.forEach(project => prev.push({ ...project, entity }));

      return prev;
    },
    [],
  );
};

/**
 * Extracts the source URL details from each project and returns a dictionary
 * where each key is a combination of the URL's host and pathname,
 * and the value is an object containing the original project and the parsed source URL data.
 *
 * @param projects Array of ProjectStatisticsSuccessResponseData
 * @returns A dictionary object with keys as `${host}${pathname}` strings extracted from sourceUrl and values as:
 *          {
 *            projectObjs: ProjectStatisticsSuccessResponseData[];
              sourceUrl: string | null;
              host: string | null;
              pathname: string | null;
 *          }
 */
export function getSourceURLWiseProject(
  projects: ProjectStatisticsSuccessResponseData[],
) {
  return projects.reduce(
    (acc, project) => {
      const projectTags = project.tags as Array<{ key: string; value: string }>;
      const sourceUrlTag = projectTags?.find(tag => tag.key === 'sourceUrl');
      let host = null;
      let pathname = null;
      let sourceUrl = null;

      if (sourceUrlTag && typeof sourceUrlTag.value === 'string') {
        sourceUrl = sourceUrlTag.value;
        const urlString = sourceUrl.startsWith('http')
          ? sourceUrl
          : `https://${sourceUrl}`;

        try {
          const urlObj = new URL(urlString);
          host = urlObj.host.toLocaleLowerCase();
          // Remove leading/trailing slashes and split
          pathname = urlObj.pathname;
        } catch (e) {
          // fallback: leave as nulls
        }
      }

      if (acc[`${host}${pathname}`]) {
        acc[`${host}${pathname}`].projectObjs.push(project);
      } else {
        acc[`${host}${pathname}`] = {
          projectObjs: [project],
          sourceUrl,
          host,
          pathname,
        };
      }
      return acc;
    },
    {} as Record<
      string,
      {
        projectObjs: ProjectStatisticsSuccessResponseData[];
        sourceUrl: string | null;
        host: string | null;
        pathname: string | null;
      }
    >,
  );
}

const getIssueStatus = (
  engine: StatisticsEngine,
  finding:
    | CodeFindingSuccessResponseData
    | DependenciesFindingSuccessResponseData
    | ContainersFindingSuccessResponseData,
): string => {
  if (engine === StatisticsEngine.CODE) {
    if ((finding as CodeFindingSuccessResponseData)?.suppressed)
      return 'suppressed';
    if (
      (finding as CodeFindingSuccessResponseData)?.almIssues?.jiraPlatform
        ?.issueStatus
    )
      return 'created';
    if ((finding as CodeFindingSuccessResponseData)?.reviewed)
      return 'reviewed';
  }

  if (engine === StatisticsEngine.DEPENDENCIES) {
    // NOTE: Available status: IGNORED and ACTIVE
    // ACTIVE means unreviewed
    // IGNORED means suppressed, comment fields are available to this status
    if (
      (finding as DependenciesFindingSuccessResponseData)?.findingInfo
        ?.status === 'IGNORED'
    )
      return 'suppressed';
  }

  return 'unreviewed';
};

export const dataFindingParser = (
  code: CodeFindingSuccessResponseData[] = [],
  dependencies: DependenciesFindingSuccessResponseData[] = [],
  containers: ContainersFindingSuccessResponseData[] = [],
  projectName: string = '',
) => {
  let codeFindings: Finding[] = [];
  let dependenciesFindings: Finding[] = [];
  let containersFindings: Finding[] = [];

  if (code.length) {
    codeFindings = code.map(finding => {
      return {
        kind: StatisticsEngine.CODE,
        level: finding.severity.toLowerCase() as StatisticsName,
        name: finding.type.cwe.title,
        origin: `${finding.sharedStep.file}:${finding.sharedStep.line}`,
        time: finding?.createdTime,
        projectId: finding.projectId,
        projectName: projectName,
        issue: {
          issueStatus: finding.almIssues.jiraPlatform.issueStatus,
          reporter: finding.almIssues.jiraPlatform.createdByName,
          creationDate: finding.almIssues.jiraPlatform.createdTime,
          ticketName: finding.almIssues.jiraPlatform.issueKey,
          link: `${finding.almIssues.jiraPlatform.publicLink}/browse/${finding.almIssues.jiraPlatform.issueKey}`,
          status: getIssueStatus(StatisticsEngine.CODE, finding),
        },
      };
    });
  }

  if (dependencies.length) {
    dependenciesFindings = dependencies.map(finding => {
      return {
        kind: StatisticsEngine.DEPENDENCIES,
        level: finding.vulnerability.severity.toLowerCase() as StatisticsName,
        name: finding.vulnerability.name,
        origin: finding.component.name,
        time: finding.vulnerability.modifiedDate,
        projectId: finding.project.uuid,
        projectName: projectName,
        issue: {
          issueStatus: '',
          reporter: '',
          creationDate: '',
          ticketName: '',
          link: '',
          status: getIssueStatus(StatisticsEngine.DEPENDENCIES, finding),
        },
      };
    });
  }

  if (containers.length) {
    containersFindings = containers.map(finding => {
      return {
        kind: StatisticsEngine.CONTAINERS,
        level: finding.severity.toLowerCase() as StatisticsName,
        name: finding.vulnerabilityId,
        origin: finding.packageName,
        time: finding.detectionDate,
        projectId: finding.projectUuid,
        projectName: projectName,
        issue: {
          issueStatus: '',
          reporter: '',
          creationDate: '',
          ticketName: '',
          link: '',
          status: getIssueStatus(StatisticsEngine.CONTAINERS, finding), // NOTE: Currently, issue for finding in containers no exist.
        },
      };
    });
  }

  const order: { [k: string]: number } = {
    critical: 1,
    high: 2,
    medium: 3,
    low: 4,
  };

  return [...codeFindings, ...dependenciesFindings, ...containersFindings].sort(
    (a, b) => {
      return order[a.level] - order[b.level];
    },
  );
};

const parseQueryString = (href = '?'): QueryParams => {
  const [, queryString] = href.split('?');

  const queryParams: QueryParams = {};
  new URLSearchParams(queryString).forEach((val, key) => {
    queryParams[key] = val;
  });

  return queryParams;
};

export const fetchQueryPagination = async <T>(cb: Function) => {
  const defaultQueryParams = { limit: '10000', cursor: '0' };
  const collection: T[] = [];

  const fetchLoop = async (queryParams: PaginationQueryParams) => {
    const result = await cb({ queryParams });

    collection.push(...result.response);

    const nextQuery = result.additionalData?.paging?.next;

    if (nextQuery) {
      const newQueryParams = parseQueryString(nextQuery);
      await fetchLoop(newQueryParams);
    }
  };

  await fetchLoop(defaultQueryParams);

  return collection;
};
