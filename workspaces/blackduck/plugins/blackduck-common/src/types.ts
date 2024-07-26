/**
 * @public
 */
export type META = {
  allow: [];
  href: string;
  links: [];
};

/**
 * @public
 */
export type BD_PROJECT_DETAIL = {
  name: string;
  projectLevelAdjustments: string;
  cloneCategories: [];
  customSignatureEnabled: string;
  customSignatureDepth: string;
  deepLicenseDataEnabled: string;
  snippetAdjustmentApplied: string;
  licenseConflictsEnabled: string;
  projectGroup: string;
  createdAt: string;
  createdBy: string;
  createdByUser: string;
  updatedAt: string;
  updatedBy: string;
  updatedByUser: string;
  source: string;
  _meta: META;
};

/**
 * @public
 */
export type BD_VERISON_DETAIL = {
  versionName: string;
  phase: string;
  distribution: string;
  license: [];
  createdAt: string;
  createdBy: string;
  createdByUser: string;
  settingUpdatedAt: string;
  settingUpdatedBy: string;
  settingUpdatedByUser: string;
  source: string;
  _meta: META;
};

/**
 * @public
 */
export type BD_REST_API_RESPONSE = {
  totalCount: Number;
  items: [];
  appliedFilters: [];
  _meta: META;
};

/**
 * @public
 */
export type BD_PROJECTS_API_RESPONSE = {
  totalCount: Number;
  items: BD_PROJECT_DETAIL[];
  appliedFilters: [];
  _meta: META;
};

/**
 * @public
 */
export type BD_VERSIONS_API_RESPONSE = {
  totalCount: Number;
  items: BD_VERISON_DETAIL[];
  appliedFilters: [];
  _meta: META;
};
