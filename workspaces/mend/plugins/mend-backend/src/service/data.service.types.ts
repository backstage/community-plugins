export type PaginationQueryParams = {
  cursor?: string;
  limit?: string;
};

type PaginationSuccessResponseData = {
  additionalData: {
    totalItems: number;
    paging: {
      next?: string;
    };
  };
};

type BodyParams = {
  projectUuids?: string[];
  applicationUuid?: string[];
};

type PathParams = {
  uuid: string;
};

export type GetOrganizationProjectRequestData = {
  queryParams?: PaginationQueryParams;
};

export type OrganizationProjectSuccessResponseData = {
  uuid: string;
  name: string;
  path: string;
  applicationName: string;
  applicationUuid: string;
};

export type GetOrganizationProjectSuccessResponseData = {
  supportToken: string;
  response: OrganizationProjectSuccessResponseData[];
} & PaginationSuccessResponseData;

export type GetProjectStatisticsRequestData = {
  queryParams?: PaginationQueryParams;
  bodyParams?: BodyParams;
};

export type ProjectStatisticsSuccessResponseData = {
  uuid: string;
  name: string;
  path: string;
  applicationUuid: string;
  creationDate: string;
  tags: [];
  labels: [];
  statistics: {
    UNIFIED_VULNERABILITIES: {
      unifiedCriticalVulnerabilities: number;
      unifiedHighVulnerabilities: number;
      unifiedMediumVulnerabilities: number;
      unifiedLowVulnerabilities: number;
      unifiedVulnerabilities: number;
    };
    VULNERABILITY_EFFECTIVENESS: {};
    LIBRARY_TYPE_HISTOGRAM: Record<string, number>;
    IMG_USAGE: {};
    POLICY_VIOLATION_LIBRARIES: {
      policyViolatingLibraries: number;
    };
    SAST_VULNERABILITIES_BY_TYPE: Record<string, number>;
    GENERAL: {
      totalLibraries: number;
    };
    LLM_SECURITY: {
      llmTotalLines: number;
    };
    IMG_SECURITY: {
      imgCriticalVulnerabilities: number;
      imgMaxRiskScore: number;
      imgMediumVulnerabilities: number;
      imgLowVulnerabilities: number;
      imgSecretMediumVulnerabilities: number;
      imgUnknownVulnerabilities: number;
      imgSecretHighVulnerabilities: number;
      imgTotalVulnerabilities: number;
      imgHighVulnerabilities: number;
      imgSecretCriticalVulnerabilities: number;
      imgSecretLowVulnerabilities: number;
    };
    ALERTS: {
      criticalSeverityVulnerabilities: number;
      highSeverityVulnerabilities: number;
      vulnerableLibraries: number;
      mediumSeverityVulnerabilities: number;
      lowSeverityVulnerabilities: number;
    };
    OUTDATED_LIBRARIES: {
      outdatedLibraries: number;
    };
    POLICY_VIOLATIONS: {};
    SAST_SCAN: {
      sastTotalLines: number;
      sastTestedFiles: number;
      sastTotalFiles: number;
      sastTestedLines: number;
      sastTotalMended: number;
      sastTotalRemediations: number;
    };
    VULNERABILITY_SEVERITY_LIBRARIES: {
      lowSeverityLibraries: number;
      highSeverityLibraries: number;
      mediumSeverityLibraries: number;
      criticalSeverityLibraries: number;
    };
    LICENSE_RISK: {
      highRiskLicenses: number;
      mediumRiskLicenses: number;
      lowRiskLicenses: number;
    };
    IAC_SECURITY: {
      iacCriticalMisconfigurations: number;
      iacHighMisconfigurations: number;
      iacTotalMisconfigurations: number;
      iacLowMisconfigurations: number;
      iacMediumMisconfigurations: number;
    };
    SCA_SECURITY: {};
    LICENSE_HISTOGRAM: Record<string, number>;
    SAST_VULNERABILITIES_BY_SEVERITY: {
      sastVulnerabilities: number;
      sastHighVulnerabilities: number;
      sastMediumVulnerabilities: number;
      sastLowVulnerabilities: number;
    };
    LAST_SCAN: {
      lastScanTime: number;
      lastScaScanTime: number;
      lastImgScanTime: number;
      lastSastScanTime: number;
    };
  };
};

export type GetProjectStatisticsSuccessResponseData = {
  supportToken: string;
  response: ProjectStatisticsSuccessResponseData[];
} & PaginationSuccessResponseData;

export type EntityURL = {
  path: string;
  params: {
    org?: string;
    repo?: string;
  };
  namespace?: string;
  kind: string;
  source: string;
};

export enum StatisticsName {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  TOTAL = 'total',
}

export enum StatisticsEngine {
  DEPENDENCIES = 'dependencies',
  CODE = 'code',
  CONTAINERS = 'containers',
}

type StatisticsBase = {
  [StatisticsName.CRITICAL]: number;
  [StatisticsName.HIGH]: number;
  [StatisticsName.MEDIUM]: number;
  [StatisticsName.LOW]: number;
  [StatisticsName.TOTAL]: number;
};

export type Statistics = {
  [StatisticsEngine.DEPENDENCIES]: StatisticsBase;
  [StatisticsEngine.CODE]: Omit<StatisticsBase, StatisticsName.CRITICAL> & {
    [StatisticsName.CRITICAL]: null;
  };
  [StatisticsEngine.CONTAINERS]: StatisticsBase;
} & StatisticsBase;

export type Project = {
  statistics: Statistics;
  uuid: string;
  name: string;
  path: string;
  applicationName: string;
  applicationUuid: string;
  lastScan: number;
  languages: Array<[string, number]>;
  entity: EntityURL;
};

