import { ProjectMeta } from '../request/timeRegistration';
import { RegistrationData } from '../request/timeRegistration';
import { AddTaskInfoThenAddRegistrationInfoParam } from '../request/timeRegistration';

export type RegistrationModalProps = {
  isModalOpen: boolean;
  overallProjects: ProjectMeta[] | [];
  employmentId: number | undefined;
  cbCloseModal: () => void;
  cbPostRegistration: (registration: RegistrationData) => void;
  cbPostTaskThenPostRegistration: (
    addTaskInfoThenAddRegistrationParam: AddTaskInfoThenAddRegistrationInfoParam,
  ) => void;
};

export type DevOpsWorkItem = {
  id: number;
  fields: {
    'System.Title': string;
    'System.State': string;
    'System.CreatedDate': string;
  };
};
