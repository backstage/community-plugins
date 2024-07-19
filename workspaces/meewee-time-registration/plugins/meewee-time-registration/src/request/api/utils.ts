import {
  AddTaskInfoRequestParam,
  AddTaskInfoThenAddRegistrationInfoParam,
  RegistrationData,
} from '../../types/request/timeRegistration';
import { buildRequestRegistrationParamObj } from './transitBuilder/payloadBuilder';
import { createTransitData } from './transitBuilder/transitFunctions';

export function convertMsToDate(ms: any) {
  if (ms) {
    const date = new Date(ms);
    const year = date.getUTCFullYear();
    const month = ('0' + (date.getUTCMonth() + 1)).slice(-2);
    const day = ('0' + date.getUTCDate()).slice(-2);
    return `${year}-${month}-${day}`;
  } else return '';
}

export function convertMinutesToHoursMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const formattedMinutes =
    remainingMinutes < 10 ? `0${remainingMinutes}` : remainingMinutes;
  return `${hours}h ${formattedMinutes}m`;
}

export function getSingleRequestRegistrationParamObjTransit(
  userId: number,
  singleRegistrationParam: RegistrationData | RegistrationData[],
): string {
  const requestRegistrationParamObj =
    userId &&
    buildRequestRegistrationParamObj(
      userId,
      singleRegistrationParam as RegistrationData,
    );

  return createTransitData(requestRegistrationParamObj);
}

export function buildRequestTaskParamObj(
  param: AddTaskInfoRequestParam | AddTaskInfoThenAddRegistrationInfoParam,
) {
  return {
    'task/project': { value: param.projectId, isKeyword: false },
    'task/title': { value: param.taskTitle, isKeyword: false },
    employment: { value: param.employmentId, isKeyword: false },
  };
}
