import { TransitResponseKeys, TransitObj } from '../../../../types/global';
import {
  CreatedOrUpdatedBy,
  GetTimeRegistrationReturnType,
  ProjectMeta,
  ProjectOwnerMeta,
  ProjectTaskMeta,
  TaskRegistrationsMeta,
} from '../../../../types/request/timeRegistration';
import {
  MappedRegistration,
  OverallProjectTask,
  ProjectsAndRegistrationList,
  RawProjectMeta,
} from '../../../../types/request/transitResponseBuilder/registrationsResponseBuilder';
import {
  getTransitDataCollection,
  mapTransitArrayMapToObject,
} from '../transitFunctions';

const projectDataKeys: TransitResponseKeys = {
  projectId: 'db/id',
  projectName: 'project/name',
  projectOwnerMeta: 'project/owner',
  projectOrganizationId: 'project/organization',
  projectTasks: 'project/tasks',
  projectStatus: 'project/status',
};

const projectOwnerMetaDataKeys: TransitResponseKeys = {
  id: 'db/id',
  firstName: 'user/firstname',
  lastName: 'user/lastname',
};

const taskDataKeys: TransitResponseKeys = {
  taskId: 'db/id',
  taskProjectId: 'task/project',
  taskTitle: 'task/title',
  taskRegistrations: 'meta/my-time',
  taskTotalRegTime: 'meta/total-time',
  taskCreator: 'meta/created-by',
  taskHasReg: 'meta/has-registration',
};

const registrationDataKeys: TransitResponseKeys = {
  regId: 'db/id',
  regDesc: 'registration/description',
  regStatus: 'registration/status',
  regDuration: 'registration/quantity',
  regCreatedAt: 'meta/created-at',
  regUpdatedAt: 'meta/updated-at',
  regCreatedBy: 'meta/created-by',
  regUpdatedBy: 'meta/updated-by',
};

const updatedByAdminDataKeys: TransitResponseKeys = {
  id: 'id',
  name: 'name',
};

function isArrayEmpty<T>(array: T[] | undefined): boolean {
  if (array) {
    return array.length === 0;
  } else return true;
}

const getFormattedProjectTasks = (
  rawProjectTasks: TransitObj[],
): OverallProjectTask => {
  return rawProjectTasks?.reduce(
    (
      acc: OverallProjectTask,
      rawProjectTask: TransitObj,
    ): OverallProjectTask => {
      const mappedTask = getTransitDataCollection<ProjectTaskMeta>(
        rawProjectTask,
        taskDataKeys,
      );
      const mappedRegistrations: MappedRegistration =
        mapTransitArrayMapToObject(mappedTask.taskRegistrations);

      const formattedTaskRegistrations: MappedRegistration = Object.entries(
        mappedRegistrations,
      ).reduce((acc, [date, value]): MappedRegistration => {
        const userReg: TaskRegistrationsMeta[] = value.map(
          (reg: TaskRegistrationsMeta) => {
            reg = getTransitDataCollection<TaskRegistrationsMeta>(
              reg,
              registrationDataKeys,
            );
            reg.regCreatedAt = reg.regCreatedAt
              ? Date.parse(`${reg.regCreatedAt}`)
              : '';
            reg.regUpdatedAt = reg.regUpdatedAt
              ? Date.parse(`${reg.regUpdatedAt}`)
              : null;
            reg.regCreatedBy =
              reg.regCreatedBy &&
              getTransitDataCollection<CreatedOrUpdatedBy>(
                reg.regCreatedBy,
                updatedByAdminDataKeys,
              );
            reg.regUpdatedBy =
              reg.regUpdatedBy &&
              getTransitDataCollection<CreatedOrUpdatedBy>(
                reg.regUpdatedBy,
                updatedByAdminDataKeys,
              );

            return reg;
          },
        );

        return { ...acc, [date]: userReg };
      }, {});

      mappedTask.taskRegistrations = formattedTaskRegistrations;

      if (!isArrayEmpty(Object.keys(mappedTask.taskRegistrations))) {
        acc.formattedProjectTasksWithRegistration?.push(mappedTask);
      }
      acc.overallFormattedProjectTasks?.push(mappedTask);

      return acc;
    },
    {
      overallFormattedProjectTasks: [],
      formattedProjectTasksWithRegistration: [],
    },
  );
};

const buildProjectAndProjectWithRegistrations = (
  project: RawProjectMeta,
): {
  formattedProject: ProjectMeta;
  projectWithRegistration: ProjectMeta | undefined;
} => {
  const rawProjectTasks = project?.projectTasks || [];

  const {
    overallFormattedProjectTasks,
    formattedProjectTasksWithRegistration,
  } = getFormattedProjectTasks(rawProjectTasks);

  const projectWithRegistration = !isArrayEmpty(
    formattedProjectTasksWithRegistration,
  )
    ? {
        ...project,
        projectTasks: formattedProjectTasksWithRegistration,
      }
    : undefined;

  return {
    formattedProject: {
      ...project,
      projectTasks: overallFormattedProjectTasks,
    },
    projectWithRegistration,
  };
};

export const buildGetRegistrationsResponseData = (
  data: object,
): GetTimeRegistrationReturnType => {
  const rawData = Object.assign([], data);

  const { projectsList, registrationsList } = rawData.reduce(
    (
      projectAndRegistraion: ProjectsAndRegistrationList,
      rawProject: TransitObj,
    ): ProjectsAndRegistrationList => {
      const mappedProject = getTransitDataCollection<RawProjectMeta>(
        rawProject,
        projectDataKeys,
      );

      const mappedProjectOwnerMeta = getTransitDataCollection<ProjectOwnerMeta>(
        mappedProject.projectOwnerMeta,
        projectOwnerMetaDataKeys,
      );

      mappedProject.projectOwnerMeta = mappedProjectOwnerMeta;
      const projectWithCorrectOrgId = {
        ...mappedProject,
        projectOrganizationId:
          mappedProject.projectOrganizationId ||
          mappedProject.projectOwnerMeta.id,
      };

      const { formattedProject, projectWithRegistration } =
        buildProjectAndProjectWithRegistrations(projectWithCorrectOrgId);

      projectAndRegistraion.projectsList.push(formattedProject);

      if (projectWithRegistration) {
        projectAndRegistraion.registrationsList.push(projectWithRegistration);
      }

      return projectAndRegistraion;
    },
    { projectsList: [], registrationsList: [] },
  );

  return {
    projects: projectsList,
    registrations: registrationsList,
    isProjectsAndRegistrationsLoading: false,
    shouldCallRegistrations: false,
    selectedDate: undefined,
  };
};
