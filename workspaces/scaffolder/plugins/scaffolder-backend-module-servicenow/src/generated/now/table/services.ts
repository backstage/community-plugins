import type { CancelablePromise } from './core/CancelablePromise';
import { OpenAPI } from './core/OpenAPI';
import { request as __request } from './core/request';

export type DefaultData = {
  GetApiNowTableByTableName: {
    /**
     * Return field display values (true), actual values (false), or both (all) (default: false)
     */
    sysparmDisplayValue?: unknown;
    /**
     * True to exclude Table API links for reference fields (default: false)
     */
    sysparmExcludeReferenceLink?: unknown;
    /**
     * A comma-separated list of fields to return in the response
     */
    sysparmFields?: unknown;
    /**
     * The maximum number of results returned per page (default: 10,000)
     */
    sysparmLimit?: unknown;
    /**
     * Do not execute a select count(*) on table (default: false)
     */
    sysparmNoCount?: unknown;
    /**
     * An encoded query string used to filter the results
     */
    sysparmQuery?: unknown;
    /**
     * Name of the query category (read replica category) to use for queries
     */
    sysparmQueryCategory?: unknown;
    /**
     * True to access data across domains if authorized (default: false)
     */
    sysparmQueryNoDomain?: unknown;
    /**
     * True to supress pagination header (default: false)
     */
    sysparmSuppressPaginationHeader?: unknown;
    /**
     * Render the response according to the specified UI view (overridden by sysparm_fields)
     */
    sysparmView?: unknown;
    tableName: unknown;
  };
  PostApiNowTableByTableName: {
    requestBody?: unknown;
    /**
     * Return field display values (true), actual values (false), or both (all) (default: false)
     */
    sysparmDisplayValue?: unknown;
    /**
     * True to exclude Table API links for reference fields (default: false)
     */
    sysparmExcludeReferenceLink?: unknown;
    /**
     * A comma-separated list of fields to return in the response
     */
    sysparmFields?: unknown;
    /**
     * Set field values using their display value (true) or actual value (false) (default: false)
     */
    sysparmInputDisplayValue?: unknown;
    /**
     * True to suppress auto generation of system fields (default: false)
     */
    sysparmSuppressAutoSysField?: unknown;
    /**
     * Render the response according to the specified UI view (overridden by sysparm_fields)
     */
    sysparmView?: unknown;
    tableName: unknown;
  };
  GetApiNowTableByTableNameBySysId: {
    sysId: unknown;
    /**
     * Return field display values (true), actual values (false), or both (all) (default: false)
     */
    sysparmDisplayValue?: unknown;
    /**
     * True to exclude Table API links for reference fields (default: false)
     */
    sysparmExcludeReferenceLink?: unknown;
    /**
     * A comma-separated list of fields to return in the response
     */
    sysparmFields?: unknown;
    /**
     * True to access data across domains if authorized (default: false)
     */
    sysparmQueryNoDomain?: unknown;
    /**
     * Render the response according to the specified UI view (overridden by sysparm_fields)
     */
    sysparmView?: unknown;
    tableName: unknown;
  };
  PutApiNowTableByTableNameBySysId: {
    requestBody?: unknown;
    sysId: unknown;
    /**
     * Return field display values (true), actual values (false), or both (all) (default: false)
     */
    sysparmDisplayValue?: unknown;
    /**
     * True to exclude Table API links for reference fields (default: false)
     */
    sysparmExcludeReferenceLink?: unknown;
    /**
     * A comma-separated list of fields to return in the response
     */
    sysparmFields?: unknown;
    /**
     * Set field values using their display value (true) or actual value (false) (default: false)
     */
    sysparmInputDisplayValue?: unknown;
    /**
     * True to access data across domains if authorized (default: false)
     */
    sysparmQueryNoDomain?: unknown;
    /**
     * True to suppress auto generation of system fields (default: false)
     */
    sysparmSuppressAutoSysField?: unknown;
    /**
     * Render the response according to the specified UI view (overridden by sysparm_fields)
     */
    sysparmView?: unknown;
    tableName: unknown;
  };
  DeleteApiNowTableByTableNameBySysId: {
    sysId: unknown;
    /**
     * True to access data across domains if authorized (default: false)
     */
    sysparmQueryNoDomain?: unknown;
    tableName: unknown;
  };
  PatchApiNowTableByTableNameBySysId: {
    requestBody?: unknown;
    sysId: unknown;
    /**
     * Return field display values (true), actual values (false), or both (all) (default: false)
     */
    sysparmDisplayValue?: unknown;
    /**
     * True to exclude Table API links for reference fields (default: false)
     */
    sysparmExcludeReferenceLink?: unknown;
    /**
     * A comma-separated list of fields to return in the response
     */
    sysparmFields?: unknown;
    /**
     * Set field values using their display value (true) or actual value (false) (default: false)
     */
    sysparmInputDisplayValue?: unknown;
    /**
     * True to access data across domains if authorized (default: false)
     */
    sysparmQueryNoDomain?: unknown;
    /**
     * True to suppress auto generation of system fields (default: false)
     */
    sysparmSuppressAutoSysField?: unknown;
    /**
     * Render the response according to the specified UI view (overridden by sysparm_fields)
     */
    sysparmView?: unknown;
    tableName: unknown;
  };
};

