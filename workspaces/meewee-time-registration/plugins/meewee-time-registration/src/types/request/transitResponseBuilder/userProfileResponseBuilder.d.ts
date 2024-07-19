export type MultipleOrgUserProfileDataKeys = {
  employments: any[];
  mappedOrgList: MappedOrgList[];
  authorizations: any;
  lastName: string;
  firstName: string;
  language: string;
  id: number;
  email: string;
  legalAccept: any;
  userAuth: any;
  timestamp: object;
  userId: number;
};

export type MappedOrgList = { name?: string; orgId?: number };

export type Employments = {
  id?: number;
  status?: string;
  approver?: any;
  auth?: any;
  type?: string;
  employee?: any;
  organization?: OrganizationOfMultipleOrg;
};

export type OrganizationOfMultipleOrg = {
  id: number;
  name: string;
  employmentId: number;
  owner: { id: number; name: string };
};

export type EmploymentsDataKeys = {
  id: number;
  status: string;
  approver: any;
  auth: any;
  type: string;
  employee: any;
  organization: any;
};

export type MultipleOrgOrganizationDataKeys = {
  id: number;
  name: string;
  owner: any;
  employmentId: any;
};

export type UserRoles = {
  employee: 'Employee';
  orgAdmin: 'Administrator';
  orgOwner: 'Owner';
  teamApprover: 'Approver';
  teamManager: 'Manager';
  outsideCollaborator: 'Outside Collaborator';
  user: 'User';
  personal: 'Personal';
};
