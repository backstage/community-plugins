import fetch, { Response } from 'node-fetch';
import { PingIdentityProviderConfig } from './config';

const getAccessToken = async (
  config: PingIdentityProviderConfig
): Promise<string> => {
  const url = `${config.authPath}/${config.envId}/as/token`;
  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'grant_type': 'client_credentials',
    }),
  });

  if (!response.ok) {
    throw new Error(`Error getting access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

export const requestApi = async (
  config: PingIdentityProviderConfig,
  query: string,
): Promise<Response> => {
  const url = `${config.apiPath}/environments/${config.envId}/${query}`;
  const accessToken = await getAccessToken(config);

  const response: Response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Error fetching: ${response.statusText}`);
  }

  return response;
}