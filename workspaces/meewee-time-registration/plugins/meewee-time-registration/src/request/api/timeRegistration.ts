import { ConfigApi } from '@backstage/core-plugin-api';

import { RequestHandler } from './requestHandler';
import {
  AddRegistrationInfoParams,
  AddTaskInfoThenAddRegistrationInfoParams,
  FetchRegistrationsParams,
  TimeRegistrationApi,
} from '../../types/timeregistration/types';
import {
  GetTimeRegistrationReturnType,
  OverallProjectsAndProjWithReg,
  ProjectMeta,
  RegistrationMeta,
  RegistrationMetaAndTotalTime,
} from '../../types/request/timeRegistration';
import buildRequestHeader from '../buildRequestHeader';
import { buildTransitData } from './transitBuilder/transitResponseBuilder';
import {
  buildRequestTaskParamObj,
  convertMinutesToHoursMinutes,
  convertMsToDate,
  getSingleRequestRegistrationParamObjTransit,
} from './utils';
import { sortArrayOfObjAlphabeticalByKey } from '../../components/MainComponent/utils';
import { TransitObj } from '../../types/global';
import {
  createTransitData,
  readTransitJs,
} from './transitBuilder/transitFunctions';

export class TimeRegistrationClient implements TimeRegistrationApi {
  private readonly requestHandler: RequestHandler;

  constructor(options: { configApi: ConfigApi }) {
    this.requestHandler = new RequestHandler(options);
  }

  async fetchRegistrations(
    params: FetchRegistrationsParams,
  ): Promise<OverallProjectsAndProjWithReg> {
    const { authToken, date, employmentId } = params;
    const header = buildRequestHeader(authToken, 'application/json', true);
    const response =
      await this.requestHandler.send<OverallProjectsAndProjWithReg>(
        `me/projects?from=${date}&to=${date}&employment=${employmentId}`,
        {
          headers: header,
        },
      );

    const projectsAndRegistrations =
      buildTransitData<GetTimeRegistrationReturnType>(
        JSON.stringify(response),
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

  async callAddTask(
    addTaskInfoParam: TransitObj,
    authToken: string,
  ): Promise<string> {
    const header = buildRequestHeader(authToken, 'application/transit+json');
    const response = await this.requestHandler.send<string>('me/tasks', {
      method: 'POST',
      body: addTaskInfoParam as any,
      headers: header,
    });

    return JSON.stringify(response);
  }

  async callAddRegistration(
    addTaskInfoParam: string,
    authToken: string,
  ): Promise<any> {
    const header = buildRequestHeader(
      authToken,
      'application/transit+json',
      true,
    );
    const response = await this.requestHandler.send<string>(
      'me/registrations',
      {
        method: 'POST',
        body: addTaskInfoParam as any,
        headers: header,
      },
    );

    return JSON.stringify(response);
  }

  async addRegistrationInfo(params: AddRegistrationInfoParams): Promise<any> {
    const { registrationData, userId } = params.addRegistrationInfoParam;

    const registrationTransitPayload =
      getSingleRequestRegistrationParamObjTransit(userId, registrationData);

    const response = await this.callAddRegistration(
      registrationTransitPayload,
      params.authToken,
    );

    return {
      response: response,
    };
  }

  async addTaskInfoThenAddRegistrationInfo(
    params: AddTaskInfoThenAddRegistrationInfoParams,
  ): Promise<any> {
    const { authToken, addTaskInfoThenAddRegistrationInfo, userId } = params;
    const requestTaskParamObj = buildRequestTaskParamObj(
      addTaskInfoThenAddRegistrationInfo,
    );

    const mapTaskObjToTransit = createTransitData(requestTaskParamObj);
    const transformedAddTaskInfoParam = [JSON.parse(mapTaskObjToTransit)];

    const taskAPIResponse = await this.callAddTask(
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

    const response = await this.addRegistrationInfo({
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
}
