import request from '../../axios';
import { sortArrayOfObjAlphabeticalByKey } from '../../components/MainComponent/utils';
import { TransitObj } from '../../types/global';
import {
  AddRegistrationInfoRequestParam,
  AddTaskInfoRequestParam,
  AddTaskInfoThenAddRegistrationInfoParam,
  GetTimeRegistrationReturnType,
  OverallProjectsAndProjWithReg,
  ProjectMeta,
  RegistrationData,
  RegistrationMeta,
  RegistrationMetaAndTotalTime,
  RegistrationParamBuilder,
} from '../../types/request/timeRegistration';
import buildRequestHeader from '../buildRequestHeader';
import { buildRequestRegistrationParamObj } from './transitBuilder/payloadBuilder';
import {
  createTransitData,
  readTransitJs,
} from './transitBuilder/transitFunctions';
import { buildTransitData } from './transitBuilder/transitResponseBuilder';

function convertMsToDate(ms: any) {
  if (ms) {
    const date = new Date(ms);
    const year = date.getUTCFullYear();
    const month = ('0' + (date.getUTCMonth() + 1)).slice(-2);
    const day = ('0' + date.getUTCDate()).slice(-2);
    return `${year}-${month}-${day}`;
  } else return '';
}

function convertMinutesToHoursMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const formattedMinutes =
    remainingMinutes < 10 ? `0${remainingMinutes}` : remainingMinutes;
  return `${hours}h ${formattedMinutes}m`;
}
export type FetchRegistrationsParams = {
  date: string;
  authToken: string;
  employmentId: number;
};
export async function fetchRegistrations(
  params: FetchRegistrationsParams,
): Promise<OverallProjectsAndProjWithReg> {
  const { authToken, date, employmentId } = params;
  const header = buildRequestHeader(authToken, 'application/json', true);
  const { data } = await request<any>({
    url: `me/projects?from=${date}&to=${date}&employment=${employmentId}`,
    transformResponse: [(data: any) => data],
    headers: header,
  });

  const projectsAndRegistrations =
    buildTransitData<GetTimeRegistrationReturnType>(
      data,
      'buildGetRegistrationsResponseData',
    );
  const projectsWithRegistrations = projectsAndRegistrations?.registrations;

  const { mappedRegistrations, totalTime } = projectsWithRegistrations.reduce(
    (acc: RegistrationMetaAndTotalTime, project) => {
      const projectName = project?.projectName;
      project.projectTasks?.forEach(task => {
        const registration = task && task?.taskRegistrations?.[date]?.[0];
        const taskTitle = task && task.taskTitle;
        const dateString = convertMsToDate(registration?.regCreatedAt);
        const timeString = registration?.regDuration
          ? convertMinutesToHoursMinutes(registration?.regDuration)
          : '';
        acc.totalTime += registration?.regDuration || 0;
        const MappedRegistration: RegistrationMeta = {
          taskTitle: taskTitle,
          date: dateString,
          projectName: projectName,
          time: timeString,
          projectId: project.projectOrganizationId,
        };
        acc.mappedRegistrations.push(MappedRegistration);
      });
      return acc;
    },
    { mappedRegistrations: [], totalTime: 0 },
  );

  const formattedTotalTime = convertMinutesToHoursMinutes(totalTime);

  const sortedProjects =
    projectsAndRegistrations &&
    sortArrayOfObjAlphabeticalByKey<ProjectMeta[]>(
      projectsAndRegistrations.projects,
      'projectName',
    );
  const overallActiveSortedProjects = sortedProjects.filter(
    project => project?.projectStatus === 'active' || !project?.projectStatus,
  );

  return {
    projectWithRegistration: mappedRegistrations,
    overall: overallActiveSortedProjects,
    overallRegistrationsTotalTime: formattedTotalTime,
  } as OverallProjectsAndProjWithReg;
}

export async function callAddTask(
  addTaskInfoParam: TransitObj,
  authToken: string,
): Promise<string> {
  const header = buildRequestHeader(authToken, 'application/transit+json');
  const { data } = await request<any>({
    url: 'me/tasks',
    method: 'POST',
    transformResponse: [(data: any) => data],
    responseType: 'json',
    data: addTaskInfoParam,
    headers: header,
  });

  return data as string;
}

export async function callAddRegistration(
  addTaskInfoParam: string,
  authToken: string,
): Promise<any> {
  const header = buildRequestHeader(
    authToken,
    'application/transit+json',
    true,
  );
  const response = await request<any>({
    url: 'me/registrations',
    method: 'POST',
    transformResponse: [(data: any) => data],
    responseType: 'json',
    data: addTaskInfoParam,
    headers: header,
  });

  return response;
}

export const getSingleRequestRegistrationParamObjTransit: RegistrationParamBuilder =
  (userId, singleRegistrationParam) => {
    const requestRegistrationParamObj =
      userId &&
      buildRequestRegistrationParamObj(
        userId,
        singleRegistrationParam as RegistrationData,
      );

    return createTransitData(requestRegistrationParamObj);
  };

export type AddRegistrationInfoParams = {
  authToken: string;
  addRegistrationInfoParam: AddRegistrationInfoRequestParam;
};
export async function addRegistrationInfo(
  params: AddRegistrationInfoParams,
): Promise<any> {
  const { registrationData, userId } = params.addRegistrationInfoParam;

  const registrationTransitPayload =
    getSingleRequestRegistrationParamObjTransit(userId, registrationData);

  const response = await callAddRegistration(
    registrationTransitPayload,
    params.authToken,
  );

  return {
    response: response,
  };
}
export type AddTaskInfoThenAddRegistrationInfoParams = {
  authToken: string;
  addTaskInfoThenAddRegistrationInfo: AddTaskInfoThenAddRegistrationInfoParam;
  userId: number;
};

export async function addTaskInfoThenAddRegistrationInfo(
  params: AddTaskInfoThenAddRegistrationInfoParams,
): Promise<any> {
  const { authToken, addTaskInfoThenAddRegistrationInfo, userId } = params;
  const requestTaskParamObj = buildRequestTaskParamObj(
    addTaskInfoThenAddRegistrationInfo,
  );

  const mapTaskObjToTransit = createTransitData(requestTaskParamObj);
  const transformedAddTaskInfoParam = [JSON.parse(mapTaskObjToTransit)];

  const taskAPIResponse = await callAddTask(
    transformedAddTaskInfoParam,
    authToken,
  );

  const taskId = readTransitJs(taskAPIResponse)[0];

  const {
    description,
    regStatus,
    regDate,
    regDuration,
    projectId,
    employmentId,
  } = addTaskInfoThenAddRegistrationInfo;

  const response = await addRegistrationInfo({
    authToken,
    addRegistrationInfoParam: {
      registrationData: {
        description: description,
        regStatus: regStatus,
        regDate: regDate,
        regDuration: regDuration,
        taskId: taskId,
        projectId: projectId,
        employmentId: employmentId,
      },
      userId: userId,
    },
  });

  return {
    response: response,
  };
}

export const buildRequestTaskParamObj = (
  param: AddTaskInfoRequestParam | AddTaskInfoThenAddRegistrationInfoParam,
) => {
  return {
    'task/project': { value: param.projectId, isKeyword: false },
    'task/title': { value: param.taskTitle, isKeyword: false },
    employment: { value: param.employmentId, isKeyword: false },
  };
};
