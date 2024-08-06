import { TransitObj } from '../../global';
import {
  CreatedOrUpdatedBy,
  ProjectMeta,
  ProjectTaskMeta,
  RegistrationStatus,
} from '../timeRegistration';

export type ProjectsAndRegistrationList = {
  projectsList: ProjectMeta[];
  registrationsList: ProjectMeta[];
};

export type RawProjectMeta = Partial<{
  projectId: number;
  projectName: string;
  projectOrganizationId: number;
  projectOwnerMeta: ProjectOwnerMeta;
  projectStatus: string;
  projectTasks: TransitObj[];
}>;

export type ProjectOwnerMeta = Partial<{
  id: number;
  firstName: string;
  lastName: string;
}>;

export type OverallProjectTask = {
  overallFormattedProjectTasks?: ProjectTaskMeta[];
  formattedProjectTasksWithRegistration?: ProjectTaskMeta[];
};

export type MappedRegistration = {
  [key: string]: TaskRegistrationsMeta[];
};

export type TaskRegistrationsMeta = Partial<{
  regCreatedAt: string | null | number;
  regDesc: string;
  regDuration: number;
  regId: number;
  regStatus: RegistrationStatus;
  regUpdatedAt: string | null | number;
  regCreatedBy: CreatedOrUpdatedBy;
  regUpdatedBy: CreatedOrUpdatedBy;
}>;
