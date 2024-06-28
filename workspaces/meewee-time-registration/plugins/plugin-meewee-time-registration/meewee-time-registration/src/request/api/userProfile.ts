import request from '../../axios';
import { MultipleOrgUserData } from '../../types/request/userProfile';
import buildRequestHeader from '../buildRequestHeader';
import { buildTransitData } from './transitBuilder/transitResponseBuilder';

export type FetchUserProfileParams = {
  authToken: string;
};

export async function fetchUserProfile(params: {
  authToken: string;
}): Promise<MultipleOrgUserData> {
  const header = buildRequestHeader(params.authToken);
  const { data } = await request<any>({
    url: 'me',
    transformResponse: [(data: any) => data],
    headers: header,
  });
  const userProfileData = buildTransitData<MultipleOrgUserData>(
    data,
    'buildMultipleOrgUserProfileResponseData',
  );

  return userProfileData;
}
