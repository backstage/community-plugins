import { createApiRef } from '@backstage/core-plugin-api';
import {
  AddRegistrationInfoRequestParam,
  AddTaskInfoThenAddRegistrationInfoParam,
  OverallProjectsAndProjWithReg,
} from '../request/timeRegistration';

export const TimeRegistrationApiRef = createApiRef<TimeRegistrationApi>({
  id: 'plugin.meewee-time-registration.timeregistration',
});

export interface TimeRegistrationApi {
  fetchRegistrations(
    fetchGistrationsParams: FetchRegistrationsParams,
  ): Promise<OverallProjectsAndProjWithReg>;
  addRegistrationInfo(params: AddRegistrationInfoParams): Promise<any>;
  addTaskInfoThenAddRegistrationInfo(
    params: AddTaskInfoThenAddRegistrationInfoParams,
  ): Promise<any>;
}

export type FetchRegistrationsParams = {
  date: string;
  authToken: string;
  employmentId: number;
};

export type AddRegistrationInfoParams = {
  authToken: string;
  addRegistrationInfoParam: AddRegistrationInfoRequestParam;
};

export type AddTaskInfoThenAddRegistrationInfoParams = {
  authToken: string;
  addTaskInfoThenAddRegistrationInfo: AddTaskInfoThenAddRegistrationInfoParam;
  userId: number;
};
