import React, { useEffect, useState } from 'react';
import DataTable, { ExpanderComponentProps } from 'react-data-table-component';
import { CVEEntityDetailsComponent } from '../CVEEntityDetailsComponent';

export const SecurityFindingsComponent = (data: Array<String>) => {
    const [dataRows, setDataRows] = useState([]);
    const [pending, setPending] = React.useState(true);

    const columns: [] = [
        { name: 'CVE', selector: row => row.row_data.cve, sortable: true, wrap: true, width: '140px' },
        { name: 'Severity', selector: row => row.row_data.severity, sortable: true, wrap: true, width: '100px' },
        { name: 'Status', selector: row => row.row_data.status, sortable: true, wrap: true, width: '100px' },
        { name: 'Workload', selector: row => row.row_data.workload, sortable: true, wrap: true, width: '150px' },
        { name: 'Image', selector: row => row.row_data.image, sortable: true, wrap: true, width: '200px' },
        { name: 'CVSS', selector: row => row.row_data.cvss, sortable: true, wrap: true, width: '85px' },
        { name: 'Discovered', selector: row => row.row_data.discovered, sortable: true, wrap: true, width: '125px' },
        { name: 'Advisory', selector: row => row.row_data.advisor, sortable: true, wrap: true, width: '150px' }
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

    const organizeData = () => {
        const rows: any = [];
        const cveEntityDetailsData: any = {};
    
        console.log(data)
        data?.data?.forEach((element: Object) => {
            console.log("ELEMENT: ", element);
    
            // for (const [deploymentKey, DeploymentValue] of Object.entries(element)) {
            element?.result?.images?.forEach((element1: Object) => {
                // console.log("ELEMENT1: ", element1);
    
                for (const [Key, DeploymentValue2] of Object.entries(element1?.scan?.components)) {
                    
                    if (DeploymentValue2.vulns.length > 0) {
                        console.log("DeploymentValue2: ", DeploymentValue2)

                        DeploymentValue2?.vulns?.forEach((vulns: Array) => {
                            // console.log("vulns: ", vulns)

                            rows.push({
                                row_data: {
                                    cve: vulns?.cve,
                                    severity: checkVulnSeverity(vulns?.severity),
                                    status: isFixable(vulns?.fixedBy),
                                    workload: element?.result?.deployment?.name,
                                    image: element1?.name?.fullName,
                                    cvss: vulns?.cvss,
                                    discovered: vulns?.firstImageOccurrence,
                                    advisory: ''
                                },
                                expanded_data: {
                                    severity: checkVulnSeverity(vulns?.severity),
                                    first_discovered: vulns?.firstImageOccurrence,
                                    published: vulns?.publishedOn,
                                    summary: vulns?.summary,
                                    workload: element?.result?.deployment?.name,
                                    cluster: element?.result?.deployment?.clusterName,
                                    image: element1?.name?.fullName,
                                    component: '',
                                    version: '',
                                    cveFixedIn: vulns?.fixedBy,
                                    source: DeploymentValue2?.source,
                                    location: '',
                                    advisory: '',
                                }
                            });
                        })
                    }
                }
            })
        });

        console.log("rows: ", rows)

        setPending(false)
        setDataRows(rows);
    }

    useEffect(() => {
        organizeData();
    }, []);


    return (
        <div>
            <DataTable
                data={dataRows}
                columns={columns}
                expandableRows 
                expandableRowsComponent={CVEEntityDetailsComponent}
                expandableRowsComponentProps={{"cveDetails": "CVE details", "entityDetails": "Entity details"}}
                progressPending={pending} 
                // progressComponent={<CustomLoader />}
                theme="dark"
                pagination

                
            />
        </div>
    )
}