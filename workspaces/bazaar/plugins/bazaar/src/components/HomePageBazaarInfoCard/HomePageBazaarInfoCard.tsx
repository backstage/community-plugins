/*
 * Copyright 2021 The Backstage Authors
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

import { useState, useEffect } from 'react';
import { Card, ButtonIcon, Text } from '@backstage/ui';
import {
  HeaderIconLinkRow,
  IconLinkVerticalProps,
} from '@backstage/core-components';
import {
  RiEditLine,
  RiChat1Line,
  RiUserAddLine,
  RiLink2Line,
  RiDashboardLine,
  RiCloseLine,
  RiLinkUnlink2Line,
  RiFileTextLine,
  RiDoorOpenLine,
} from '@remixicon/react';
import { EditProjectDialog } from '../EditProjectDialog';
import {
  useApi,
  identityApiRef,
  useRouteRef,
} from '@backstage/core-plugin-api';
import { toastApiRef } from '@backstage/frontend-plugin-api';
import { Member, BazaarProject } from '../../types';
import { bazaarApiRef } from '../../api';
import Alert from '@material-ui/lab/Alert';
import useAsyncFn from 'react-use/esm/useAsyncFn';
import { catalogApiRef, entityRouteRef } from '@backstage/plugin-catalog-react';

import {
  stringifyEntityRef,
  Entity,
  parseEntityRef,
} from '@backstage/catalog-model';

import { ConfirmationDialog } from '../ConfirmationDialog/ConfirmationDialog';
import { CardContentFields } from '../CardContentFields/CardContentFields';
import { LinkProjectDialog } from '../LinkProjectDialog';
import {
  fetchCatalogItems,
  fetchProjectMembers,
} from '../../util/fetchMethods';
import { parseBazaarResponse } from '../../util/parseMethods';
import styles from './HomePageBazaarInfoCard.module.css';

type Props = {
  initProject: BazaarProject;
  handleClose: () => void;
  initEntity: Entity;
};

export const HomePageBazaarInfoCard = ({
  initProject,
  handleClose,
  initEntity,
}: Props) => {
  const entityLink = useRouteRef(entityRouteRef);
  const bazaarApi = useApi(bazaarApiRef);
  const identity = useApi(identityApiRef);
  const alertApi = useApi(toastApiRef);
  const catalogApi = useApi(catalogApiRef);
  const [openEdit, setOpenEdit] = useState(false);
  const [openProjectSelector, setOpenProjectSelector] = useState(false);
  const [openUnlink, setOpenUnlink] = useState(false);
  const [isMember, setIsMember] = useState(false);

  const [catalogEntities, fetchCatalogEntities] = useAsyncFn(async () => {
    const entities = await fetchCatalogItems(catalogApi);
    const bazaarProjects = await bazaarApi.getProjects();
    const bazaarLinkedRefs: string[] = bazaarProjects.data
      .filter((entity: any) => entity.entity_ref !== null)
      .map((entity: any) => entity.entity_ref);

    return entities.filter(
      (entity: Entity) =>
        !bazaarLinkedRefs.includes(stringifyEntityRef(entity)),
    );
  });

  const [bazaarProject, fetchBazaarProject] = useAsyncFn(async () => {
    const response = await bazaarApi.getProjectById(initProject.id);
    return await parseBazaarResponse(response);
  });

  const [members, fetchMembers] = useAsyncFn(async () => {
    return fetchProjectMembers(bazaarApi, bazaarProject.value ?? initProject);
  });

  const [userId, fetchUserId] = useAsyncFn(async () => {
    return await (
      await identity.getProfileInfo()
    ).displayName;
  });

  useEffect(() => {
    fetchMembers();
    fetchBazaarProject();
    fetchCatalogEntities();
    fetchUserId();
  }, [fetchMembers, fetchBazaarProject, fetchCatalogEntities, fetchUserId]);

  useEffect(() => {
    if (members.value && userId.value) {
      setIsMember(
        members.value
          ?.map((member: Member) => member.userId)
          .indexOf(userId.value) >= 0,
      );
    }
  }, [bazaarProject.value, members, identity, userId.value]);

  const handleMembersClick = async () => {
    if (userId.value) {
      if (!isMember) {
        await bazaarApi.addMember(bazaarProject.value!.id, userId.value);
      } else {
        await bazaarApi.deleteMember(bazaarProject.value!.id, userId.value);
      }
      setIsMember(!isMember);
      fetchMembers();
    }
  };

  const getEntityPageLink = () => {
    if (bazaarProject?.value?.entityRef) {
      const { name, kind, namespace } = parseEntityRef(
        bazaarProject.value.entityRef,
      );
      return entityLink({ kind, namespace, name });
    }
    return '';
  };

  const handleLink = () => {
    if (bazaarProject.value?.entityRef) {
      setOpenUnlink(true);
    } else {
      fetchCatalogEntities();
      setOpenProjectSelector(true);
    }
  };

  const links: IconLinkVerticalProps[] = [
    {
      label: 'Entity page',
      icon: <RiDashboardLine size={20} />,
      href: bazaarProject.value?.entityRef ? getEntityPageLink() : '',
      disabled: bazaarProject.value?.entityRef === null,
    },
    {
      label: bazaarProject.value?.entityRef ? 'Unlink project' : 'Link project',
      icon: bazaarProject.value?.entityRef ? (
        <RiLinkUnlink2Line size={20} />
      ) : (
        <RiLink2Line size={20} />
      ),
      onClick: handleLink,
    },
    {
      label: isMember ? 'Leave' : 'Join',
      icon: isMember ? (
        <RiDoorOpenLine size={20} />
      ) : (
        <RiUserAddLine size={20} />
      ),
      href: '',
      onClick: async () => {
        handleMembersClick();
      },
    },
    {
      label: 'Community',
      icon: <RiChat1Line size={20} />,
      href: bazaarProject.value?.community,
      disabled: !bazaarProject.value?.community || !isMember,
    },
    {
      label: 'Docs',
      icon: <RiFileTextLine size={20} />,
      href: bazaarProject.value?.docs,
      disabled:
        bazaarProject.value?.docs === null || bazaarProject.value?.docs === '',
    },
  ];

  const handleUnlinkSubmit = async () => {
    const updateResponse = await bazaarApi.updateProject({
      ...bazaarProject.value,
      entityRef: null,
    });

    if (updateResponse.status === 'ok') {
      setOpenUnlink(false);
      fetchBazaarProject();
      alertApi.post({
        title: `Unlinked entity '${
          parseEntityRef(bazaarProject.value?.entityRef!).name
        }' from the project ${bazaarProject.value?.title}`,
        status: 'success',
      });
    }
  };

  if (bazaarProject.error) {
    return <Alert severity="error">{bazaarProject?.error?.message}</Alert>;
  } else if (members.error) {
    return <Alert severity="error">{members?.error?.message}</Alert>;
  }

  return (
    <div>
      <LinkProjectDialog
        openProjectSelector={openProjectSelector}
        handleProjectSelectorClose={() => setOpenProjectSelector(false)}
        catalogEntities={catalogEntities.value || []}
        bazaarProject={bazaarProject.value || initProject}
        fetchBazaarProject={fetchBazaarProject}
        initEntity={initEntity}
      />

      {openUnlink && (
        <ConfirmationDialog
          open={openUnlink}
          handleClose={() => setOpenUnlink(false)}
          message={[
            'Are you sure you want to unlink ',
            <b className={styles.wordBreak}>
              {parseEntityRef(bazaarProject.value?.entityRef!).name}
            </b>,
            ' from ',
            <b className={styles.wordBreak}>{bazaarProject.value?.title}</b>,
            ' ?',
          ]}
          type="unlink"
          handleSubmit={handleUnlinkSubmit}
        />
      )}

      <Card>
        <EditProjectDialog
          bazaarProject={bazaarProject.value || initProject}
          openEdit={openEdit}
          handleEditClose={() => setOpenEdit(false)}
          handleCardClose={handleClose}
          fetchBazaarProject={fetchBazaarProject}
        />

        <div className={styles.cardHeader}>
          <div className={styles.headerMain}>
            <Text className={styles.wordBreak}>
              {bazaarProject.value?.title || initProject.title}
            </Text>
            <HeaderIconLinkRow links={links} />
          </div>
          <div className={styles.headerActions}>
            <ButtonIcon
              aria-label="edit"
              icon={<RiEditLine size={16} />}
              variant="secondary"
              onPress={() => setOpenEdit(true)}
            />
            <ButtonIcon
              aria-label="close"
              icon={<RiCloseLine size={16} />}
              variant="secondary"
              onPress={handleClose}
            />
          </div>
        </div>
        <hr className={styles.divider} />

        <CardContentFields
          bazaarProject={bazaarProject.value || initProject}
          members={members.value || []}
          descriptionSize={9}
          membersSize={3}
          isMember={isMember}
        />
      </Card>
    </div>
  );
};