// Code Finding API Data
type CodeFindingDataFlowSuccessResponseData = {
  id: string;
  sink: string;
  sinkKind: string;
  sinkFile: string;
  sinkSnippet: string;
  sinkLine: number;
  inputSource: string;
  inputKind: string;
  inputFlow: [
    {
      name: string;
      kind: string;
      file: string;
      snippet: string;
      line: number;
      startLine: number;
      endLine: number;
    },
  ];
  functionCalls: [
    {
      name: string;
      kind: string;
      file: string;
      snippet: string;
      line: number;
      startLine: number;
      endLine: number;
    },
  ];
  filter: {
    isFiltered: boolean;
    filterTypes: unknown[];
  };
  isNew: boolean;
  rating: number;
  confidenceRating: number;
  ageRating: number;
};

export type CodeFindingSuccessResponseData = {
  id: string;
  scanId: string;
  snapshotId: string;
  projectId: string;
  appId: string;
  type: {
    id: number;
    name: string;
    engineId: number;
    language: string;
    sarif: string;
    sarifLevel: string;
    order: number;
    severity: StatisticsName;
    severityRating: number;
    description: string;
    recommendations: [string];
    references: [string];
    cwe: {
      id: string;
      title: string;
      url: string;
    };
    pcidss: {
      section: string;
      title: string;
    };
    nist: {
      control: string;
      priority: string;
      title: string;
      url: string;
    };
    hipaa: {
      control: string;
      title: string;
    };
    hitrust: {
      control: string;
      title: string;
    };
    owasp: {
      index: string;
      title: string;
      url: string;
    };
    owasp2021: {
      index: string;
      title: string;
      url: string;
    };
    capec: {
      id: string;
      title: string;
      url: string;
    };
    sansTop25: {
      rank: number;
      title: string;
    };
  };
  description: string;
  createdTime: string;
  isNew: boolean;
  severity: StatisticsName;
  baseline: boolean;
  hasRemediation: boolean;
  suppressed: boolean;
  suppressedBy: string;
  suppressionTime: string;
  suppressionMessage: string;
  reviewed: boolean;
  IssueStatus: number;
  sharedStep: {
    name: string;
    kind: string;
    file: string;
    snippet: string;
    line: number;
    startLine: number;
    endLine: number;
    lineBlame: {
      commitId: string;
      file: string;
      line: number;
    };
  };
  dataFlows: CodeFindingDataFlowSuccessResponseData[];
  severityRating: number;
  confidenceRating: number;
  ageRating: number;
  rating: number;
  almIssues: {
    jira: {
      issueId: string;
      project: string;
    };
    azure: {
      workItemId: number;
      project: string;
    };
    jiraPlatform: {
      internalStatus: string;
      issueStatus: string;
      issueKey: string;
      publicLink: string;
      createdTime: string;
      createdBy: string;
      createdByName: string;
    };
  };
  comments: unknown[];
};

export type GetCodeFindingSuccessResponseData = {
  response: CodeFindingSuccessResponseData[];
  supportToken: string;
} & PaginationSuccessResponseData;

export type GetCodeFindingsRequestData = {
  queryParams?: PaginationQueryParams;
  pathParams: PathParams;
};

// Dependencies Finding API Data
export type DependenciesFindingSuccessResponseData = {
  uuid: string;
  name: string;
  type: string;
  component: {
    uuid: string;
    name: string;
    description: string;
    componentType: string;
    libraryType: string;
    rootLibrary: boolean;
    references: {
      url: string;
      homePage: string;
      genericPackageIndex: string;
    };
    groupId: string;
    artifactId: string;
    version: string;
    path: string;
  };
  findingInfo: {
    status: string;
    comment: unknown;
    detectedAt: string;
    modifiedAt: string;
  };
  project: {
    uuid: string;
    name: string;
    path: string;
    applicationUuid: string;
  };
  application: {
    uuid: string;
    name: string;
  };
  vulnerability: {
    name: string;
    type: string;
    description: string;
    score: number;
    severity: StatisticsName;
    publishDate: string;
    modifiedDate: string;
    vulnerabilityScoring: {
      score: number;
      severity: string;
      type: string;
    }[];
  };
  topFix: {
    id: number;
    vulnerability: string;
    type: string;
    origin: string;
    url: string;
    fixResolution: string;
    date: string;
    message: string;
  };
  effective: string;
  threatAssessment: {
    exploitCodeMaturity: string;
    epssPercentage: number;
  };
  exploitable: boolean;
  scoreMetadataVector: string;
};

export type GetDependenciesFindingSuccessResponseData = {
  supportToken: string;
  response: DependenciesFindingSuccessResponseData[];
} & PaginationSuccessResponseData;

export type GetDependenciesFindingsRequestData = {
  queryParams?: PaginationQueryParams;
  pathParams: PathParams;
};

// Containers Finding API Data
export type ContainersFindingSuccessResponseData = {
  uuid: string;
  vulnerabilityId: string;
  description: string;
  projectUuid: string;
  imageName: string;
  packageName: string;
  packageVersion: string;
  severity: StatisticsName;
  cvss: number;
  epss: number;
  hasFix: false;
  fixVersion: string;
  publishedDate: string;
  detectionDate: string;
};

export type GetContainersFindingSuccessResponseData = {
  supportToken: string;
  response: ContainersFindingSuccessResponseData[];
} & PaginationSuccessResponseData;

export type GetContainersFindingsRequestData = {
  queryParams?: PaginationQueryParams;
  pathParams: PathParams;
};

export type Finding = {
  kind: StatisticsEngine;
  level: StatisticsName;
  name: string;
  origin: string;
  time: string;
  projectId: string;
  projectName: string;
  issue: {
    issueStatus: string;
    reporter: string;
    creationDate: string;
    ticketName: string;
    link: string;
    status: string;
  };
};
