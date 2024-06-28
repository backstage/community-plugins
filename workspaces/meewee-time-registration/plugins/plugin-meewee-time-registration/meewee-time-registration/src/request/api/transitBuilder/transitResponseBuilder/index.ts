import { readTransitJs } from '../transitFunctions';
import { buildGetRegistrationsResponseData } from './registrationsResponseBuilder';
import { buildMultipleOrgUserProfileResponseData } from './userProfileResponseBuilder';

export const buildTransitData = <T>(
  response: string,
  buildType:
    | 'buildMultipleOrgUserProfileResponseData'
    | 'buildGetRegistrationsResponseData',
): T => {
  const rawData = readTransitJs(response);

  return formatters[buildType](rawData) as T;
};

const formatters = {
  buildMultipleOrgUserProfileResponseData,
  buildGetRegistrationsResponseData,
};
