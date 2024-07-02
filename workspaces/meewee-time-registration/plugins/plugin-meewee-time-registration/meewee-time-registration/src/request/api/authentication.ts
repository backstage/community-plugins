import request from '../../axios';
import { LoginRequestParam } from '../../types/request/authentication';
import buildRequestHeader from '../buildRequestHeader';

export async function fetchAuthToken(
  loginRequestParam: LoginRequestParam,
): Promise<string> {
  const header = buildRequestHeader();
  const response = await request<any>({
    url: 'login',
    method: 'POST',
    transformResponse: [(data: any) => data],
    responseType: 'json',
    data: loginRequestParam,
    headers: header,
  });

  return response?.data || '';
}
