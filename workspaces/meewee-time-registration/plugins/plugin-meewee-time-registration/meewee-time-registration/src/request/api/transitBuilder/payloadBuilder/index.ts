import {
  AddTaskInfoThenAddRegistrationInfoParam,
  RegistrationData,
} from '../../../../types/request/timeRegistration';

export const buildRequestRegistrationParamObj = (
  userId: number,
  param: AddTaskInfoThenAddRegistrationInfoParam | RegistrationData,
  taskId?: number,
  submitAllForApproval?: boolean,
) => {
  const registrationId = param?.registrationId;
  const regStatus = submitAllForApproval
    ? 'registration.status/pending'
    : 'registration.status/'.concat(param.regStatus);
  const baseParamObj = {
    'registration/owner': { value: userId, isKeyword: false },
    'registration/description': {
      value: param.description,
      isKeyword: false,
    },
    'registration/task': {
      value: param?.taskId || taskId,
      isKeyword: false,
    },
    'registration/status': {
      value: regStatus,
      isKeyword: true,
    },
    'registration/start': {
      value: new Date(Date.parse(param.regDate)),
      isKeyword: false,
    },
    'registration/start-offset': {
      value: new Date(param.regDate).getTimezoneOffset(),
      isKeyword: false,
    },
    'registration/quantity': {
      value: param.regDuration,
      isKeyword: false,
    },
    employment: {
      value: param.employmentId,
      isKeyword: false,
    },
  };
  if (registrationId) {
    return {
      'db/id': {
        value: registrationId,
        isKeyword: false,
      },
      ...baseParamObj,
    };
  } else return baseParamObj;
};
