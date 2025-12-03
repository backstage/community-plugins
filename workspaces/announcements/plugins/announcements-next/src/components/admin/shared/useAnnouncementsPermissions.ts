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
import { usePermission } from '@backstage/plugin-permission-react';
import { announcementEntityPermissions } from '@backstage-community/plugin-announcements-common';

/**
 * Hook that provides all announcement-related permissions in a single place.
 * This reduces duplication across components and ensures consistent permission checking.
 *
 * @returns Object containing loading states and allowed flags for each permission
 *
 * @public
 */
export function useAnnouncementsPermissions() {
  const {
    announcementCreatePermission,
    announcementDeletePermission,
    announcementUpdatePermission,
  } = announcementEntityPermissions;

  const { loading: loadingCreate, allowed: canCreate } = usePermission({
    permission: announcementCreatePermission,
  });

  const { loading: loadingDelete, allowed: canDelete } = usePermission({
    permission: announcementDeletePermission,
  });

  const { loading: loadingUpdate, allowed: canUpdate } = usePermission({
    permission: announcementUpdatePermission,
  });

  return {
    create: {
      loading: loadingCreate,
      allowed: canCreate,
    },
    delete: {
      loading: loadingDelete,
      allowed: canDelete,
    },
    update: {
      loading: loadingUpdate,
      allowed: canUpdate,
    },
    // Convenience flags for common combinations
    isLoading: loadingCreate || loadingDelete || loadingUpdate,
  };
}
