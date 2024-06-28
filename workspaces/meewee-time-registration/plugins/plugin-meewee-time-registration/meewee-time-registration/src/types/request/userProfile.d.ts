import { MappedOrgList } from './transitResponseBuilder/userProfileResponseBuilder';

export type UserProfileResponseData = {
  id: number | undefined;
  organizationHandle: string | undefined;
  lastName: string | undefined;
  firstName: string | undefined;
  email: string | undefined;
  organizations: Organization[] | undefined;
  teamRoles: any | undefined;
};

export type Organization = {
  id?: number | undefined;
  name?: string | undefined;
  requiredWorkDayHours?: number | undefined;
  employmentType?: string | undefined;
  isEmployer?: boolean | undefined;
  owner?: { id: number; name: string };
  userAuth?: UserAuth;
  employmentId?: number;
};

export type UserAuth = string[];

export type MultipleOrgUserData = {
  employments?: Employment[];
  mappedOrgList?: MappedOrgList[];
  authorizations?: any;
  lastName?: string;
  firstName?: string;
  language?: string;
  id?: number;
  email?: string;
  legalAccept?: any;
  userAuth?: any;
  timestamp?: object;
  userId?: number;
};

export type Employment = {
  approver?: any;
  auth?: string[];
  employee?: any;
  id?: number;
  organization?: { id: number; name: string; owner: any; employmentId: number };
  status?: string;
  type?: string;
};
