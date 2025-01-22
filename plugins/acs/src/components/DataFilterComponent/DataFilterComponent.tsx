import React, { useEffect, useState } from 'react';
import { SimpleSelect } from './SimpleSelectComponent';
import { InputFieldComponent } from './InputFieldComponent';
import { CheckboxSelectComponent } from './CheckboxSelectComponent';
import Grid from '@mui/material/Grid2';

import {
    Flex,
} from '@patternfly/react-core';

export const DataFilterComponent = ({ setFilters, data }) => {
    const options1 = ['Image', 'CVE', 'Image Component', 'Deployment', 'Namespace', 'Cluster'];
    const options2 = ['Name', 'Discovered time', 'CVSS'];
    const cveSeverityOptions = ['Critical', 'Important', 'Moderate', 'Low'];
    const cveStatusOptions = ['Fixable', 'Not fixable'];

    const [selectedEntity, setSelectedEntity] = useState(options1[0]);
    const [selectedAttribute, setSelectedAttribute] = useState(options2[0]);

    const [userText, setUserText] = useState("");
    const [selectedCveSeverityOptions, setSelectedCveSeverityOptions] = useState([]);
    const [selectedCveStatusOptions, setSelectedCveStatusOptions] = useState([]);

    console.log("currentOptions1: ", selectedEntity)
    console.log("currentOptions2: ", selectedAttribute)
    console.log("optionSearch: ", userText)
    console.log("currentCveSeverityOptions: ", selectedCveSeverityOptions)
    console.log("currentCveStatusOptions: ", selectedCveStatusOptions)

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

    const updateFilters = () => {
        setFilters({
            "selectedEntity": selectedEntity,
            "selectedAttribute": selectedAttribute,
            "optionText": userText,
            "option3": selectedCveSeverityOptions,
            "option4": selectedCveStatusOptions
        })
    }

    useEffect(() => {
        updateFilters();
    }, [selectedEntity, selectedAttribute, userText, selectedCveSeverityOptions, selectedCveStatusOptions]);

    return (
        <Grid container spacing={5}>
          <Grid size={8}>
            <Flex
                direction={{ default: 'row' }}
                spaceItems={{ default: 'spaceItemsNone' }}
                flexWrap={{ default: 'nowrap' }}
           //     className="pf-v5-u-w-100"
            >
                <SimpleSelect
                    menuToggleClassName="pf-v5-u-flex-shrink-0"
                    options={options1}
                    setSelectedOptions={setSelectedEntity}
                />

                <SimpleSelect
                    menuToggleClassName="pf-v5-u-flex-shrink-0"
                    options={options2}
                    setSelectedOptions={setSelectedAttribute}
                />

                <InputFieldComponent setUserText={setUserText} />
            </Flex>
          </ Grid>

          <Grid size={2}>
            <CheckboxSelectComponent
                options={cveSeverityOptions}
                dropdownName={"CVE severity"}
                setSelectedOptions={setSelectedCveSeverityOptions}
            />
          </ Grid>

          <Grid size={2}>
            <CheckboxSelectComponent
                options={cveStatusOptions}
                dropdownName={"CVE status"}
                setSelectedOptions={setSelectedCveStatusOptions}
            />
          </ Grid>
        </ Grid>
    )
}

export default DataFilterComponent;