export class DefaultService {
  /**
   * Retrieve records from a table
   * @returns any ok
   * @throws ApiError
   */
  public static getApiNowTableByTableName(
    data: DefaultData['GetApiNowTableByTableName'],
  ): CancelablePromise<any> {
    const {
      tableName,
      sysparmQuery,
      sysparmDisplayValue,
      sysparmExcludeReferenceLink,
      sysparmSuppressPaginationHeader,
      sysparmFields,
      sysparmLimit,
      sysparmView,
      sysparmQueryCategory,
      sysparmQueryNoDomain,
      sysparmNoCount,
    } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/now/table/{tableName}',
      path: {
        tableName,
      },
      query: {
        sysparm_query: sysparmQuery,
        sysparm_display_value: sysparmDisplayValue,
        sysparm_exclude_reference_link: sysparmExcludeReferenceLink,
        sysparm_suppress_pagination_header: sysparmSuppressPaginationHeader,
        sysparm_fields: sysparmFields,
        sysparm_limit: sysparmLimit,
        sysparm_view: sysparmView,
        sysparm_query_category: sysparmQueryCategory,
        sysparm_query_no_domain: sysparmQueryNoDomain,
        sysparm_no_count: sysparmNoCount,
      },
    });
  }

  /**
   * Create a record
   * @returns any ok
   * @throws ApiError
   */
  public static postApiNowTableByTableName(
    data: DefaultData['PostApiNowTableByTableName'],
  ): CancelablePromise<any> {
    const {
      tableName,
      sysparmDisplayValue,
      sysparmExcludeReferenceLink,
      sysparmFields,
      sysparmInputDisplayValue,
      sysparmSuppressAutoSysField,
      sysparmView,
      requestBody,
    } = data;
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/now/table/{tableName}',
      path: {
        tableName,
      },
      query: {
        sysparm_display_value: sysparmDisplayValue,
        sysparm_exclude_reference_link: sysparmExcludeReferenceLink,
        sysparm_fields: sysparmFields,
        sysparm_input_display_value: sysparmInputDisplayValue,
        sysparm_suppress_auto_sys_field: sysparmSuppressAutoSysField,
        sysparm_view: sysparmView,
      },
      body: requestBody,
    });
  }

  /**
   * Retrieve a record
   * @returns any ok
   * @throws ApiError
   */
  public static getApiNowTableByTableNameBySysId(
    data: DefaultData['GetApiNowTableByTableNameBySysId'],
  ): CancelablePromise<any> {
    const {
      tableName,
      sysId,
      sysparmDisplayValue,
      sysparmExcludeReferenceLink,
      sysparmFields,
      sysparmView,
      sysparmQueryNoDomain,
    } = data;
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/now/table/{tableName}/{sys_id}',
      path: {
        tableName,
        sys_id: sysId,
      },
      query: {
        sysparm_display_value: sysparmDisplayValue,
        sysparm_exclude_reference_link: sysparmExcludeReferenceLink,
        sysparm_fields: sysparmFields,
        sysparm_view: sysparmView,
        sysparm_query_no_domain: sysparmQueryNoDomain,
      },
    });
  }

  /**
   * Modify a record
   * @returns any ok
   * @throws ApiError
   */
  public static putApiNowTableByTableNameBySysId(
    data: DefaultData['PutApiNowTableByTableNameBySysId'],
  ): CancelablePromise<any> {
    const {
      tableName,
      sysId,
      sysparmDisplayValue,
      sysparmExcludeReferenceLink,
      sysparmFields,
      sysparmInputDisplayValue,
      sysparmSuppressAutoSysField,
      sysparmView,
      sysparmQueryNoDomain,
      requestBody,
    } = data;
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/api/now/table/{tableName}/{sys_id}',
      path: {
        tableName,
        sys_id: sysId,
      },
      query: {
        sysparm_display_value: sysparmDisplayValue,
        sysparm_exclude_reference_link: sysparmExcludeReferenceLink,
        sysparm_fields: sysparmFields,
        sysparm_input_display_value: sysparmInputDisplayValue,
        sysparm_suppress_auto_sys_field: sysparmSuppressAutoSysField,
        sysparm_view: sysparmView,
        sysparm_query_no_domain: sysparmQueryNoDomain,
      },
      body: requestBody,
    });
  }

  /**
   * Delete a record
   * @returns any ok
   * @throws ApiError
   */
  public static deleteApiNowTableByTableNameBySysId(
    data: DefaultData['DeleteApiNowTableByTableNameBySysId'],
  ): CancelablePromise<any> {
    const { tableName, sysId, sysparmQueryNoDomain } = data;
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/now/table/{tableName}/{sys_id}',
      path: {
        tableName,
        sys_id: sysId,
      },
      query: {
        sysparm_query_no_domain: sysparmQueryNoDomain,
      },
    });
  }

  /**
   * Update a record
   * @returns any ok
   * @throws ApiError
   */
  public static patchApiNowTableByTableNameBySysId(
    data: DefaultData['PatchApiNowTableByTableNameBySysId'],
  ): CancelablePromise<any> {
    const {
      tableName,
      sysId,
      sysparmDisplayValue,
      sysparmExcludeReferenceLink,
      sysparmFields,
      sysparmInputDisplayValue,
      sysparmSuppressAutoSysField,
      sysparmView,
      sysparmQueryNoDomain,
      requestBody,
    } = data;
    return __request(OpenAPI, {
      method: 'PATCH',
      url: '/api/now/table/{tableName}/{sys_id}',
      path: {
        tableName,
        sys_id: sysId,
      },
      query: {
        sysparm_display_value: sysparmDisplayValue,
        sysparm_exclude_reference_link: sysparmExcludeReferenceLink,
        sysparm_fields: sysparmFields,
        sysparm_input_display_value: sysparmInputDisplayValue,
        sysparm_suppress_auto_sys_field: sysparmSuppressAutoSysField,
        sysparm_view: sysparmView,
        sysparm_query_no_domain: sysparmQueryNoDomain,
      },
      body: requestBody,
    });
  }
}
