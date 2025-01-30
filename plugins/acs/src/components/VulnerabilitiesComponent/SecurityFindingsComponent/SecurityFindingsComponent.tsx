import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import { useTheme } from '@material-ui/core/styles';
import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/react-styles';

import { CVEEntityDetailsComponent } from '../CVEEntityDetailsComponent';

export const SecurityFindingsComponent = ({ data, filters }) => {
    console.log("DATA:", data)

    const [dataRows, setDataRows] = useState([]);
    const [pending, setPending] = React.useState(true);
    const theme = useTheme();
    const isDarkMode = theme.palette.type === 'dark';

    const columns: Array<any> = [
        { name: 'CVE', selector: row => row.row_data.cve, sortable: true, wrap: true, width: '140px', button: true, cell: row => (
			<a href={row.row_data.link} target="_blank" rel="noopener noreferrer">
				{row.row_data.cve}
			</a>
		), },
        { name: 'Severity', selector: row => row.row_data.severity, sortable: true, wrap: true },
        { name: 'Status', selector: row => row.row_data.status, sortable: true, wrap: true },
        { name: 'Workload', selector: row => row.row_data.workload, sortable: true, wrap: true, grow: 2 },
        { name: 'Image', selector: row => row.row_data.image, sortable: true, wrap: true, grow: 2 },
        { name: 'CVSS', selector: row => row.row_data.cvss, sortable: true, wrap: true },
        { name: 'Discovered', selector: row => row.row_data.discovered, sortable: true, wrap: true },
    ];

    const checkVulnSeverity = (vulnSeverity: string) => {
        let severityLevel: string = "";

        switch (vulnSeverity) {
            case "LOW_VULNERABILITY_SEVERITY":
                severityLevel = "Low"
                break;
            case "MODERATE_VULNERABILITY_SEVERITY":
                severityLevel = "Moderate"
                break;
            case "IMPORTANT_VULNERABILITY_SEVERITY":
                severityLevel = "Important"
                break;
            case "CRITICAL_VULNERABILITY_SEVERITY":
                severityLevel = "Critical"
                break;
            default:
                severityLevel = "N/A"
                break;
        }

        return severityLevel;
    }

    const isFixable = (fixedVersion: string) => {
        if (fixedVersion) return "Fixable";

        return "Not fixable";
    }

    const formatISODateTime = (isoDateString: any) => {
        const date = new Date(isoDateString);

        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString();

        return `${formattedDate} | ${formattedTime}`;
    }

    const getDiscovered = (occurenceDate: string) => {
        const currDate = new Date();
        const incidentDate = new Date(occurenceDate);

        const differenceInMilliseconds = currDate - incidentDate;

        const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

        if (differenceInDays === 1) return `${Math.floor(differenceInDays)} day ago`;

        // TODO: Calculate time that is less than 1 day
        if (differenceInDays < 1) return "PLACEHOLDER";

        return `${Math.floor(differenceInDays)} days ago`
    }

    const checkIsFixable = (vulnItem: any) => {
        for (let i = 0; i < filters?.selectedCveStatusOptions.length; i++) {
            if (vulnItem?.row_data?.status === filters?.selectedCveStatusOptions[i]) return true;
        };

        return false;
    }

    const checkVulnSev = (vulnItem: any) => {
        for (let i = 0; i < filters?.selectedCveSeverityOptions.length; i++) {
            if (vulnItem?.row_data?.severity === filters?.selectedCveSeverityOptions[i]) return true;
        };

        return false;
    }

    const checkSearch = (vulnItem: any) => {
        let isTrue = false;
        const attribute = filters?.selectedAttribute;
        switch (filters?.selectedEntity) {
            case "Image":
                if (attribute === "Name") isTrue = vulnItem?.expanded_data?.image.includes(filters.optionText);
                break;
            case "CVE":
                if (attribute === "Name") isTrue = vulnItem?.row_data?.cve.includes(filters.optionText);
                if (attribute === "Discovered time") isTrue = vulnItem?.row_data?.discovered.includes(filters.optionText);
                if (attribute === "CVSS") isTrue = vulnItem?.row_data?.cvss.toString().includes(filters.optionText);
                break;
            case "Image Component":
                if (attribute === "Name") isTrue = vulnItem?.expanded_data?.component.includes(filters.optionText);
                break;
            case "Deployment":
                if (attribute === "Name") isTrue = vulnItem?.row_data?.workload.includes(filters.optionText);
                break;
            case "Namespace":
                if (attribute === "Name") isTrue = vulnItem?.expanded_data?.namespace.includes(filters.optionText);
                break;
            case "Cluster":
                if (attribute === "Name") isTrue = vulnItem?.expanded_data?.cluster.includes(filters.optionText);
                break
            default:
                break;
        }

        return isTrue;
    }

    const organizeData = () => {
        const rows: any = [];

        data?.forEach((deployment: String[]) => {
            deployment?.result?.images?.forEach((item: Object) => {
                if (!item?.scan) return;

                for (const [_, component] of Object.entries(item?.scan?.components)) {
                    if (component?.vulns?.length === 0) continue;

                    component?.vulns?.forEach((vulns: Array) => {
                        const currItem = {
                            row_data: {
                                cve: vulns?.cve,
                                severity: checkVulnSeverity(vulns?.severity),
                                status: isFixable(vulns?.fixedBy),
                                workload: deployment?.result?.deployment?.name,
                                image: item?.name?.fullName,
                                cvss: vulns?.cvss.toString(),
                                discovered: getDiscovered(vulns?.firstImageOccurrence),
                                link: vulns?.link,
                            },
                            expanded_data: {
                                severity: checkVulnSeverity(vulns?.severity),
                                first_discovered: formatISODateTime(vulns?.firstImageOccurrence),
                                published: formatISODateTime(vulns?.publishedOn) || "N/A",
                                summary: vulns?.summary,
                                workload: deployment?.result?.deployment?.name,
                                namespace: deployment?.result?.deployment?.namespace,
                                cluster: deployment?.result?.deployment?.clusterName,
                                image: item?.name?.fullName,
                                component: component?.name,
                                version: component?.version,
                                cveFixedIn: vulns?.fixedBy,
                                source: component?.source,
                                location: component?.location || "N/A",
                            }
                        }

                        // Check data against various user selected filters
                        if (filters?.selectedCveStatusOptions?.length > 0) {
                            if (!checkIsFixable(currItem)) return;
                        }

                        if (filters?.selectedCveSeverityOptions?.length > 0) {
                            if (!checkVulnSev(currItem)) return;
                        }

                        if (filters?.optionText !== "") {
                            if (!checkSearch(currItem)) return;
                        }

                        rows.push(currItem);
                    })
                }
            })
        });

        setPending(false)
        setDataRows(rows);
    }

    useEffect(() => {
        organizeData();
    }, [data, filters]);

    return (
        <div>
            <DataTable
                data={dataRows}
                columns={columns}
                expandableRows
                expandableRowsComponent={CVEEntityDetailsComponent}
                expandableRowsComponentProps={{
                    "cveDetails": "CVE details",
                    "entityDetails": "Entity details"
                }}
                progressPending={pending}
                sortIcon={<ArrowDownward />}
                theme={isDarkMode ? 'dark' : 'light'}
                highlightOnHover
                pagination
            />
        </div>
    )
}
