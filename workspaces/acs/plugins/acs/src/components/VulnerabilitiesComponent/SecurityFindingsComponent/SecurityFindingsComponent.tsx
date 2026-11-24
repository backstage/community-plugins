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
import { useCallback, useEffect, useState } from 'react';

import * as React from 'react';
import DataTable from 'react-data-table-component';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import { useTheme } from '@material-ui/core/styles';
import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/react-styles';

import { CVEEntityDetailsComponent } from '../CVEEntityDetailsComponent';

interface SecurityFindingsProps {
  data: any;
  filters: {
    selectedEntity: string;
    selectedAttribute: string;
    userText: string;
    selectedCveSeverityOptions: string[];
    selectedCveStatusOptions: string[];
  };
}

export const SecurityFindingsComponent = ({
  data,
  filters,
}: SecurityFindingsProps) => {
  const [dataRows, setDataRows] = useState([]);
  const [pending, setPending] = React.useState(true);
  const theme = useTheme();
  const isDarkMode = theme.palette.type === 'dark';

  const columns: Array<any> = [
    {
      name: 'CVE',
      selector: (row: any) => row.rowData.cve,
      sortable: true,
      wrap: true,
      width: '140px',
      cell: (row: any) => (
        <a href={row.rowData.link} target="_blank" rel="noopener noreferrer">
          {row.rowData.cve}
        </a>
      ),
    },
    {
      name: 'Severity',
      selector: (row: any) => row.rowData.severity,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Status',
      selector: (row: any) => row.rowData.status,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Workload',
      selector: (row: any) => row.rowData.workload,
      sortable: true,
      wrap: true,
      grow: 2,
    },
    {
      name: 'Image',
      selector: (row: any) => row.rowData.image,
      sortable: true,
      wrap: true,
      grow: 2,
    },
    {
      name: 'EPSS',
      selector: (row: any) => row.rowData.epss,
      sortable: true,
      wrap: true,
    },
    {
      name: 'CVSS',
      selector: (row: any) => row.rowData.cvss,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Discovered',
      selector: (row: any) => row.rowData.discovered,
      sortable: true,
      wrap: true,
    },
  ];

  const checkVulnSeverity = (vulnSeverity: string) => {
    let severityLevel: string = '';

    switch (vulnSeverity) {
      case 'LOW_VULNERABILITY_SEVERITY':
        severityLevel = 'Low';
        break;
      case 'MODERATE_VULNERABILITY_SEVERITY':
        severityLevel = 'Moderate';
        break;
      case 'IMPORTANT_VULNERABILITY_SEVERITY':
        severityLevel = 'Important';
        break;
      case 'CRITICAL_VULNERABILITY_SEVERITY':
        severityLevel = 'Critical';
        break;
      default:
        severityLevel = 'N/A';
        break;
    }

    return severityLevel;
  };

  const isFixable = (fixedVersion: string) => {
    if (fixedVersion) return 'Fixable';

    return 'Not fixable';
  };

  const formatISODateTime = (isoDateString: any) => {
    const date = new Date(isoDateString);

    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString();

    return `${formattedDate} | ${formattedTime}`;
  };

  const getDiscovered = (occurenceDate: string) => {
    const currDate: any = new Date();
    const incidentDate: any = new Date(occurenceDate);

    const differenceInMilliseconds = currDate - incidentDate;
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

    if (differenceInDays < 1)
      return `${Math.floor(24 * differenceInDays)} hour(s) ago`;

    return `${Math.floor(differenceInDays)} day(s) ago`;
  };

  const checkIsFixable = (vulnItem: any) => {
    for (let i = 0; i < filters?.selectedCveStatusOptions.length; i++) {
      if (vulnItem?.rowData?.status === filters?.selectedCveStatusOptions[i])
        return true;
    }

    return false;
  };

  const checkVulnSev = (vulnItem: any) => {
    for (let i = 0; i < filters?.selectedCveSeverityOptions.length; i++) {
      if (
        vulnItem?.rowData?.severity === filters?.selectedCveSeverityOptions[i]
      )
        return true;
    }

    return false;
  };

  const checkSearch = (vulnItem: any) => {
    let isTrue = false;
    const attribute = filters?.selectedAttribute;
    switch (filters?.selectedEntity) {
      case 'Image':
        if (attribute === 'Name')
          isTrue = vulnItem?.expandedData?.image.includes(filters.userText);
        break;
      case 'CVE':
        if (attribute === 'Name')
          isTrue = vulnItem?.rowData?.cve.includes(filters.userText);
        if (attribute === 'Discovered time')
          isTrue = vulnItem?.rowData?.discovered.includes(filters.userText);
        if (attribute === 'CVSS')
          isTrue = vulnItem?.rowData?.cvss
            .toString()
            .includes(filters.userText);
        break;
      case 'Image Component':
        if (attribute === 'Name')
          isTrue = vulnItem?.expandedData?.component.includes(filters.userText);
        break;
      case 'Deployment':
        if (attribute === 'Name')
          isTrue = vulnItem?.rowData?.workload.includes(filters.userText);
        break;
      case 'Namespace':
        if (attribute === 'Name')
          isTrue = vulnItem?.expandedData?.namespace.includes(filters.userText);
        break;
      case 'Cluster':
        if (attribute === 'Name')
          isTrue = vulnItem?.expandedData?.cluster.includes(filters.userText);
        break;
      default:
        break;
    }

    return isTrue;
  };

  const organizeData = useCallback(() => {
    const rows: any = [];

    data?.jsonData?.forEach((deployment: any) => {
      deployment?.result?.images?.forEach((item: any) => {
        if (!item?.scan) return;

        for (const [_, component] of Object.entries(
          item?.scan?.components,
        ) as any) {
          if (component?.vulns?.length === 0) continue;

          component?.vulns?.forEach((vulns: any) => {
            const currItem = {
              rowData: {
                cve: vulns?.cve,
                severity: checkVulnSeverity(vulns?.severity),
                status: isFixable(vulns?.fixedBy),
                workload: deployment?.result?.deployment?.name,
                image: item?.name?.fullName,
                epss: item?.epss || '',
                cvss: vulns?.cvss.toString(),
                discovered: getDiscovered(vulns?.firstImageOccurrence),
                link: vulns?.link,
              },
              expandedData: {
                severity: checkVulnSeverity(vulns?.severity),
                firstDiscovered: formatISODateTime(vulns?.firstImageOccurrence),
                published: formatISODateTime(vulns?.publishedOn) || 'N/A',
                summary: vulns?.summary,
                workload: deployment?.result?.deployment?.name,
                namespace: deployment?.result?.deployment?.namespace,
                cluster: deployment?.result?.deployment?.clusterName,
                image: item?.name?.fullName,
                component: component?.name,
                version: component?.version,
                cveFixedIn: vulns?.fixedBy,
                source: component?.source,
                location: component?.location || 'N/A',
              },
            };

            // Check data against various user selected filters
            if (filters?.selectedCveStatusOptions?.length > 0) {
              if (!checkIsFixable(currItem)) return;
            }

            if (filters?.selectedCveSeverityOptions?.length > 0) {
              if (!checkVulnSev(currItem)) return;
            }

            if (filters?.userText !== '') {
              if (!checkSearch(currItem)) return;
            }

            rows.push(currItem);
          });
        }
      });
    });

    setPending(false);
    setDataRows(rows);
    // eslint-disable-next-line
  }, [data, filters]);

  useEffect(() => {
    organizeData();
    // eslint-disable-next-line
  }, [organizeData]);

  return (
    <div>
      <DataTable
        data={dataRows}
        columns={columns}
        expandableRows
        expandableRowsComponent={CVEEntityDetailsComponent}
        expandableRowsComponentProps={{
          cveDetails: 'CVE details',
          entityDetails: 'Entity details',
        }}
        progressPending={pending}
        sortIcon={<ArrowDownward />}
        theme={isDarkMode ? 'dark' : 'light'}
        highlightOnHover
        pagination
      />
    </div>
  );
};
