import { createApiRef } from '@backstage/core-plugin-api';

/** @public */
export const azDevopsApiRef = createApiRef<AzDevopsApi>({
  id: 'plugin.meewee.client',
});

export interface AzDevopsApi {
  getProjects(): Promise<ProjectList>;
  workItemsByQuery(project: string, team: string, top: number): Promise<any>;
  getTeamsByProject(projectId: string): Promise<ProjectTeams>;
  updateWorkItem(projectid: string, id: number, state: string): Promise<any>;
  getWorkItemTypes(project: string): Promise<any>;
  getWorkItemStateByType(
    project: string,
    workItemtype?: string | undefined,
  ): Promise<any>;
}
export type WorkItemFields = {
  id?: number;
  fields?: Fields;
};

export type Fields = {
  WorkItemType?: string;
  Title?: string;
  State?: string;
  CreatedDate?: string;
  Parent?: string;
};

export type Workitems = {
  id: number;
  fields: {
    'System.WorkItemType': string;
    'System.Title': string;
    'System.State': string;
    'System.CreatedDate': string;
    'System.Parent': string;
    ParentTitle: string;
  };
};

export type request = {
  url: string;
  method: string;
  scope: string[];
  body?: any;
};

export type ProjectList = {
  id: string;
  name: string;
};

export type ProjectTeams = {
  id: string;
  name: string;
  defaultTeam?: DefaultTeam;
};

export type DefaultTeam = {
  id: string;
  name: string;
};
