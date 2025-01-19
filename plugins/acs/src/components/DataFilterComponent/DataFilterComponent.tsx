import React, { useEffect, useState } from 'react';
import { SimpleSelect } from './SimpleSelectComponent';
import { InputFieldComponent } from './InputFieldComponent';
import { CheckboxSelectComponent } from './CheckboxSelectComponent';

import {
    Flex,
} from '@patternfly/react-core';

export const DataFilterComponent = ({ setFilters, data }) => {
    const options1 = ['Image', 'CVE', 'Image Component', 'Deployment', 'Namespace', 'Cluster'];
    const options2 = ['Name', 'Discovered time', 'CVSS'];
    const cveSeverityOptions = ['Critical', 'Important', 'Moderate', 'Low'];
    const cveStatusOptions = ['Fixable', 'Not fixable'];

    const [currentOptions1, setCurrentOptions1] = useState("Select a value");
    const [currentOptions2, setCurrentOptions2] = useState("Select a value");
    const [currentCveSeverityOptions, setCurrentCveSeverityOptions] = useState([]);
    const [currentCveStatusOptions, setCurrentCveStatusOptions] = useState([]);

    console.log("currentOptions1: ", currentOptions1)
    console.log("currentOptions2: ", currentOptions2)
    console.log("currentCveSeverityOptions: ", currentCveSeverityOptions)
    console.log("currentCveStatusOptions: ", currentCveStatusOptions)

    console.log("data: ", data);

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

    useEffect(() => {

    }, [currentOptions1, currentOptions2, currentCveSeverityOptions, currentCveStatusOptions]);

    return (
        <Flex
            direction={{ default: 'row' }}
            spaceItems={{ default: 'spaceItemsNone' }}
            flexWrap={{ default: 'nowrap' }}
            className="pf-v5-u-w-100"
        >
            <SimpleSelect
                options={options1}
                setSelectedOptions={setCurrentOptions1}
            />

            <SimpleSelect
                options={options2}
                setSelectedOptions={setCurrentOptions2}
            />

            <InputFieldComponent />

            <CheckboxSelectComponent
                options={cveSeverityOptions}
                dropdownName={"CVE severity"}
                setSelectedOptions={setCurrentCveSeverityOptions}
            />

            <CheckboxSelectComponent
                options={cveStatusOptions}
                dropdownName={"CVE status"}
                setSelectedOptions={setCurrentCveStatusOptions}
            />
        </Flex>
    )
}

export default DataFilterComponent;
