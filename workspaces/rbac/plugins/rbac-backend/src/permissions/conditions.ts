/*
 * Copyright 2025 The Backstage Authors
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
import {
  ConditionTransformer,
  createConditionExports,
  createConditionTransformer,
} from '@backstage/plugin-permission-node';

import { rules, RBACFilter } from './rules';
import { PermissionsRegistryService } from '@backstage/backend-plugin-api';
import { permissionMetadataResourceRef } from './resource';

const { conditions, createConditionalDecision } = createConditionExports({
  resourceRef: permissionMetadataResourceRef,
  rules,
});

export const rbacConditions = conditions;

export const createRBACConditionalDecision = createConditionalDecision;

export const conditionTransformerFunc: (
  permissionRegistry: PermissionsRegistryService,
) => ConditionTransformer<RBACFilter> = (
  permissionRegistry: PermissionsRegistryService,
) =>
  createConditionTransformer(
    permissionRegistry.getPermissionRuleset(permissionMetadataResourceRef),
  );
