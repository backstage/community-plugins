/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { unstable_ClassNameGenerator as ClassNameGenerator } from '@mui/material/className';

ClassNameGenerator.configure(componentName => {
  return componentName.startsWith('v5-')
    ? componentName
    : `v5-${componentName}`;
});

export { rbacPlugin, RbacPage, Administration } from './plugin';
export { rbacApiRef } from './api/RBACBackendClient';
export type { RBACAPI } from './api/RBACBackendClient';

export { default as AdminPanelSettingsOutlinedIcon } from '@mui/icons-material/AdminPanelSettingsOutlined';
export { default as RbacIcon } from '@mui/icons-material/VpnKeyOutlined';
export type {
  MemberEntity,
  RoleError,
  PluginConditionRules,
  RoleBasedConditions,
  ConditionRule,
} from './types';
