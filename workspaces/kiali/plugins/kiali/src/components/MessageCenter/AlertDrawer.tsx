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
import {
  NotificationGroup,
  NotificationMessage,
} from '@backstage-community/plugin-kiali-common/types';
import { ItemCardHeader } from '@backstage/core-components';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  CardContent,
  CardMedia,
  Typography,
} from '@material-ui/core';
import ExpandMoreRounded from '@material-ui/icons/ExpandMoreRounded';
import { InfoIcon } from '@patternfly/react-icons';
import { default as React } from 'react';
import { KialiAppAction } from '../../actions/KialiAppAction';
import { MessageCenterState } from '../../store';
import { kialiStyle } from '../../styles/StyleUtils';
import { AlertDrawerGroup } from './AlertDrawerGroup';

type AlertDrawerProps = {
  toggleDrawer: (isOpen: boolean) => void;
  messages: MessageCenterState;
  messageDispatch: React.Dispatch<KialiAppAction>;
};

const hideGroup = (group: NotificationGroup): boolean => {
  return group.hideIfEmpty && group.messages.length === 0;
};

const getUnreadCount = (messages: NotificationMessage[]) => {
  return messages.reduce((count, message) => {
    return message.seen ? count : count + 1;
  }, 0);
};

const getUnreadMessageLabel = (messages: NotificationMessage[]) => {
  const unreadCount = getUnreadCount(messages);
  return unreadCount === 1
    ? '1 Unread Message'
    : `${getUnreadCount(messages)} Unread Messages`;
};

const drawer = kialiStyle({
  display: 'flex',
  width: '500px',
  justifyContent: 'space-between',
});

const noNotificationsMessage = (
  <>
    <InfoIcon />
    No Messages Available
  </>
);

export const AlertDrawer = (props: AlertDrawerProps) => {
  return (
    <Card className={drawer} data-test="message-center-modal">
      <CardMedia>
        <ItemCardHeader title="MessageCenter" subtitle="" />
      </CardMedia>
      <CardContent>
        {props.messages.groups.length === 0
          ? noNotificationsMessage
          : props.messages.groups.map(group =>
              hideGroup(group) ? null : (
                <Accordion elevation={0}>
                  <AccordionSummary
                    key={`${group.id}_item`}
                    expandIcon={<ExpandMoreRounded />}
                    data-test="message-center-summary"
                  >
                    <Typography>
                      {group.title} {getUnreadMessageLabel(group.messages)}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <AlertDrawerGroup key={group.id} group={group} />
                  </AccordionDetails>
                </Accordion>
              ),
            )}
      </CardContent>
    </Card>
  );
};
