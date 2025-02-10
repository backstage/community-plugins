import React, { useEffect, useState } from 'react';
import { EntitySelectComponent} from './EntitySelectComponent';
import { AttributeSelectComponent } from './AttributeSelectComponent';
import { InputFieldComponent } from './InputFieldComponent';
import { CheckboxSelectComponent } from './CheckboxSelectComponent';
import { Toolbar, ToolbarGroup, ToolbarItem, ToolbarContent } from '@patternfly/react-core';
import { useTheme } from '@material-ui/core/styles';

export const DataFilterComponent = ({ setFilters, data }) => {
    const attributes = ['Name', 'Discovered time', 'CVSS'];
    const entities = {
        'Image': [ 'Name'],
        'CVE': ['Name', 'Discovered time', 'CVSS'],
        'Image Component': ['Name'],
        'Deployment': ['Name'],
        'Namespace': ['Name'],
        'Cluster': ['Name']
    };

    const cveSeverityOptions = ['Critical', 'Important', 'Moderate', 'Low'];
    const cveStatusOptions = ['Fixable', 'Not fixable'];

    const theme = useTheme();
    const isDarkMode = theme.palette.type === 'dark';

    const [selectedEntity, setSelectedEntity] = useState("Image");
    const [selectedAttribute, setSelectedAttribute] = useState("Name");

    const [userText, setUserText] = useState("");
    const [selectedCveSeverityOptions, setSelectedCveSeverityOptions] = useState([]);
    const [selectedCveStatusOptions, setSelectedCveStatusOptions] = useState([]);

    const getSelectedAttributes = () => {
        return entities[selectedEntity]
    };

    const modifyPFCardStyle = () => {
    const style = document.createElement('style');
    style.id = 'filter-group-styles';
    style.innerHTML = `
      [class*="pf-v5-c-toolbar"] {
        background-color: var(--p--pf-v5-global--palette--black-500) !important;
      }
  ` ;
    // Append the style element to the document head
    document.head.appendChild(style);
  };

  const removeCustomStyles = () => {
    const style = document.getElementById('ai-search-styles');
    if (style) {
      style.remove();
    }
  };

  useEffect(() => {
    modifyPFCardStyle();
    return () => {
      removeCustomStyles();
    };
  }, []);

  useEffect(() => {
    setFilters({
      "selectedEntity": selectedEntity,
      "selectedAttribute": selectedAttribute,
      "optionText": userText,
      "selectedCveSeverityOptions": selectedCveSeverityOptions,
      "selectedCveStatusOptions": selectedCveStatusOptions
    })
    // eslint-disable-next-line
  }, [selectedEntity, selectedAttribute, userText, selectedCveSeverityOptions, selectedCveStatusOptions]);

  return (
    <Toolbar className={isDarkMode ? 'pf-v5-theme-dark' : 'pf-v5-theme-light' }>
      <ToolbarContent>
        <ToolbarGroup variant="filter-group">
          <ToolbarItem>
            <EntitySelectComponent
                options={entities}
                setSelectedEntity={setSelectedEntity}
            />

            <AttributeSelectComponent
                options={attributes}
                displayAttributes={getSelectedAttributes()}
                setSelectedAttribute={setSelectedAttribute}
            />

            <InputFieldComponent setUserText={setUserText} />
          </ToolbarItem>
        </ToolbarGroup>

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
