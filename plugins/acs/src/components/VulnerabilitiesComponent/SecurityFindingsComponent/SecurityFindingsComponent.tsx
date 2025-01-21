import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import { useTheme } from '@material-ui/core/styles';
import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/react-styles';

import { CVEEntityDetailsComponent } from '../CVEEntityDetailsComponent';

export const SecurityFindingsComponent = (data: Array<String>) => {
    console.log("THIS IS MY DATA: ", data)
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
        const d1 = new Date();
        const d2 = new Date(occurenceDate);

        const differenceInMilliseconds = d1 - d2;

        const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

        if (differenceInDays === 1) return `${Math.floor(differenceInDays)} day ago`;

        // TODO: Calculate time that is less than 1 day
        if (differenceInDays < 1) return "PLACEHOLDER";

        return `${Math.floor(differenceInDays)} days ago`
    }

    const checkIsFixable = (vulnItem: any) => {
        for (let i = 0; i < data?.filters?.option4.length; i++) {
            if (vulnItem?.row_data?.status === data?.filters?.option4[i]) return true;
        };

        return false;
    }

    const checkVulnSev = (vulnItem: any) => {
        for (let i = 0; i < data?.filters?.option3.length; i++) {
            console.log("SEVERITY", vulnItem?.row_data?.severity)
            console.log("OPTION3:", data?.filters?.option3)
            if (vulnItem?.row_data?.severity === data?.filters?.option3[i]) return true;
        };

        return false;
    }

    const checkSearch = (vulnItem: any) => {
        if (data?.filters?.option2 === "CVSS") return data?.filters?.optionText === vulnItem?.row_data?.cvss.toString();

        console.log("discovered: ", vulnItem?.row_data?.discovered)
        if (data?.filters?.option2 === "Discovered time") return vulnItem?.row_data?.discovered.includes(data?.filters?.optionText);

        let isTrue = false;
        switch (data?.filters?.option1) {
            case "Image":
                isTrue = vulnItem?.expanded_data?.image.includes(data?.filters.optionText);
                break;
            case "CVE":
                isTrue = vulnItem?.row_data?.cve.includes(data?.filters.optionText);
                break;
            case "Image Component":
                isTrue = vulnItem?.expanded_data?.component.includes(data?.filters.optionText);
                break;
            case "Deployment":
                isTrue = vulnItem?.expanded_data?.deployment.includes(data?.filters.optionText);
                break;
            case "Namespace":
                isTrue = vulnItem?.expanded_data?.namespace.includes(data?.filters.optionText);
                break;
            case "Cluster":
                isTrue = vulnItem?.expanded_data?.cluster.includes(data?.filters.optionText);
                break
        }

        return isTrue;
    }

    const organizeData = () => {
        const rows: any = [];

        data?.data?.forEach((element: String[]) => {
            element?.result?.images?.forEach((element1: Object) => {
                for (const [Key, DeploymentValue2] of Object.entries(element1?.scan?.components)) {
                    if (DeploymentValue2?.vulns.length === 0) continue;

                    DeploymentValue2?.vulns?.forEach((vulns: Array) => {

                        const currItem = {
                            row_data: {
                                cve: vulns?.cve,
                                severity: checkVulnSeverity(vulns?.severity),
                                status: isFixable(vulns?.fixedBy),
                                workload: element?.result?.deployment?.name,
                                image: element1?.name?.fullName,
                                cvss: vulns?.cvss.toString(),
                                discovered: getDiscovered(vulns?.firstImageOccurrence),
                                link: vulns?.link,
                            },
                            expanded_data: {
                                severity: checkVulnSeverity(vulns?.severity),
                                first_discovered: formatISODateTime(vulns?.firstImageOccurrence),
                                published: formatISODateTime(vulns?.publishedOn) || "N/A",
                                summary: vulns?.summary,
                                workload: element?.result?.deployment?.name,
                                namespace: element?.result?.deployment?.namespace,
                                cluster: element?.result?.deployment?.clusterName,
                                image: element1?.name?.fullName,
                                component: DeploymentValue2?.name,
                                version: DeploymentValue2?.version,
                                cveFixedIn: vulns?.fixedBy,
                                source: DeploymentValue2?.source,
                                location: DeploymentValue2?.location || "N/A",
                            }
                        }

                        // Check data against various user selected filters
                        if (data?.filters?.option4?.length > 0) {
                            if (!checkIsFixable(currItem)) return;
                        }

                        if (data?.filters?.option3?.length > 0) {
                            if (!checkVulnSev(currItem)) return;
                        }

                        if (data?.filters?.optionText !== "") {
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
    }, [data]);

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
