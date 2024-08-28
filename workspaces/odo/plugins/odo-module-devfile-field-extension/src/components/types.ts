import { DevfileSelectorExtensionWithOptionsFieldSchema } from './schema';

export type DevfileSelectorExtensionWithOptionsProps =
  typeof DevfileSelectorExtensionWithOptionsFieldSchema.type;

export type StarterProject = string;

export type Version = {
  version: string;
  starterProjects: StarterProject[];
};

export type Devfile = {
  name: string;
  displayName: string | undefined;
  icon: string;
  versions: Version[];
};

export const EXAMPLE_STARTER_PROJECT: StarterProject = '' as const;

export const EXAMPLE_VERSION: Version = {
  version: '',
  starterProjects: [EXAMPLE_STARTER_PROJECT],
} as const;

export const EXAMPLE_DEVFILE: Devfile = {
  name: '',
  displayName: '',
  icon: '',
  versions: [EXAMPLE_VERSION],
} as const;
