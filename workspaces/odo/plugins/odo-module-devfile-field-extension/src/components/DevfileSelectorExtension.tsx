import React, { useState } from "react";
import { FormControl, TextField } from "@material-ui/core";
import { z } from "zod";
import { makeFieldSchemaFromZod } from "@backstage/plugin-scaffolder";
import { useAsync } from "react-use";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { makeStyles } from "@material-ui/core/styles";
import { useApi, configApiRef } from "@backstage/core-plugin-api";

const DevfileSelectorExtensionWithOptionsFieldSchema = makeFieldSchemaFromZod(
  z.object({
    devfile: z.string().describe("Devfile name"),
    version: z.string().describe("Devfile Stack version"),
    starter_project: z
      .string()
      .optional()
      .describe("Devfile Stack starter project"),
  })
);

export const DevfileSelectorExtensionWithOptionsSchema =
  DevfileSelectorExtensionWithOptionsFieldSchema.schema;

type DevfileSelectorExtensionWithOptionsProps =
  typeof DevfileSelectorExtensionWithOptionsFieldSchema.type;

export interface DevfileStack {
  name: string;
  displayName: string | undefined;
  icon: string;
  versions: DevfileStackVersion[];
}

export interface DevfileStackVersion {
  version: string;
  starterProjects: string[];
}

const useStyles = makeStyles({
  option: {
    fontSize: 15,
    "& > span": {
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
  const config = useApi(configApiRef);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DevfileStack[]>([]);
  const [selectedStack, setSelectedStack] = useState("");
  const [versions, setVersions] = useState<string[]>([]);
  const [selectedVersion, setSelectedVersion] = useState("");
  const [starterprojects, setStarterprojects] = useState<string[]>([]);

  const backendUrl = config.getString("backend.baseUrl");
  // This requires a proxy endpoint to be added for /devfile-registry
  const registryApiEndpoint = `${backendUrl}/api/proxy/devfile-registry/v2index`;

  useAsync(async () => {
    const req = await fetch(registryApiEndpoint, {
      headers: {
        Accept: "application/json",
      },
    });
    const resp = (await req.json()) as DevfileStack[];
    resp.sort((a, b) =>
      (a.displayName ?? "").localeCompare(b.displayName ?? "")
    );
    setData(resp);

    setVersions([]);
    setStarterprojects([]);

    setLoading(false);
  });

  const handleDevfileStack = (value: DevfileStack) => {
    const filteredStacks = data.filter((stack) => stack.name === value?.name);
    const versionList = filteredStacks.flatMap((stack) => stack.versions);
    const filteredVersions = versionList.map((v) => v.version);
    filteredVersions.sort((a, b) => a.localeCompare(b));

    let filteredStarterProjects: string[] = [];
    if (versionList.length > 0) {
      filteredStarterProjects = versionList[0].starterProjects ?? [];
    }

    setSelectedStack(value.name);
    setSelectedVersion(filteredVersions?.length > 0 ? filteredVersions[0] : "");
    setVersions(filteredVersions);
    setStarterprojects(filteredStarterProjects);

    onChange({
      devfile: value.name,
      version: versionList.length > 0 ? versionList[0].version : "",
      starter_project:
        filteredStarterProjects.length > 0 ? filteredStarterProjects[0] : "",
    });
  };

  const handleDevfileStackVersion = (value: any) => {
    const filteredResult = data
      .filter((stack) => stack.name === selectedStack)
      .flatMap((stack) => stack.versions)
      .filter((v) => v.version === value)
      .flatMap((v) => v.starterProjects ?? []);
    filteredResult.sort((a, b) => a.localeCompare(b));

    setSelectedVersion(value as string);
    setStarterprojects(filteredResult);

    onChange({
      devfile: selectedStack,
      version: value as string,
      starter_project: filteredResult.length > 0 ? filteredResult[0] : "",
    });
  };

  const handleDevfileStarterProject = (value: any) => {
    onChange({
      devfile: selectedStack,
      version: selectedVersion,
      starter_project: value as string,
    });
  };

  const classes = useStyles();

  return (
    <FormControl
      margin="normal"
      required={required}
      error={rawErrors?.length > 0}
    >
      <div>
        <Autocomplete
          id={`devfile-selector-${idSchema?.$id}`}
          loading={loading}
          noOptionsText="No Devfile Stacks available from registry"
          value={
            // dummy DevfileStack object with the name set, so that getOptionSelected can resolve the right item from data
            { name: formData?.devfile ?? selectedStack, icon: "", displayName: "", versions: [] }
          }
          classes={{
            option: classes.option,
          }}
          options={data}
          renderOption={(option) =>
            option.icon ? (
              <React.Fragment>
                <span>
                  <img
                    style={{ width: 50, height: 50 }}
                    src={option.icon}
                    alt={`icon for ${option.name}`}
                  />
                </span>
                {option.displayName}
              </React.Fragment>
            ) : (
              <React.Fragment>{option.displayName}</React.Fragment>
            )
          }
          getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Devfile Stack"
              variant="outlined"
              required={required}
              error={rawErrors?.length > 0 && !formData}
              inputProps={{
                ...params.inputProps,
                autoComplete: "new-password", // disable autocomplete and autofill
              }}
              helperText={description}
            />
          )}
          onChange={(_, value) => handleDevfileStack(value)}
          getOptionSelected={(option, value) => option.name === value.name}
          disableClearable
        />
      </div>
      <br/>
      <div>
        <Autocomplete
          id={`devfile-version-selector-${idSchema?.$id}`}
          loading={loading}
          value={
            formData?.version ?? selectedVersion ?? (versions.length > 0 ? versions[0] : null)
          }
          noOptionsText="No version available in Devfile Stack"
          renderInput={(params) => (
            <TextField
              {...params}
              label="Version"
              variant="outlined"
              required={required}
              error={rawErrors?.length > 0 && !formData}
              helperText={description}
              inputProps={{
                ...params.inputProps,
                autoComplete: "new-password", // disable autocomplete and autofill
              }}
            />
          )}
          options={versions}
          onChange={(_, value) => handleDevfileStackVersion(value)}
          getOptionSelected={(option, value) => option === value}
          disableClearable
        />
      </div>
      <br/>
      <div>
        <Autocomplete
          id={`devfile-starter-project-selector-${idSchema?.$id}`}
          loading={loading}
          value={
            formData?.starter_project ??
            (starterprojects.length > 0 ? starterprojects[0] : "")
          }
          noOptionsText="No starter project available in Devfile Stack"
          renderInput={(params) => (
            <TextField
              {...params}
              label="Starter Project"
              variant="outlined"
              required={false}
              error={rawErrors?.length > 0 && !formData}
              inputProps={{
                ...params.inputProps,
                autoComplete: "new-password", // disable autocomplete and autofill
              }}
              helperText={description}
            />
          )}
          options={starterprojects}
          onChange={(_, value) => handleDevfileStarterProject(value)}
          getOptionSelected={(option, value) => option === value}
          disableClearable
        />
      </div>
    </FormControl>
  );
};
