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
import type {
  AuditorService,
  LoggerService,
} from '@backstage/backend-plugin-api';

import { Enforcer, newEnforcer, newModelFromString } from 'casbin';
import { parse } from 'csv-parse/sync';
import { difference } from 'lodash';

import { PermissionEvents, RoleEvents } from '../auditor/auditor';
import {
  RoleMetadataDao,
  RoleMetadataStorage,
} from '../database/role-metadata';
import {
  mergeRoleMetadata,
  metadataStringToPolicy,
  policyToString,
  transformArrayToPolicy,
  transformPolicyGroupToLowercase,
} from '../helper';
import { EnforcerDelegate } from '../service/enforcer-delegate';
import { MODEL } from '../service/permission-model';
import {
  checkForDuplicateGroupPolicies,
  checkForDuplicatePolicies,
  validateGroupingPolicy,
  validatePolicy,
  validateSource,
} from '../validation/policies-validation';
import { AbstractFileWatcher } from './file-watcher';
import { LowercaseFileAdapter } from './lowercase-file-adapter';

export const CSV_PERMISSION_POLICY_FILE_AUTHOR = 'csv permission policy file';

type CSVFilePolicies = {
  addedPolicies: string[][];
  removedPolicies: string[][];
  addedGroupPolicies: Map<string, string[]>;
  removedGroupPolicies: Map<string, string[]>;
};

export class CSVFileWatcher extends AbstractFileWatcher<string[][]> {
  private currentContent: string[][];
  private csvFilePolicies: CSVFilePolicies;

  constructor(
    filePath: string | undefined,
    allowReload: boolean,
    logger: LoggerService,
    private readonly enforcer: EnforcerDelegate,
    private readonly roleMetadataStorage: RoleMetadataStorage,
    private readonly auditor: AuditorService,
  ) {
    super(filePath, allowReload, logger);
    this.currentContent = [];
    this.csvFilePolicies = {
      addedPolicies: [],
      removedPolicies: [],
      addedGroupPolicies: new Map<string, string[]>(),
      removedGroupPolicies: new Map<string, string[]>(),
    };
  }

  /**
   * parse is used to parse the current contents of the CSV file.
   * @returns The CSV file parsed into a string[][].
   */
  parse(): string[][] {
    const content = this.getCurrentContents();
    const data = parse(content, {
      skip_empty_lines: true,
      relax_column_count: true,
      trim: true,
    });

    for (const policy of data) {
      transformPolicyGroupToLowercase(policy);
    }

    return data;
  }

  /**
   * initialize will initialize the CSV file by loading all of the permission policies and roles into
   * the enforcer.
   * First, we will remove all roles and permission policies if they do not exist in the temporary file enforcer.
   * Next, we will add all roles and permission polices if they are new to the CSV file
   * Finally, we will set the file to be watched if allow reload is set
   * @param csvFileName The name of the csvFile
   * @param allowReload Whether or not we will allow reloads of the CSV file
   */
  async initialize(): Promise<void> {
    if (!this.filePath) {
      return;
    }
    let content: string[][] = [];
    // If the file is set load the file contents
    content = this.parse();

    const tempEnforcer = await newEnforcer(
      newModelFromString(MODEL),
      new LowercaseFileAdapter(this.filePath),
    );

    // Check for any old policies that will need to be removed
    await this.filterPoliciesAndRoles(
      this.enforcer,
      tempEnforcer,
      this.csvFilePolicies.removedPolicies,
      this.csvFilePolicies.removedGroupPolicies,
      true,
    );

    await this.filterPoliciesAndRoles(
      tempEnforcer,
      this.enforcer,
      this.csvFilePolicies.addedPolicies,
      this.csvFilePolicies.addedGroupPolicies,
    );

    await this.migrateLegacyMetadata(tempEnforcer);

    // We pass current here because this is during initialization and it has not changed yet
    await this.updatePolicies(content);

    if (this.allowReload) {
      this.watchFile();
    }
  }

