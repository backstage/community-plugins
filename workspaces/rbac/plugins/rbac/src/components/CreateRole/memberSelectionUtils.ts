/*
 * Copyright 2026 The Backstage Authors
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
import { stringifyEntityRef } from '@backstage/catalog-model';
import { TranslationFunction } from '@backstage/core-plugin-api/alpha';

import { rbacTranslationRef } from '../../alpha/translations';
import { MemberEntity } from '../../types';
import {
  getChildGroupsCount,
  getMembersCount,
  getParentGroupsCount,
} from '../../utils/create-role-utils';
import { SelectedMember } from './types';

/** Catalog size above which the members modal is used instead of the dropdown. */
export const MEMBERS_MODAL_THRESHOLD = 100;

export const getMemberDescription = (
  member: MemberEntity,
  t: TranslationFunction<typeof rbacTranslationRef.T>,
) => {
  const memberCount = getMembersCount(member);
  const parentCount = getParentGroupsCount(member);
  const childCount = getChildGroupsCount(member);

  return member.kind === 'Group'
    ? [
        memberCount > 0
          ? t('common.membersCount' as any, {
              count: String(memberCount),
            })
          : '',
        parentCount > 0
          ? t('common.parentGroupCount' as any, {
              count: String(parentCount),
            })
          : '',
        childCount > 0
          ? t('common.childGroupsCount' as any, {
              count: String(childCount),
            })
          : '',
      ]
        .filter(Boolean)
        .join(', ')
    : undefined;
};

export const toSelectedMember = (
  member: MemberEntity,
  index: number,
  t: TranslationFunction<typeof rbacTranslationRef.T>,
): SelectedMember => {
  const tag =
    member.metadata.etag ?? `${member.metadata.name}-${member.kind}-${index}`;
  return {
    id: tag,
    label: member.spec?.profile?.displayName ?? member.metadata.name,
    description: getMemberDescription(member, t),
    etag: tag,
    type: member.kind,
    namespace: member.metadata.namespace,
    members: getMembersCount(member),
    ref: stringifyEntityRef(member),
  };
};
