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
import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Content, Page, ContentHeader } from '@backstage/core-components';
import { Wheel } from '../../components/Wheel';
import { Participants } from '../../components/Participants';

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

export const WheelOfNamesPage = () => {
  const classes = useStyles();
  const [participants, setParticipants] = useState<
    Array<{ id: string; name: string }>
  >([]);
  return (
    <Page themeId="tool">
      <Content>
        <ContentHeader title="Wheel of Names" />
        <div className={classes.contentDescription}>
          Spin the wheel to randomly select a team member. Perfect for choosing
          who goes first in meetings, who brings snacks next time, or any other
          fun team decisions!
        </div>
        <div className={classes.container}>
          <div className={classes.leftColumn}>
            <Participants onParticipantsChange={setParticipants} />
          </div>
          <div className={classes.rightColumn}>
            {participants.length > 0 && <Wheel participants={participants} />}
          </div>
        </div>
      </Content>
    </Page>
  );
};
