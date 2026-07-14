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
import { ButtonIcon, Text } from '@backstage/ui';
import {
  HeaderIconLinkRow,
  IconLinkVerticalProps,
} from '@backstage/core-components';
import {
  RiEditLine,
  RiChat1Line,
  RiUserAddLine,
  RiDashboardLine,
  RiLinkUnlink2Line,
  RiFileTextLine,
  RiDoorOpenLine,
} from '@remixicon/react';
import { EditProjectDialog } from '../EditProjectDialog';
import { useApi, identityApiRef } from '@backstage/core-plugin-api';
import { BazaarProject, Member } from '../../types';
import { bazaarApiRef } from '../../api';
import Alert from '@material-ui/lab/Alert';
import useAsyncFn from 'react-use/esm/useAsyncFn';
import { parseEntityRef } from '@backstage/catalog-model';
import { ConfirmationDialog } from '../ConfirmationDialog';
import { CardContentFields } from '../CardContentFields';
import { fetchProjectMembers } from '../../util/fetchMethods';
import styles from './EntityBazaarInfoContent.module.css';

type Props = {
  bazaarProject: BazaarProject | null | undefined;
  fetchBazaarProject: () => Promise<BazaarProject | null>;
};

export const EntityBazaarInfoContent = ({
  bazaarProject,
  fetchBazaarProject,
}: Props) => {
  const bazaarApi = useApi(bazaarApiRef);
  const identity = useApi(identityApiRef);
  const [openEdit, setOpenEdit] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [openUnlink, setOpenUnlink] = useState(false);
  const [members, fetchMembers] = useAsyncFn(async () => {
    return bazaarProject
      ? await fetchProjectMembers(bazaarApi, bazaarProject)
      : [];
  });

  const [userId, fetchUserId] = useAsyncFn(async () => {
    return await (
      await identity.getProfileInfo()
    ).displayName;
  });

  useEffect(() => {
    fetchMembers();
    fetchUserId();
  }, [fetchMembers, fetchUserId]);

  useEffect(() => {
    if (members.value && userId.value) {
      setIsMember(
        members.value
          ?.map((member: Member) => member.userId)
          .indexOf(userId.value) >= 0,
      );
    }
  }, [bazaarProject, members, identity, userId.value]);

  const handleMembersClick = async () => {
    if (userId.value) {
      if (!isMember) {
        await bazaarApi.addMember(bazaarProject?.id!, userId.value);
      } else {
        await bazaarApi.deleteMember(bazaarProject!.id, userId.value);
      }
      setIsMember(!isMember);
      fetchMembers();
    }
  };

  const links: IconLinkVerticalProps[] = [
    {
      label: 'Entity page',
      icon: <RiDashboardLine size={20} />,
      disabled: true,
    },
    {
      label: 'Unlink project',
      icon: <RiLinkUnlink2Line size={20} />,
      disabled: false,
      onClick: () => {
        setOpenUnlink(true);
      },
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
      href: bazaarProject?.community,
      disabled: bazaarProject?.community === '' || !isMember,
    },
    {
      label: 'Docs',
      icon: <RiFileTextLine size={20} />,
      href: bazaarProject?.docs,
      disabled: bazaarProject?.docs === null || bazaarProject?.docs === '',
    },
  ];

  const handleEditClose = () => {
    setOpenEdit(false);
  };

  const handleUnlinkClose = () => {
    setOpenUnlink(false);
  };

  const handleUnlinkSubmit = async () => {
    const updateResponse = await bazaarApi.updateProject({
      ...bazaarProject,
      entityRef: null,
    });

    if (updateResponse.status === 'ok') {
      handleUnlinkClose();
      fetchBazaarProject();
    }
  };

  if (members.error) {
    return <Alert severity="error">{members?.error?.message}</Alert>;
  }

  if (bazaarProject) {
    return (
      <div>
        <EditProjectDialog
          bazaarProject={bazaarProject!}
          openEdit={openEdit}
          handleEditClose={handleEditClose}
          fetchBazaarProject={fetchBazaarProject}
        />

        {openUnlink && (
          <ConfirmationDialog
            open={openUnlink}
            handleClose={handleUnlinkClose}
            message={[
              'Are you sure you want to unlink ',
              <b className={styles.wordBreak}>
                {parseEntityRef(bazaarProject.entityRef!).name}
              </b>,
              ' from ',
              <b className={styles.wordBreak}>{bazaarProject.title}</b>,
              ' ?',
            ]}
            type="unlink"
            handleSubmit={handleUnlinkSubmit}
          />
        )}

        <div className={styles.cardHeader}>
          <div className={styles.headerMain}>
            <Text className={styles.wordBreak}>{bazaarProject?.title!}</Text>
            <HeaderIconLinkRow links={links} />
          </div>
          <div className={styles.headerAction}>
            <ButtonIcon
              aria-label="edit"
              icon={<RiEditLine size={16} />}
              variant="secondary"
              onPress={() => setOpenEdit(true)}
            />
          </div>
        </div>
        <hr className={styles.divider} />

        <CardContentFields
          bazaarProject={bazaarProject}
          members={members.value || []}
          descriptionSize={10}
          membersSize={2}
          isMember={isMember}
        />
      </div>
    );
  }
  return null;
};
