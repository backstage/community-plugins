import { TransitResponseKeys } from '../../../../types/global';
import {
  Employments,
  EmploymentsDataKeys,
  MappedOrgList,
  MultipleOrgOrganizationDataKeys,
  MultipleOrgUserProfileDataKeys,
  UserRoles,
} from '../../../../types/request/transitResponseBuilder/userProfileResponseBuilder';
import {
  getKeySetFromTransitSet,
  getTransitDataCollection,
} from '../transitFunctions';

const multipleOrgUserProfileDataKeys: TransitResponseKeys = {
  employments: 'employments',
  authorizations: 'authorizations',
  lastName: 'user/lastname',
  firstName: 'user/firstname',
  language: 'l',
  id: 'db/id',
  email: 'user/email',
  legalAccept: 'user/legal-accept',
  userAuth: 'user/auth',
  timestamp: 'timestamp',
  userId: 'user',
};

const employmentsDataKeys: TransitResponseKeys = {
  id: 'db/id',
  status: 'employment/status',
  approver: 'employment.status/approved',
  auth: 'employment/auth',
  type: 'employment/type',
  employee: 'employment-type/employee',
  organization: 'organization',
};

const organizationForMultipleOrgDataKeys: TransitResponseKeys = {
  id: 'db/id',
  name: 'organization/name',
  owner: 'organization/owner',
};

const organizationOwnerForMultipleOrgDataKeys: TransitResponseKeys = {
  id: 'id',
  name: 'name',
};

const userRoles: UserRoles = {
  employee: 'Employee',
  orgAdmin: 'Administrator',
  orgOwner: 'Owner',
  teamApprover: 'Approver',
  teamManager: 'Manager',
  outsideCollaborator: 'Outside Collaborator',
  user: 'User',
  personal: 'Personal',
};

const buildEmploymentTransitData = (
  transitEmploymentsData: any,
  userId: number,
): Employments[] => {
  const employment: Employments[] = [];
  if (transitEmploymentsData) {
    transitEmploymentsData.forEach((transitEmploymentData: any) => {
      const mappedEmploymentData =
        getTransitDataCollection<EmploymentsDataKeys>(
          transitEmploymentData,
          employmentsDataKeys,
        );
      mappedEmploymentData;
      const transitOrganizationData = mappedEmploymentData.organization;
      const mappedOrganization =
        getTransitDataCollection<MultipleOrgOrganizationDataKeys>(
          transitOrganizationData,
          organizationForMultipleOrgDataKeys,
        );
      mappedOrganization.owner =
        mappedOrganization.owner &&
        getTransitDataCollection<MultipleOrgOrganizationDataKeys>(
          mappedOrganization.owner,
          organizationOwnerForMultipleOrgDataKeys,
        );
      mappedOrganization.employmentId = mappedEmploymentData.id;
      mappedEmploymentData.organization = mappedOrganization;
      const transitEmploymentAuthData: any = mappedEmploymentData.auth;
      const userAuthArray: string[] = [];
      transitEmploymentAuthData?.keySet()?.forEach((key: any) => {
        switch (key.name()) {
          case 'orgadmin':
            userAuthArray.push(userRoles.orgAdmin);
            break;
          case 'manager':
            userAuthArray.push(userRoles.teamManager);
            break;
          case 'employee':
            userAuthArray.push(userRoles.employee);
            break;
          case 'user':
            userAuthArray.push(userRoles.user);
            break;

          default:
            break;
        }
      });
      if (mappedOrganization.id === userId) {
        userAuthArray.push(userRoles.orgOwner);
      }
      mappedEmploymentData.auth = userAuthArray;
      mappedOrganization;
      if (mappedEmploymentData && mappedEmploymentData.status !== 'suspended')
        employment.push(mappedEmploymentData as unknown as Employments);
    });
  }

  return employment;
};

export const buildMultipleOrgUserProfileResponseData = (responseData: any) => {
  const mappedUserProfileData =
    getTransitDataCollection<MultipleOrgUserProfileDataKeys>(
      responseData,
      multipleOrgUserProfileDataKeys,
    );

  mappedUserProfileData.legalAccept = getKeySetFromTransitSet(
    mappedUserProfileData?.legalAccept,
  );

  mappedUserProfileData.userAuth = getKeySetFromTransitSet(
    mappedUserProfileData?.userAuth,
  );

  mappedUserProfileData.authorizations = getKeySetFromTransitSet(
    mappedUserProfileData?.authorizations,
  );
  mappedUserProfileData.employments = buildEmploymentTransitData(
    mappedUserProfileData.employments,
    mappedUserProfileData.id,
  );

  const personalUserOrg: Employments = {
    id: mappedUserProfileData.id,
    organization: {
      id: mappedUserProfileData.id,
      name: mappedUserProfileData.firstName,
      employmentId: mappedUserProfileData.id,
      owner: {
        id: mappedUserProfileData.id,
        name: mappedUserProfileData.firstName,
      },
    },
  };

  mappedUserProfileData.employments.push(personalUserOrg);

  const nameAndIdOfOrgList = mappedUserProfileData?.employments.reduce(
    (acc: MappedOrgList[], employment, index) => {
      const { id, name } = employment?.organization || {};
      if (index === 0) {
        acc.push({ name: 'All Organization', orgId: 0 });
      }
      acc.push({ name, orgId: id });
      return acc;
    },
    [],
  );

  mappedUserProfileData.mappedOrgList = nameAndIdOfOrgList;
  return mappedUserProfileData;
};