  // Check for policies that might need to be updated
  // This will involve update "legacy" source in the role metadata if it exist in both the
  // temp enforcer (csv file) and a role metadata storage.
  // We will update role metadata with the new source "csv-file"
  private async migrateLegacyMetadata(tempEnforcer: Enforcer) {
    let legacyRolesMetadata =
      await this.roleMetadataStorage.filterRoleMetadata('legacy');
    const legacyRoles = legacyRolesMetadata.map(meta => meta.roleEntityRef);
    if (legacyRoles.length > 0) {
      const legacyGroupPolicies = await tempEnforcer.getFilteredGroupingPolicy(
        1,
        ...legacyRoles,
      );
      const legacyPolicies = await tempEnforcer.getFilteredPolicy(
        0,
        ...legacyRoles,
      );
      const legacyRolesFromFile = new Set([
        ...legacyGroupPolicies.map(gp => gp[1]),
        ...legacyPolicies.map(p => p[0]),
      ]);
      legacyRolesMetadata = legacyRolesMetadata.filter(meta =>
        legacyRolesFromFile.has(meta.roleEntityRef),
      );
      for (const legacyRoleMeta of legacyRolesMetadata) {
        const nonLegacyRole = mergeRoleMetadata(legacyRoleMeta, {
          modifiedBy: CSV_PERMISSION_POLICY_FILE_AUTHOR,
          source: 'csv-file',
          roleEntityRef: legacyRoleMeta.roleEntityRef,
        });
        await this.roleMetadataStorage.updateRoleMetadata(
          nonLegacyRole,
          legacyRoleMeta.roleEntityRef,
        );
      }
    }
  }

  /**
   * onChange is called whenever there is a change to the CSV file.
   * It will parse the current and new contents of the CSV file and process the roles and permission policies present.
   * Afterwards, it will find the difference between the current and new contents of the CSV file
   * and sort them into added / removed, permission policies / roles.
   * It will finally call updatePolicies with the new content.
   */
  async onChange(): Promise<void> {
    const newContent = this.parse();

    const tempEnforcer = await newEnforcer(
      newModelFromString(MODEL),
      new LowercaseFileAdapter(this.filePath!),
    );

    const currentFlatContent = this.currentContent.flatMap(data => {
      return policyToString(data);
    });
    const newFlatContent = newContent.flatMap(data => {
      return policyToString(data);
    });

    await this.findFileContentDiff(
      currentFlatContent,
      newFlatContent,
      tempEnforcer,
    );

    await this.updatePolicies(newContent);
  }

  /**
   * updatePolicies is used to update all of the permission policies and roles within a CSV file.
   * It will check the number of added and removed permissions policies and roles and call the appropriate
   * methods for these.
   * It will also update the current contents of the CSV file to the most recent
   * @param newContent The new content present in the CSV file
   */
  private async updatePolicies(newContent: string[][]): Promise<void> {
    this.currentContent = newContent;

    if (this.csvFilePolicies.addedPolicies.length > 0)
      await this.addPermissionPolicies();
    if (this.csvFilePolicies.removedPolicies.length > 0)
      await this.removePermissionPolicies();
    if (this.csvFilePolicies.addedGroupPolicies.size > 0) await this.addRoles();
    if (this.csvFilePolicies.removedGroupPolicies.size > 0)
      await this.removeRoles();
  }

  /**
   * addPermissionPolicies will add the new permission policies that are present in the CSV file.
   */
  private async addPermissionPolicies(): Promise<void> {
    const meta = {
      policies: this.csvFilePolicies.addedPolicies,
      source: 'csv-file',
    };
    const auditorEvent = await this.auditor.createEvent({
      eventId: PermissionEvents.POLICY_CREATE,
      severityLevel: 'medium',
      meta: { source: meta.source },
    });

    try {
      await this.enforcer.addPolicies(this.csvFilePolicies.addedPolicies);
      await auditorEvent.success({ meta });
    } catch (e) {
      await auditorEvent.fail({
        meta,
        error: e,
      });
    }

    this.csvFilePolicies.addedPolicies = [];
  }

  /**
   * removePermissionPolicies will remove the permission policies that are no longer present in the CSV file.
   */
  private async removePermissionPolicies(): Promise<void> {
    const meta = {
      policies: this.csvFilePolicies.removedPolicies,
      source: 'csv-file',
    };
    const auditorEvent = await this.auditor.createEvent({
      eventId: PermissionEvents.POLICY_DELETE,
      severityLevel: 'medium',
      meta: { source: meta.source },
    });

    try {
      await this.enforcer.removePolicies(this.csvFilePolicies.removedPolicies);
      await auditorEvent.success({ meta });
    } catch (e) {
      await auditorEvent.fail({
        meta,
        error: e,
      });
    }

    this.csvFilePolicies.removedPolicies = [];
  }

