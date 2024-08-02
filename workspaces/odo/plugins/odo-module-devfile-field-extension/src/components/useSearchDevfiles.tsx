import { useReducer, type Reducer } from 'react';
import {
  DevfileSelectorExtensionWithOptionsProps,
  EXAMPLE_DEVFILE,
  EXAMPLE_STARTER_PROJECT,
  EXAMPLE_VERSION,
  type Devfile,
  type StarterProject,
  type Version,
} from './types';

export type SearchDevfilesAction =
  | {
      type: 'SetDevfile';
      payload: Devfile;
    }
  | {
      type: 'SetVersion';
      payload: Version;
    }
  | {
      type: 'SetStarterProject';
      payload: StarterProject;
    };

export type SearchDevfilesState = {
  options: {
    devfiles: Devfile[];
    versions: Version[];
    starterProjects: StarterProject[];
  };
  selected: {
    devfile: Devfile;
    version: Version;
    starterProject: StarterProject;
  };
  onChange: DevfileSelectorExtensionWithOptionsProps['onChange'];
};

function devfileSearchReducer(
  state: SearchDevfilesState,
  action: SearchDevfilesAction,
): SearchDevfilesState {
  const { options, selected, onChange } = state;
  const { type, payload } = action;

  let newState = state;

  if (type === 'SetDevfile') {
    const devfile = payload;

    // TODO: replace with .toSorted() once ES2023 is enabled.
    // https://github.com/backstage/backstage/pull/25656
    const versions = devfile.versions;
    versions.sort((a, b) => a.version.localeCompare(b.version));

    const starterProjects = versions.at(0)?.starterProjects ?? [];
    starterProjects.sort((a, b) => a.localeCompare(b));

    const version = versions.at(0) ?? { version: '', starterProjects: [] };
    const starterProject = starterProjects.at(0) ?? '';

    newState = {
      ...state,
      options: { ...options, versions, starterProjects },
      selected: { devfile, version, starterProject },
    };
  }

  if (type === 'SetVersion') {
    const version = payload;

    // TODO: replace with .toSorted() once ES2023 is enabled.
    // https://github.com/backstage/backstage/pull/25656
    const starterProjects = version.starterProjects;
    starterProjects.sort((a, b) => a.localeCompare(b));

    const starterProject = starterProjects.at(0) ?? '';

    newState = {
      ...state,
      options: { ...options, starterProjects },
      selected: { ...selected, version, starterProject },
    };
  }

  if (type === 'SetStarterProject') {
    const starterProject = payload;

    newState = {
      ...state,
      selected: { ...selected, starterProject },
    };
  }

  const devfile = newState.selected.devfile.name;
  const version = newState.selected.version.version;
  const starterProject = newState.selected.starterProject;

  onChange({
    devfile,
    version,
    starterProject,
  });

  return newState;
}

export const useDevfileSearch = ({
  devfiles,
  onChange,
}: {
  devfiles: Devfile[];
  onChange: DevfileSelectorExtensionWithOptionsProps['onChange'];
}) => {
  const devfile = devfiles?.at(0) ?? EXAMPLE_DEVFILE;
  const versions = devfile?.versions;
  const version = versions?.at(0) ?? EXAMPLE_VERSION;
  const starterProjects = version?.starterProjects;
  const starterProject = starterProjects?.at(0) ?? EXAMPLE_STARTER_PROJECT;

  return useReducer<Reducer<SearchDevfilesState, SearchDevfilesAction>>(
    devfileSearchReducer,
    {
      options: { devfiles, versions, starterProjects },
      selected: { devfile, version, starterProject },
      onChange,
    },
  );
};
