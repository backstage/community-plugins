import fetch, { Response } from 'node-fetch';
import { PingIdentityProviderConfig } from './config';
import { PingIdentityGroup, PingIdentityResponse, PingIdentityUser } from './types';
import { PING_IDENTITY_DEFAULT_ENTITY_QUERY_SIZE } from './constants';

class PingIdentityClient {
  private tokenCredential: string | null = null;

  constructor(private config: PingIdentityProviderConfig) { }

  /**
   * Gets the Ping Identity provider configs
   * 
   * @returns the Ping Identity provider configs
   */
  getConfig(): PingIdentityProviderConfig {
    return this.config;
  }

  /**
   * Gets a list of all users fetched from Ping Identity API
   * 
   * @param querySize - the number of users to query at a time
   * 
   * @returns a list of all users fetched from Ping Identity API
   */
  async getUsers(querySize: number = PING_IDENTITY_DEFAULT_ENTITY_QUERY_SIZE): Promise<PingIdentityUser[]> {
    const allUsers: PingIdentityUser[] = [];
    let nextUrl: string | undefined = `users?limit=${querySize}`;

    while (nextUrl) {
      const url = nextUrl.startsWith('http') ? nextUrl : `${this.config.apiPath}/environments/${this.config.envId}/${nextUrl}`;
      const response = await this.requestApi(url, true);
      const data: PingIdentityResponse = await response.json() as PingIdentityResponse;
      allUsers.push(...(data._embedded.users as PingIdentityUser[]));
      nextUrl = data._links?.next?.href || undefined;
    }

    return allUsers;
  }

  /**
   * Gets a list of all groups fetched from Ping Identity API
   *
   * @param querySize - the number of groups to query at a time
   * 
   * @returns a list of all groups fetched from Ping Identity API
   */
  async getGroups(querySize: number = PING_IDENTITY_DEFAULT_ENTITY_QUERY_SIZE): Promise<PingIdentityGroup[]> {
    const allGroups: PingIdentityGroup[] = [];
    let nextUrl: string | undefined = `groups?limit=${querySize}`;

    while (nextUrl) {
      const url = nextUrl.startsWith('http') ? nextUrl : `${this.config.apiPath}/environments/${this.config.envId}/${nextUrl}`;
      const response = await this.requestApi(url, true);
      const data: PingIdentityResponse = await response.json() as PingIdentityResponse;
      allGroups.push(...(data._embedded.groups as PingIdentityGroup[]));
      nextUrl = data._links?.next?.href || undefined;
    }

    return allGroups;
  }

  /**
   * Gets the parent group ID of a given group, returns undefined if there is no parent group
   * 
   * @param groupId the group ID of a given group
   * 
   * @returns the parent group ID of a given group, undefined if there is no parent group
   */
  async getParentGroupId(groupId: string): Promise<string | undefined> {
    const response = await this.requestApi(`groups/${groupId}/memberOfGroups`);
    const data = await response.json();
    return data.size > 0
      ? data._embedded.groupMemberships[0].id
      : undefined;
  }

  /**
   * Gets all user IDs of users in a given group
   * 
   * @param groupId the group ID of a given group
   * 
   * @returns all user IDs of users in a given group
   */
  async getUsersInGroup(groupId: string): Promise<string[]> {
    const response = await this.requestApi(`users?filter=memberOfGroups[id%20eq%20%22${groupId}%22]`);
    const data = await response.json();
    return data.count > 0 ? data._embedded.users.map((users: { id: string; }) => users.id) : [];
  }

  /**
   * Makes a Ping Identity API request to the configured environment
   * 
   * @param query the query to be made
   * @param isFullUrl Optional - true if the given query is the full request url
   * @returns the response to the given API call
   */
  async requestApi(query: string, isFullUrl?: boolean): Promise<Response> {
    const url = isFullUrl ? query : `${this.config.apiPath}/environments/${this.config.envId}/${query}`;
    let accessToken = await this.getAccessToken();

    let response = await this.makeRequest(url, accessToken);

    // If the token is invalid, refresh it and retry the request
    if (response.status === 401) {
      accessToken = await this.fetchAccessToken();
      response = await this.makeRequest(url, accessToken);
    }

    if (!response.ok) {
      throw new Error(`Error fetching: ${response.statusText}`);
    }

    return response;
  }

  private async fetchAccessToken(): Promise<string> {
    const url = `${this.config.authPath}/${this.config.envId}/as/token`;
    const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');

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
    this.tokenCredential = data.access_token;
    return data.access_token;
  }

  private async getAccessToken(): Promise<string> {
    if (!this.tokenCredential) {
      return this.fetchAccessToken();
    }
    return this.tokenCredential;
  }

  private async makeRequest(url: string, accessToken: string): Promise<Response> {
    return await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  }
}

export { PingIdentityClient };