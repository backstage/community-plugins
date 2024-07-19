export type GetTimeRegistrationReturnType = {
  projects: ProjectMeta[];
  registrations: ProjectMeta[];
  isProjectsAndRegistrationsLoading: boolean;
  shouldCallRegistrations: boolean;
  selectedDate?: string;
};

export type OverallProjectsAndProjWithReg = {
  overall: ProjectMeta[];
  projectWithRegistration: RegistrationMeta[];
  overallRegistrationsTotalTime: string;
};

export type ProjectMeta = Partial<{
  projectId: number;
  projectName: string;
  projectOrganizationId: number;
  projectOwnerMeta: ProjectOwnerMeta;
  projectStatus: string;
  projectTasks: ProjectTaskMeta[];
}>;

export type ProjectOwnerMeta = Partial<{
  id: number;
  firstName: string;
  lastName: string;
}>;

export type ProjectTaskMeta = Partial<{
  taskCreator: number;
  taskHasReg: boolean;
  taskId: number;
  taskProjectId: number;
  taskRegistrations: {
    [key in string]: TaskRegistrationsMeta[];
  };
  taskTitle: string;
  taskTotalRegTime: number;
}>;

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

export type RegistrationStatus = 'draft' | 'declined' | 'pending' | 'approved';

export type CreatedOrUpdatedBy = {
  id: number | undefined;
  name: string | undefined;
};

export type RegistrationMetaAndTotalTime = {
  mappedRegistrations: RegistrationMeta[];
  totalTime: number;
};

export type RegistrationMeta = {
  taskTitle?: string;
  date?: string;
  projectName?: string;
  time?: string;
  projectId?: number;
};

export type AddRegistrationInfoRequestParam = {
  registrationData: RegistrationData;
  userId: number;
};

export type RegistrationData = {
  description: string;
  regStatus: string;
  regDate: string;
  regDuration: number;
  taskId: number;
  projectId: number;
  employmentId: number;
  registrationId?: number;
};

export type RegistrationParamBuilder = (
  userId: number | undefined,
  registration: RegistrationData | RegistrationData[],
) => any;

export type AddTaskInfoThenAddRegistrationInfoParam = {
  projectId: number;
  taskTitle: string;
  description: string;
  regStatus: string;
  regDate: string;
  regDuration: number;
  employmentId: number;
  taskId?: number;
  registrationId?: number;
  originalDate?: string;
};

export type AddTaskInfoRequestParam = {
  projectId: number;
  taskTitle: string;
  employmentId: number;
};