  /**
   * addRoles will add the new roles that are present in the CSV file.
   */
  private async addRoles(): Promise<void> {
    const changedPolicies: {
      added: string[][];
      updated: string[][];
      failed: { error: string; policies: string[][] }[];
    } = {
      added: [],
      updated: [],
      failed: [],
    };

    const auditorEvent = await this.auditor.createEvent({
      eventId: RoleEvents.ROLE_CREATE_OR_UPDATE,
      severityLevel: 'medium',
      meta: { source: 'csv-file' },
    });

    for (const [key, value] of this.csvFilePolicies.addedGroupPolicies) {
      const groupPolicies = value.map(member => {
        return [member, key];
      });

      const roleMetadata: RoleMetadataDao = {
        source: 'csv-file',
        roleEntityRef: key,
        author: CSV_PERMISSION_POLICY_FILE_AUTHOR,
        modifiedBy: CSV_PERMISSION_POLICY_FILE_AUTHOR,
      };

      try {
        const currentMetadata = await this.roleMetadataStorage.findRoleMetadata(
          roleMetadata.roleEntityRef,
        );

        await this.enforcer.addGroupingPolicies(groupPolicies, roleMetadata);
        const eventName = currentMetadata
          ? RoleEvents.ROLE_UPDATE
          : RoleEvents.ROLE_CREATE;

        if (eventName === RoleEvents.ROLE_UPDATE) {
          changedPolicies.updated.push(...groupPolicies);
        } else {
          changedPolicies.added.push(...groupPolicies);
        }
      } catch (e) {
        changedPolicies.failed.push({ error: e, policies: groupPolicies });
      }
    }

    if (changedPolicies.failed) {
      await auditorEvent.fail({
        error: new Error(
          `Failed to add or update group policies after modification ${this.filePath}.`,
        ),
        meta: { source: 'csv-file', changedPolicies },
      });
    } else {
      await auditorEvent.success({
        meta: {
          source: 'csv-file',
          added: changedPolicies.added,
          updated: changedPolicies.updated,
        },
      });
    }

    this.csvFilePolicies.addedGroupPolicies = new Map<string, string[]>();
  }

  /**
   * removeRoles will remove the roles that are no longer present in the CSV file.
   * If the role exists with multiple groups and or users, we will update it role information.
   * Otherwise, we will remove the role completely.
   */
  private async removeRoles(): Promise<void> {
    for (const [key, value] of this.csvFilePolicies.removedGroupPolicies) {
      // This requires knowledge of whether or not it is an update
      const oldGroupingPolicies = await this.enforcer.getFilteredGroupingPolicy(
        1,
        key,
      );
      const groupPolicies = value.map(member => {
        return [member, key];
      });

      const roleMetadata: RoleMetadataDao = {
        source: 'csv-file',
        roleEntityRef: key,
        author: CSV_PERMISSION_POLICY_FILE_AUTHOR,
        modifiedBy: CSV_PERMISSION_POLICY_FILE_AUTHOR,
      };
      const isUpdate =
        oldGroupingPolicies.length > 1 &&
        oldGroupingPolicies.length !== groupPolicies.length;
      const eventId = isUpdate
        ? RoleEvents.ROLE_UPDATE
        : RoleEvents.ROLE_DELETE;

      const meta = {
        ...roleMetadata,
        members: value,
      };
      const auditorEvent = await this.auditor.createEvent({
        eventId: eventId,
        severityLevel: 'medium',
        meta: { source: roleMetadata.source },
      });

      try {
        await this.enforcer.removeGroupingPolicies(
          groupPolicies,
          roleMetadata,
          isUpdate,
        );
        await auditorEvent.success({ meta });
      } catch (e) {
        await auditorEvent.fail({
          meta,
          error: e,
        });
      }
    }

    this.csvFilePolicies.removedGroupPolicies = new Map<string, string[]>();
  }

  async cleanUpRolesAndPolicies(): Promise<void> {
    const roleMetadatas =
      await this.roleMetadataStorage.filterRoleMetadata('csv-file');
    const fileRoles = roleMetadatas.map(meta => meta.roleEntityRef);

    if (fileRoles.length > 0) {
      for (const fileRole of fileRoles) {
        const filteredPolicies = await this.enforcer.getFilteredGroupingPolicy(
          1,
          fileRole,
        );
        for (const groupPolicy of filteredPolicies) {
          this.addGroupPolicyToMap(
            this.csvFilePolicies.removedGroupPolicies,
            groupPolicy[1],
            groupPolicy[0],
          );
        }
        this.csvFilePolicies.removedPolicies.push(
          ...(await this.enforcer.getFilteredPolicy(0, fileRole)),
        );
      }
    }
    await this.removePermissionPolicies();
    await this.removeRoles();
  }

