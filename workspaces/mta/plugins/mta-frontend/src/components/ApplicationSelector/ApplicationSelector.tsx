// Example of a React component using Material-UI for the dropdown
import React from 'react';
import { MenuItem, FormControl, Select, InputLabel } from '@material-ui/core';

const ApplicationSelector = ({ applications, onSelect }: any) => (
  <FormControl fullWidth>
    <InputLabel id="app-selector-label">Application</InputLabel>
    <Select
      labelId="app-selector-label"
      id="app-selector"
      onChange={e => onSelect(e.target.value)}
      label="Application"
    >
      {applications.map((app: any) => (
        <MenuItem key={app.name} value={app.name}>
          {app.name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

export default ApplicationSelector;
