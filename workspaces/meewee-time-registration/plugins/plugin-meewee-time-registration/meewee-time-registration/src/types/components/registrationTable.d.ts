import { ProjectMeta } from '../request/timeRegistration';
import { RegistrationMeta } from '../request/timeRegistration';
import { RegistrationData } from '../request/timeRegistration';

export type RegistrationTableProps = {
  isModalOpen: boolean;
  registrations: RegistrationMeta[] | [];
  overallProjects: ProjectMeta[] | [];
  registrationsTotalTime: string | undefined;
  employmentId: number | undefined;
  authToken: string | undefined;
  cbSetModalState: React.Dispatch<React.SetStateAction<boolean>>;
  cbPostRegistration: (registration: RegistrationData) => void;
  cbPostTaskThenPostRegistration: (
    addTaskInfoThenAddRegistrationParam: AddTaskInfoThenAddRegistrationInfoParam,
  ) => void;
};
