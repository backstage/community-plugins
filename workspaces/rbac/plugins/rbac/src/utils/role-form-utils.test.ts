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
import { IdentityApi } from '@backstage/core-plugin-api';
import { MockConfigApi } from '@backstage/test-utils';

import { RoleBasedPolicy } from '@backstage-community/plugin-rbac-common';

import { mockNewConditions } from '../__fixtures__/mockConditions';
import {
  mockAssociatedPolicies,
  mockPolicies,
} from '../__fixtures__/mockPolicies';
import { RBACAPI, RBACBackendClient } from '../api/RBACBackendClient';
import { RoleBasedConditions, UpdatedConditionsData } from '../types';
import {
  createConditions,
  createPermissions,
  modifyConditions,
  removeConditions,
  removePermissions,
} from './role-form-utils';
import { mockT } from '../test-utils/mockTranslations';

jest.mock('../api/RBACBackendClient');

describe('RBAC Permissions Functions', () => {
  let mockRbacApi: RBACAPI;

  const bearerToken = 'test-token';

  const identityApi = {
    async getCredentials() {
      return { token: bearerToken };
    },
  } as IdentityApi;

  const mockConfigApi = new MockConfigApi({
    permission: {
      enabled: true,
    },
  });

  beforeEach(() => {
    mockRbacApi = new RBACBackendClient({
      configApi: mockConfigApi,
      identityApi,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPermissions', () => {
    it('should call createPolicies with the correct parameters', async () => {
      const newPermissions: RoleBasedPolicy[] = mockAssociatedPolicies;
      mockRbacApi.createPolicies = jest
        .fn()
        .mockResolvedValue({ status: 200 } as Response);

      await createPermissions(newPermissions, mockRbacApi, mockT as any);
      expect(mockRbacApi.createPolicies).toHaveBeenCalledWith(newPermissions);
    });

    it('should throw an error if createPolicies returns an error', async () => {
      const newPermissions: RoleBasedPolicy[] = mockAssociatedPolicies;
      const errorMsg = 'Mock error message';
      mockRbacApi.createPolicies = jest
        .fn()
        .mockResolvedValue({ error: { message: errorMsg, name: 'Not found' } });

      await expect(
        createPermissions(newPermissions, mockRbacApi, mockT as any),
      ).rejects.toThrow(
        `Unable to create the permission policies. ${errorMsg}`,
      );
    });
  });

  describe('removePermissions', () => {
    it('should call deletePolicies with the correct parameters', async () => {
      const name = 'role:default/rbac_admin';
      const deletePermissions: RoleBasedPolicy[] = mockPolicies;
      mockRbacApi.deletePolicies = jest
        .fn()
        .mockResolvedValue({ status: 204 } as Response);

      await removePermissions(
        name,
        deletePermissions,
        mockRbacApi,
        mockT as any,
      );
      expect(mockRbacApi.deletePolicies).toHaveBeenCalledWith(
        name,
        deletePermissions,
      );
    });

    it('should throw an error if deletePolicies returns an error', async () => {
      const name = 'role:default/rbac_admin';
      const deletePermissions: RoleBasedPolicy[] = mockPolicies;
      const errorMsg = 'Mock error message';
      mockRbacApi.deletePolicies = jest
        .fn()
        .mockResolvedValue({ error: { message: errorMsg, name: 'Not found' } });

      await expect(
        removePermissions(name, deletePermissions, mockRbacApi, mockT as any),
      ).rejects.toThrow(
        `Unable to delete the permission policies. ${errorMsg}`,
      );
    });
  });

  describe('removeConditions', () => {
    it('should call deleteConditionalPolicies for each condition', async () => {
      const deleteConditions = [1, 2, 3];
      mockRbacApi.deleteConditionalPolicies = jest
        .fn()
        .mockResolvedValue({ status: 204 } as Response);

      await removeConditions(deleteConditions, mockRbacApi, mockT as any);
      deleteConditions.forEach(cid => {
        expect(mockRbacApi.deleteConditionalPolicies).toHaveBeenCalledWith(cid);
      });
    });

    it('should throw an error if any deleteConditionalPolicies call returns an error', async () => {
      const deleteConditions = [1, 2, 3];
      const errorMsg = 'Mock error message';
      mockRbacApi.deleteConditionalPolicies = jest
        .fn()
        .mockResolvedValueOnce({ status: 204 } as Response)
        .mockResolvedValueOnce({ status: 204 } as Response)
        .mockResolvedValueOnce({
          error: { message: errorMsg, name: 'Not found' },
        });

      await expect(
        removeConditions(deleteConditions, mockRbacApi, mockT as any),
      ).rejects.toThrow(
        `Unable to remove conditions from the role. ${errorMsg}`,
      );
    });
  });

  describe('modifyConditions', () => {
    it('should call updateConditionalPolicies for each condition', async () => {
      const updateConditions: UpdatedConditionsData = [
        {
          id: 1,
          updateCondition: mockNewConditions[0],
        },
      ];
      mockRbacApi.updateConditionalPolicies = jest
        .fn()
        .mockResolvedValue({ status: 200 } as Response);

      await modifyConditions(updateConditions, mockRbacApi, mockT as any);
      updateConditions.forEach(({ id, updateCondition }) => {
        expect(mockRbacApi.updateConditionalPolicies).toHaveBeenCalledWith(
          id,
          updateCondition,
        );
      });
    });

    it('should throw an error if any updateConditionalPolicies call returns an error', async () => {
      const updateConditions: UpdatedConditionsData = [
        {
          id: 2,
          updateCondition: mockNewConditions[1],
        },
      ];
      const errorMsg = 'Mock error message';
      mockRbacApi.updateConditionalPolicies = jest.fn().mockResolvedValue({
        error: { message: errorMsg, name: 'Not found' },
      });

      await expect(
        modifyConditions(updateConditions, mockRbacApi, mockT as any),
      ).rejects.toThrow(`Unable to update conditions. ${errorMsg}`);
    });
  });

  describe('createConditions', () => {
    it('should call createConditionalPermission for each condition', async () => {
      const newConditions: RoleBasedConditions[] = mockNewConditions;
      mockRbacApi.createConditionalPermission = jest
        .fn()
        .mockResolvedValue({ status: 200 } as Response);

      await createConditions(newConditions, mockRbacApi, mockT as any);
      newConditions.forEach(cpp => {
        expect(mockRbacApi.createConditionalPermission).toHaveBeenCalledWith(
          cpp,
        );
      });
    });

    it('should throw an error if any createConditionalPermission call returns an error', async () => {
      const newConditions: RoleBasedConditions[] = mockNewConditions;
      const errorMsg = 'Mock error message';
      mockRbacApi.createConditionalPermission = jest.fn().mockResolvedValue({
        error: { message: errorMsg, name: 'Not found' },
      });

      await expect(
        createConditions(newConditions, mockRbacApi, mockT as any),
      ).rejects.toThrow(`Unable to add conditions to the role. ${errorMsg}`);
    });
  });
});
