import React, { useEffect, useState } from 'react';
import { SimpleSelect } from './SimpleSelectComponent';
import { InputFieldComponent } from './InputFieldComponent';
import { CheckboxSelectComponent } from './CheckboxSelectComponent';
import { Toolbar, ToolbarGroup, ToolbarItem, ToolbarContent } from '@patternfly/react-core';
import { useTheme } from '@material-ui/core/styles';

export const DataFilterComponent = ({ setFilters, data }) => {
    const entities = ['Image', 'CVE', 'Image Component', 'Deployment', 'Namespace', 'Cluster'];
    const attributes = ['Name', 'Discovered time', 'CVSS'];
    const cveSeverityOptions = ['Critical', 'Important', 'Moderate', 'Low'];
    const cveStatusOptions = ['Fixable', 'Not fixable'];

    const theme = useTheme();
    const isDarkMode = theme.palette.type === 'dark';

    const [selectedEntity, setSelectedEntity] = useState(entities[0]);
    const [selectedAttribute, setSelectedAttribute] = useState(attributes[0]);

    const [userText, setUserText] = useState("");
    const [selectedCveSeverityOptions, setSelectedCveSeverityOptions] = useState([]);
    const [selectedCveStatusOptions, setSelectedCveStatusOptions] = useState([]);

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
            "selectedCveSeverityOptions": selectedCveSeverityOptions,
            "selectedCveStatusOptions": selectedCveStatusOptions
        })
    }

    useEffect(() => {
        updateFilters();
    }, [selectedEntity, selectedAttribute, userText, selectedCveSeverityOptions, selectedCveStatusOptions]);

    return (
        <Toolbar className={isDarkMode ? 'pf-v5-theme-dark' : 'pf-v5-theme-light' }>
            <ToolbarContent>
                <ToolbarGroup variant="filter-group">
                    <ToolbarItem>
                        <SimpleSelect
                            options={entities}
                            setSelectedOptions={setSelectedEntity}
                        />

                        <SimpleSelect
                            options={attributes}
                            setSelectedOptions={setSelectedAttribute}
                        />

                        <InputFieldComponent setUserText={setUserText} />
                    </ToolbarItem>
                </ToolbarGroup>

                <ToolbarItem variant="search-filter">
                </ToolbarItem>

                <ToolbarGroup variant="button-group">
                    <ToolbarItem spacer="spacerMd">
                        <CheckboxSelectComponent
                            options={cveSeverityOptions}
                            dropdownName={"CVE severity"}
                            setSelectedOptions={setSelectedCveSeverityOptions}
                        />
                    </ToolbarItem>
                    <ToolbarItem>
                        <CheckboxSelectComponent
                            options={cveStatusOptions}
                            dropdownName={"CVE status"}
                            setSelectedOptions={setSelectedCveStatusOptions}
                        />
                    </ToolbarItem>
                </ToolbarGroup>

            </ToolbarContent>
        </Toolbar>
    )
}

export default DataFilterComponent;
