export interface Services {
  services: ServiceElement[];
}

export interface ServiceElement {
  service: ServiceService;
}

export interface ServiceService {
  id: number;
  name: string;
  state: string;
  system_name: string;
  backend_version: string;
  deployment_option: string;
  support_email: string;
  description: string;
  intentions_required: boolean;
  buyers_manage_apps: boolean;
  buyers_manage_keys: boolean;
  referrer_filters_required: boolean;
  custom_keys_enabled: boolean;
  buyer_key_regenerate_enabled: boolean;
  mandatory_app_key: boolean;
  buyer_can_select_plan: boolean;
  buyer_plan_change_permission: string;
  created_at: Date;
  updated_at: Date;
  links: Link[];
}

export interface Link {
  rel: string;
  href: string;
}

export interface APIDocs {
  api_docs: APIDocElement[];
}

export interface APIDocElement {
  api_doc: APIDoc;
}

export interface APIDoc {
  id: number;
  system_name: string;
  name: string;
  published: boolean;
  skip_swagger_validations: boolean;
  body: string;
  created_at: Date;
  updated_at: Date;
  description?: string;
  service_id?: number;
}

export interface Proxy {
  proxy: ProxyElement;
}

export interface ProxyElement {
  service_id: number;
  endpoint: string;
  api_backend: string;
  credentials_location: string;
  auth_app_key: string;
  auth_app_id: string;
  auth_user_key: string;
  error_auth_failed: string;
  error_auth_missing: string;
  error_status_auth_failed: number;
  error_headers_auth_failed: string;
  error_status_auth_missing: number;
  error_headers_auth_missing: string;
  error_no_match: string;
  error_status_no_match: number;
  error_headers_no_match: string;
  error_limits_exceeded: string;
  error_status_limits_exceeded: number;
  error_headers_limits_exceeded: string;
  secret_token: string;
  sandbox_endpoint: string;
  api_test_path: string;
  policies_config: PoliciesConfig[];
  created_at: Date;
  updated_at: Date;
  deployment_option: string;
  lock_version: number;
  links: Link[];
}

export interface PoliciesConfig {
  name: string;
  version: string;
  configuration: Configuration;
  enabled: boolean;
}

export interface Configuration {
  commands?: Command[];
}

export interface Command {
  op: string;
  regex: string;
  replace: string;
}