  async filterPoliciesAndRoles(
    enforcerOne: Enforcer | EnforcerDelegate,
    enforcerTwo: Enforcer | EnforcerDelegate,
    policies: string[][],
    groupPolicies: Map<string, string[]>,
    remove?: boolean,
  ) {
    // Check for any policies that need to be edited by comparing policies from
    // one enforcer to the other
    const policiesToEdit = await enforcerOne.getPolicy();
    const groupPoliciesToEdit = await enforcerOne.getGroupingPolicy();

    for (const policy of policiesToEdit) {
      if (
        !(await enforcerTwo.hasPolicy(...policy)) &&
        (await this.validateAddedPolicy(
          policy,
          enforcerOne as Enforcer,
          remove,
        ))
      ) {
        policies.push(policy);
      }
    }

    for (const groupPolicy of groupPoliciesToEdit) {
      if (
        !(await enforcerTwo.hasGroupingPolicy(...groupPolicy)) &&
        (await this.validateAddedGroupPolicy(
          groupPolicy,
          enforcerOne as Enforcer,
          remove,
        ))
      ) {
        this.addGroupPolicyToMap(groupPolicies, groupPolicy[1], groupPolicy[0]);
      }
    }
  }

  async validateAddedPolicy(
    policy: string[],
    tempEnforcer: Enforcer,
    remove?: boolean,
  ): Promise<boolean> {
    const transformedPolicy = transformArrayToPolicy(policy);
    const metadata = await this.roleMetadataStorage.findRoleMetadata(policy[0]);

    if (remove) {
      return metadata?.source === 'csv-file';
    }

    let err = validatePolicy(transformedPolicy);
    if (err) {
      this.logger.warn(
        `Failed to validate policy from file ${this.filePath}. Cause: ${err.message}`,
      );
      return false;
    }

    err = await validateSource('csv-file', metadata);
    if (err) {
      this.logger.warn(
        `Unable to add policy ${policy} from file ${this.filePath}. Cause: ${err.message}`,
      );
      return false;
    }

    err = await checkForDuplicatePolicies(tempEnforcer, policy, this.filePath!);
    if (err) {
      this.logger.warn(err.message);
      return false;
    }

    return true;
  }

  async validateAddedGroupPolicy(
    groupPolicy: string[],
    tempEnforcer: Enforcer,
    remove?: boolean,
  ): Promise<boolean> {
    const metadata = await this.roleMetadataStorage.findRoleMetadata(
      groupPolicy[1],
    );

    if (remove) {
      return metadata?.source === 'csv-file';
    }

    let err = await validateGroupingPolicy(groupPolicy, metadata, 'csv-file');
    if (err) {
      this.logger.warn(
        `${err.message}, error originates from file ${this.filePath}`,
      );
      return false;
    }

    err = await checkForDuplicateGroupPolicies(
      tempEnforcer,
      groupPolicy,
      this.filePath!,
    );
    if (err) {
      this.logger.warn(err.message);
      return false;
    }

    return true;
  }

  async findFileContentDiff(
    currentFlatContent: string[],
    newFlatContent: string[],
    tempEnforcer: Enforcer,
  ) {
    const diffRemoved = difference(currentFlatContent, newFlatContent); // policy was removed
    const diffAdded = difference(newFlatContent, currentFlatContent); // policy was added

    await this.migrateLegacyMetadata(tempEnforcer);

    if (diffRemoved.length === 0 && diffAdded.length === 0) {
      return;
    }

    diffRemoved.forEach(policy => {
      const convertedPolicy = metadataStringToPolicy(policy);
      if (convertedPolicy[0] === 'p') {
        convertedPolicy.splice(0, 1);
        this.csvFilePolicies.removedPolicies.push(convertedPolicy);
      } else if (convertedPolicy[0] === 'g') {
        convertedPolicy.splice(0, 1);
        this.addGroupPolicyToMap(
          this.csvFilePolicies.removedGroupPolicies,
          convertedPolicy[1],
          convertedPolicy[0],
        );
      }
    });

    for (const policy of diffAdded) {
      const convertedPolicy = metadataStringToPolicy(policy);
      if (convertedPolicy[0] === 'p') {
        convertedPolicy.splice(0, 1);
        if (await this.validateAddedPolicy(convertedPolicy, tempEnforcer))
          this.csvFilePolicies.addedPolicies.push(convertedPolicy);
      } else if (convertedPolicy[0] === 'g') {
        convertedPolicy.splice(0, 1);
        if (await this.validateAddedGroupPolicy(convertedPolicy, tempEnforcer))
          this.addGroupPolicyToMap(
            this.csvFilePolicies.addedGroupPolicies,
            convertedPolicy[1],
            convertedPolicy[0],
          );
      }
    }
  }

  addGroupPolicyToMap(
    groupPolicyMap: Map<string, string[]>,
    key: string,
    value: string,
  ) {
    if (!groupPolicyMap.has(key)) {
      groupPolicyMap.set(key, []);
    }
    groupPolicyMap.get(key)?.push(value);
  }
}
