import { configApiRef, useApi } from '@backstage/core-plugin-api';

import { FormControl, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { useAsync } from '@react-hookz/web';
import React from 'react';

import type {
  Devfile,
  DevfileSelectorExtensionWithOptionsProps,
} from './types';
import { useDevfileSearch } from './useSearchDevfiles';

const useStyles = makeStyles({
  option: {
    fontSize: 15,
    '& > span': {
      marginRight: 10,
      fontSize: 18,
    },
  },
});

export const DevfileSelectorExtension = ({
  onChange,
  rawErrors,
  required,
  formData,
  idSchema,
  schema: { description },
}: DevfileSelectorExtensionWithOptionsProps) => {
  const classes = useStyles();
  const config = useApi(configApiRef);

  const backendUrl = config.getString('backend.baseUrl');
  // This requires a proxy endpoint to be added for /devfile-registry
  const registryApiEndpoint = `${backendUrl}/api/proxy/devfile-registry/v2index`;

  const [{ status, result }] = useAsync(async () => {
    const req = await fetch(registryApiEndpoint, {
      headers: {
        Accept: 'application/json',
      },
    });
    const devfiles = (await req.json()) as Devfile[];
    devfiles.sort((a, b) =>
      (a.displayName ?? '').localeCompare(b.displayName ?? ''),
    );

    return devfiles;
  });

  const [devfileSearchState, devfileSearchDispatch] = useDevfileSearch({
    devfiles: result ?? [],
    onChange,
  });

  return (
    <FormControl
      margin="normal"
      required={required}
      error={rawErrors?.length > 0}
    >
      <div>
        <Autocomplete
          id={`devfile-selector-${idSchema?.$id}`}
          loading={status !== 'success'}
          noOptionsText="No Devfile Stacks available from registry"
          value={
            // dummy DevfileStack object with the name set, so that getOptionSelected can resolve the right item from data
            {
              ...devfileSearchState.selected.devfile,
              name:
                formData?.devfile ?? devfileSearchState.selected.devfile.name,
            }
          }
          classes={{
            option: classes.option,
          }}
          options={devfileSearchState.options.devfiles}
          renderOption={option =>
            option.icon ? (
              <>
                <span>
                  <img
                    style={{ width: 50, height: 50 }}
                    src={option.icon}
                    alt={`icon for ${option.name}`}
                  />
                </span>
                {option.displayName}
              </>
            ) : (
              <>{option.displayName}</>
            )
          }
          getOptionLabel={option => option.name}
          renderInput={params => (
            <TextField
              {...params}
              label="Devfile Stack"
              variant="outlined"
              required={required}
              error={rawErrors?.length > 0 && !formData}
              inputProps={{
                ...params.inputProps,
                autoComplete: 'new-password', // disable autocomplete and autofill
              }}
              helperText={description}
            />
          )}
          onChange={(_, value) =>
            devfileSearchDispatch({ type: 'SetDevfile', payload: value })
          }
          getOptionSelected={(option, value) => option.name === value.name}
          disableClearable
        />
      </div>
      <br />
      <div>
        <Autocomplete
          id={`devfile-version-selector-${idSchema?.$id}`}
          loading={status === 'loading'}
          value={{
            ...devfileSearchState.selected.version,
            version:
              formData?.version ?? devfileSearchState.selected.version.version,
          }}
          noOptionsText="No version available in Devfile Stack"
          renderInput={params => (
            <TextField
              {...params}
              label="Version"
              variant="outlined"
              required={required}
              error={rawErrors?.length > 0 && !formData}
              helperText={description}
              inputProps={{
                ...params.inputProps,
                autoComplete: 'new-password', // disable autocomplete and autofill
              }}
            />
          )}
          options={devfileSearchState.options.versions}
          renderOption={option => <>{option.version}</>}
          onChange={(_, value) =>
            devfileSearchDispatch({ type: 'SetVersion', payload: value })
          }
          getOptionSelected={(option, value) => option === value}
          disableClearable
        />
      </div>
      <br />
      <div>
        <Autocomplete
          id={`devfile-starter-project-selector-${idSchema?.$id}`}
          loading={status === 'loading'}
          value={
            formData?.starterProject ??
            devfileSearchState.selected.starterProject
          }
          noOptionsText="No starter project available in Devfile Stack"
          renderInput={params => (
            <TextField
              {...params}
              label="Starter Project"
              variant="outlined"
              required={false}
              error={rawErrors?.length > 0 && !formData}
              inputProps={{
                ...params.inputProps,
                autoComplete: 'new-password', // disable autocomplete and autofill
              }}
              helperText={description}
            />
          )}
          options={devfileSearchState.options.starterProjects}
          onChange={(_, value) =>
            devfileSearchDispatch({ type: 'SetStarterProject', payload: value })
          }
          getOptionSelected={(option, value) => option === value}
          disableClearable
        />
      </div>
    </FormControl>
  );
};
