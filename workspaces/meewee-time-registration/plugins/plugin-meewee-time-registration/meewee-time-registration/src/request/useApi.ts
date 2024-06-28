import { FetchUserProfileParams, fetchUserProfile } from './api/userProfile';
import { fetchAuthToken } from './api/authentication';
import {
  AddRegistrationInfoParams,
  AddTaskInfoThenAddRegistrationInfoParams,
  FetchRegistrationsParams,
  addRegistrationInfo,
  addTaskInfoThenAddRegistrationInfo,
  fetchRegistrations,
} from './api/timeRegistration';
import { MultipleOrgUserData } from '../types/request/userProfile';
import { OverallProjectsAndProjWithReg } from '../types/request/timeRegistration';
import { LoginRequestParam } from '../types/request/authentication';

type Results = {
  fetchAuthToken: string;
  fetchUserProfile: MultipleOrgUserData;
  fetchRegistrations: OverallProjectsAndProjWithReg;
  addRegistrationInfo: any;
  addTaskInfoThenAddRegistrationInfo: any;
};

const apiFunctions = {
  fetchAuthToken,
  fetchUserProfile,
  fetchRegistrations,
  addRegistrationInfo,
  addTaskInfoThenAddRegistrationInfo,
};

export const useApi = async <T extends keyof Results>(
  api: T,
  payload:
    | LoginRequestParam
    | FetchUserProfileParams
    | FetchRegistrationsParams
    | AddRegistrationInfoParams
    | AddTaskInfoThenAddRegistrationInfoParams,
) => {
  try {
    const response = await apiFunctions[api](payload as any);
    return response;
  } catch (error) {
    console.log('error:', error);
  }
};
