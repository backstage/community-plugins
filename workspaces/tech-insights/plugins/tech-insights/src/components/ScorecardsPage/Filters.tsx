/*
 * Copyright 2021 The Backstage Authors
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

import { Check } from '@backstage-community/plugin-tech-insights-common';
import Typography from '@material-ui/core/Typography';
import Autocomplete from '@material-ui/lab/Autocomplete';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import { ErrorPanel } from '@backstage/core-components';
import { techInsightsApiRef } from '@backstage-community/plugin-tech-insights-react';

const useStyles = makeStyles({
  fullWidth: { width: '100%' },
  boxLabel: {
    width: '100%',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
});

const FixedWidthFormControlLabel = withStyles(_theme => ({
  label: {
    width: '100%',
  },
  root: {
    width: '90%',
  },
}))(FormControlLabel);

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function RenderOptionLabel(props: { check: Check; isSelected: boolean }) {
  const classes = useStyles();
  const { check, isSelected } = props;
  return (
    <Box className={classes.fullWidth}>
      <FixedWidthFormControlLabel
        className={classes.fullWidth}
        control={
          <Checkbox
            icon={icon}
            checkedIcon={checkedIcon}
            checked={isSelected}
          />
        }
        onClick={event => event.preventDefault()}
        label={
          <Tooltip title={check.id}>
            <Box display="flex" alignItems="center">
              <Box className={classes.boxLabel}>
                <Typography noWrap>{check.name}</Typography>
              </Box>
            </Box>
          </Tooltip>
        }
      />
    </Box>
  );
}

const withResultsOptions = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
];

/** public **/
export type FiltersProps = {
  checksChanged: (checks: Check[]) => void;
  withResultsChanged: (withResults: boolean) => void;
};

export const Filters = (props: FiltersProps) => {
  const { checksChanged, withResultsChanged } = props;
  const api = useApi(techInsightsApiRef);

  const { value, loading, error } = useAsync(async () => {
    return api.getAllChecks();
  }, [api]);

  if (error) {
    return <ErrorPanel error={error} />;
  }

  return (
    <>
      <Box pb={1} pt={1}>
        <Typography variant="button" component="label">
          Checks
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={value ?? []}
            loading={loading}
            getOptionLabel={o => o.name}
            onChange={(_: object, changedChecks) => {
              checksChanged(changedChecks);
            }}
            filterOptions={x => x}
            renderOption={(check, { selected }) => {
              return <RenderOptionLabel check={check} isSelected={selected} />;
            }}
            size="small"
            popupIcon={<ExpandMoreIcon />}
            renderInput={params => <TextField {...params} variant="outlined" />}
          />
        </Typography>
      </Box>
      <Box pb={1} pt={1}>
        <Typography variant="button" component="label">
          Only with results
          <Autocomplete
            defaultValue={withResultsOptions[0]}
            options={withResultsOptions}
            getOptionLabel={o => o.label}
            onChange={(_: object, selectedItem) => {
              if (selectedItem) {
                withResultsChanged(selectedItem.value);
              }
            }}
            disableClearable
            size="small"
            popupIcon={<ExpandMoreIcon />}
            renderInput={params => <TextField {...params} variant="outlined" />}
          />
        </Typography>
      </Box>
    </>
  );
};
