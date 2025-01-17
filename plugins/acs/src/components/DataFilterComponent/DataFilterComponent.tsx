import React, { useState, useCallback } from 'react';
import Grid from '@mui/material/Grid2';
import { styled, Theme, useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
//import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl, { useFormControl } from '@mui/material/FormControl';

import InputBase from '@mui/material/InputBase';

import { SimpleSelect } from './SimpleSelectComponent';
import { InputFieldComponent } from './InputFieldComponent';
import { CheckboxSelectComponent } from './CheckboxSelectComponent';

import {
    Checkbox,
    Flex,
    Select,
    SelectOption,
    SelectList,
    MenuToggle,
    MenuToggleElement,
} from '@patternfly/react-core';

export const DataFilterComponent = ({ updateWithFilteredData, data }) => {
    const options1 = ['Image', 'CVE', 'Image Component', 'Deployment', 'Namespace', 'Cluster'];
    const options2 = ['Name', 'Discovered time', 'CVSS'];
    const cveSeverityOptions = ['Critical', 'Important', 'Moderate', 'Low'];
    const cveStatusOptions = ['Fixable', 'Not fixable'];

    const [currentOptions1, setCurrentOptions1] = useState("");
    const [currentOptions2, setCurrentOptions2] = useState("");
    const [currentCveSeverityOptions, setCurrentCveSeverityOptions] = useState([]);
    const [currentCveStatusOptions, setCurrentCveStatusOptions] = useState([]);

    console.log("currentCveSeverityOptions: ", currentCveSeverityOptions)

    //// TODO: rename these functions
    const handleChange1 = useCallback((event: SelectChangeEvent<typeof currentOptions1>) => {
        setCurrentOptions1(event.target.value);
    });

    const handleChange2 = useCallback((event: SelectChangeEvent<typeof currentOptions2>) => {
        setCurrentOptions2(event.target.value);
    });

    const handleChange3 = useCallback((event: SelectChangeEvent<typeof currentCveSeverityOptions>) => {
        setCurrentCveSeverityOptions(event);
    });

    const handleChange4 = useCallback((event: SelectChangeEvent<typeof currentCveStatusOptions>) => {
        setCurrentCveStatusOptions(event);
    });

    return (
        <Flex
            direction={{ default: 'row' }}
            spaceItems={{ default: 'spaceItemsNone' }}
            flexWrap={{ default: 'nowrap' }}
            className="pf-v5-u-w-100"
        >
            <SimpleSelect options={options1} />
            <SimpleSelect options={options2} />

            <InputFieldComponent />

            <CheckboxSelectComponent 
                options={cveSeverityOptions}
                dropdownName={"CVE severity"}
                setValueOptions={handleChange3}
            /> 

            <CheckboxSelectComponent
                options={cveStatusOptions}
                dropdownName={"CVE status"}
                setValueOptions={handleChange4}
            />
        </Flex>
    )
}

export default DataFilterComponent;

//export const DataFilterComponent = ({ updateWithFilteredData, data }) => {
    //console.log("callback function data: ", data)
    //const ITEM_HEIGHT = 48;
    //const ITEM_PADDING_TOP = 25;
    //const MenuProps = {
      //PaperProps: {
        //style: {
          //maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
          //width: 100,
        //},
      //},
    //};

    //const options1 = ['Image', 'CVE', 'Image Component', 'Deployment', 'Namespace', 'Cluster'];
    //const options2 = ['Name', 'Discovered time', 'CVSS'];
    //const cveSeverityOptions = ['Critical', 'Important', 'Moderate', 'Low'];
    //const cveStatusOptions = ['Fixable', 'Not fixable'];

    //const [currentOptions1, setCurrentOptions1] = useState("");
    //const [currentOptions2, setCurrentOptions2] = useState("");
    //const [currentCveSeverityOptions, setCurrentCveSeverityOptions] = useState("");
    //const [currentCveStatusOptions, setCurrentCveStatusOptions] = useState("");

    //function getStyles(name: string, personName: readonly string[], theme: Theme) {
      //return {
        //fontWeight: personName.includes(name)
          //? theme.typography.fontWeightMedium
          //: theme.typography.fontWeightRegular,
        //};
      //}

      //const theme = useTheme();
      //const [personName, setPersonName] = React.useState<string[]>([]);

      //// TODO: rename these functions
      //const handleChange1 = (event: SelectChangeEvent<typeof personName>) => {
        //setCurrentOptions1(event.target.value);
      //};

      //const handleChange2 = (event: SelectChangeEvent<typeof personName>) => {
        //setCurrentOptions2(event.target.value);
      //};

      //const handleChange3 = (event: SelectChangeEvent<typeof personName>) => {
        //setCurrentCveSeverityOptions(typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value);
      //};

      //const handleChange4 = (event: SelectChangeEvent<typeof personName>) => {
        //setCurrentCveStatusOptions(typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value);
      //};

    //const FilterDropDown = (options: any, selectChangeHandler: any) => {
        //console.log("options: ", options)
        //console.log("selectChangeHandler: ", selectChangeHandler)
        //return (
          //<FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            //<Select
              //displayEmpty
              //value={options.currentOption}
              //onChange={options.selectChangeHandler}
              //input={<OutlinedInput />}
              //renderValue={(selected) => {
                //if (selected.length === 0) {
                  //return <em>{selected}</em>;
                //}
                //return selected
              //}}
              //MenuProps={MenuProps}
              //inputProps={{ 'aria-label': 'Without label' }}
            //>
              //{options.options.map((value) => (
                //<MenuItem
                  //key={value}
                  //value={value}
                //>
                  //{value}
                //</MenuItem>
              //))}
            //</Select>
          //</FormControl>
        //)
    //}

        //const BootstrapInput = styled(InputBase)(({ theme }) => ({
          //'label + &': {
        //marginTop: theme.spacing(3),
      //},
      //'& .MuiInputBase-input': {
        //borderRadius: 4,
        //position: 'relative',
        //backgroundColor: theme.palette.background.paper,
        //border: '1px solid #ced4da',
        //fontSize: 16,
        //padding: '10px 26px 10px 12px',
        //transition: theme.transitions.create(['border-color', 'box-shadow']),
        //// Use the system font instead of the default Roboto font.
        //fontFamily: [
          //'-apple-system',
          //'BlinkMacSystemFont',
          //'"Segoe UI"',
          //'Roboto',
          //'"Helvetica Neue"',
          //'Arial',
          //'sans-serif',
          //'"Apple Color Emoji"',
          //'"Segoe UI Emoji"',
          //'"Segoe UI Symbol"',
        //].join(','),
        //'&:focus': {
          //borderRadius: 4,
          //borderColor: '#80bdff',
          //boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
        //},
      //},
    //}));

    //return (  
      //<div>
        //<grid container spacing={2}>
          //<grid size={{ xs: 6, md: 4 }}>
            //<FilterDropDown options={options1} currentOption={currentOptions1} selectChangeHandler={handleChange1} />
          //</grid>
          //<grid size={{ xs: 6, md: 4 }}>
            //<FilterDropDown options={options2} currentOption={currentOptions2} selectChangeHandler={handleChange2} />
          //</grid> 
          //<grid size={{ xs: 6, md: 4 }}>
            //<BootstrapInput id="demo-customized-textbox" />
          //</grid>
          //<grid size={{ xs: 6, md: 4 }}>
            //<FilterDropDown options={cveSeverityOptions} currentOption={currentCveSeverityOptions} selectChangeHandler={handleChange3} />
          //</grid>
          //<grid size={{ xs: 6, md: 4 }}>
            //<FilterDropDown options={cveStatusOptions} currentOption={currentCveStatusOptions} selectChangeHandler={handleChange4} />
          //</grid> 
        //</grid>
//      </div>
 //   ); }
