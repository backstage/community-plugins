import {
  GetExploreToolsRequest,
  GetExploreToolsResponse,
} from '@backstage-community/plugin-explore-common';

/**
 * @public
 */
export interface ExploreToolProvider {
  /**
   * Gets a list of explore tools filtered by the request options.
   *
   * @param request - The request options {@link @backstage-community/plugin-explore-common#GetExploreToolsRequest}.
   * @returns The response {@link @backstage-community/plugin-explore-common#GetExploreToolsResponse}.
   */
  getTools(request: GetExploreToolsRequest): Promise<GetExploreToolsResponse>;
}
