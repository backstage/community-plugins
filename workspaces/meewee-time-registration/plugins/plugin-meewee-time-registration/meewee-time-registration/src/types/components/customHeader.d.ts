import { DateTime } from 'luxon';
import { MappedOrgList } from '../request/transitResponseBuilder/userProfileResponseBuilder';

export type CustomHeaderProps = {
  authToken: string | undefined;
  selectedDate: DateTime;
  organizationList: MappedOrgList[];
  selectedOrgId: number | undefined;
  cbSetRegistrationModalState: React.Dispatch<React.SetStateAction<boolean>>;
  cbChangeDay: (offset?: number) => void;
  cbHandleOrgClickChange: (event: SelectChangeEvent<number>) => void;
  cbStoreTokenLogin: (userName: string, token: string) => void;
};
