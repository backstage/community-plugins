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
  console.log(participants);
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
