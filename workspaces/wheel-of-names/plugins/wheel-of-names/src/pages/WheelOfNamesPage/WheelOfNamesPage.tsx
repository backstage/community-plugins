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
import React, { useState, useEffect, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Content, Page, ContentHeader } from '@backstage/core-components';
import { Wheel } from '../../components/Wheel';
import { Participants } from '../../components/Participants';
import { useSearchParams } from 'react-router-dom';
import { EntityService } from '../../components/Participants/Service';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { useApi } from '@backstage/core-plugin-api';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing(4),
  },
  description: {
    textAlign: 'center',
    maxWidth: '600px',
    marginBottom: theme.spacing(4),
  },
  leftColumn: {
    flex: 1,
    maxWidth: '33%',
  },
  rightColumn: {
    flex: 2,
    maxWidth: '67%',
    display: 'flex',
    justifyContent: 'center',
  },
  contentDescription: {
    maxWidth: '600px',
    marginBottom: theme.spacing(4),
  },
}));

export interface Participant {
  id: string;
  name: string;
  displayName?: string;
  fromGroup?: string;
}

export const WheelOfNamesPage = () => {
  const classes = useStyles();
  const [searchParams] = useSearchParams();
  const catalogApi = useApi(catalogApiRef);
  const entityService = useMemo(
    () => new EntityService(catalogApi),
    [catalogApi],
  );

  const [participants, setParticipants] = useState<
    Array<{ id: string; name: string }>
  >([]);

  const [isLoading, setIsLoading] = useState(false);

  const [hasLoadedFromUrl, setHasLoadedFromUrl] = useState(false);

  // Load participants from URL group parameters on mount
  useEffect(() => {
    if (hasLoadedFromUrl) return;

    const loadInitialParticipants = async () => {
      // Extract group parameters from URL
      const groupParam = searchParams.get('group');
      const groupsParam = searchParams.get('groups');

      if (!groupParam && !groupsParam) return;

      setIsLoading(true);
      try {
        if (groupParam) {
          // Load group members
          const groupMembers = await entityService.fetchGroupMembers(
            groupParam,
          );
          const groupParticipants = groupMembers.map(member => ({
            id: member.metadata.uid!,
            name: member.metadata.name,
            displayName:
              (member.spec as any)?.profile?.displayName ||
              member.metadata.title ||
              member.metadata.name,
            fromGroup: groupParam,
          }));
          setParticipants(groupParticipants);
        } else if (groupsParam) {
          // Load multiple groups
          const groupNames = groupsParam.split(',');
          const allParticipants: Participant[] = [];
          for (const groupName of groupNames) {
            const groupMembers = await entityService.fetchGroupMembers(
              groupName.trim(),
            );
            const groupParticipants = groupMembers.map(member => ({
              id: member.metadata.uid!,
              name: member.metadata.name,
              displayName:
                (member.spec as any)?.profile?.displayName ||
                member.metadata.title ||
                member.metadata.name,
              fromGroup: groupName.trim(),
            }));
            allParticipants.push(...groupParticipants);
          }
          setParticipants(allParticipants);
        }
      } finally {
        setHasLoadedFromUrl(true);
        setIsLoading(false);
      }
    };

    loadInitialParticipants();
  }, [searchParams, entityService, hasLoadedFromUrl, catalogApi]);

  return (
    <Page themeId="tool">
      <Content>
        <ContentHeader title="Wheel of Names" />
        <div className={classes.contentDescription}>
          Spin the wheel to randomly select a team member. Perfect for choosing
          who goes first in meetings, who brings snacks next time, or any other
          fun team decisions!
        </div>
        {isLoading && <div>Loading participants...</div>}
        <div className={classes.container}>
          <div className={classes.leftColumn}>
            <Participants
              onParticipantsChange={setParticipants}
              initialParticipants={participants}
            />
          </div>
          <div className={classes.rightColumn}>
            {participants.length > 0 && <Wheel participants={participants} />}
          </div>
        </div>
      </Content>
    </Page>
  );
};
