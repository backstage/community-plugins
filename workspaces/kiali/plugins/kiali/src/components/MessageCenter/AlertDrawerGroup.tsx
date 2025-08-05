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
import { NotificationGroup } from '@backstage-community/plugin-kiali-common/types';
import { Button, Card, CardActions, CardContent } from '@material-ui/core';
import { InfoIcon } from '@patternfly/react-icons';
import { default as React } from 'react';
import { MessageCenterActions } from '../../actions';
import { KialiAppState, KialiContext } from '../../store';
import { AlertDrawerMessage } from './AlertDrawerMessage';

type AlertDrawerGroupProps = {
  group: NotificationGroup;
  reverseMessageOrder?: boolean;
};

const noNotificationsMessage = (
  <>
    <InfoIcon />
    No Messages Available
  </>
);

export const AlertDrawerGroup = (props: AlertDrawerGroupProps) => {
  const kialiState = React.useContext(KialiContext) as KialiAppState;

  const markGroupAsRead = (groupId: string) => {
    const foundGroup = kialiState.messageCenter.groups.find(
      group => group.id === groupId,
    );
    if (foundGroup) {
      kialiState.dispatch.messageDispatch(
        MessageCenterActions.markAsRead(
          foundGroup.messages.map(message => message.id),
        ),
      );
    }
  };

  const clearGroup = (groupId: string) => {
    const foundGroup = kialiState.messageCenter.groups.find(
      group => group.id === groupId,
    );
    if (foundGroup) {
      kialiState.dispatch.messageDispatch(
        MessageCenterActions.removeMessage(
          foundGroup.messages.map(message => message.id),
        ),
      );
    }
  };

  const getMessages = () => {
    return props.reverseMessageOrder
      ? [...props.group.messages].reverse()
      : props.group.messages;
  };

  const group: NotificationGroup = props.group;

  return (
    <Card elevation={0}>
      <CardContent
        style={{ paddingTop: 0 }}
        data-test="message-center-messages"
      >
        {group.messages.length === 0 && noNotificationsMessage}
        {getMessages().map(message => (
          <AlertDrawerMessage key={message.id} message={message} />
        ))}
      </CardContent>
      {group.showActions && group.messages.length > 0 && (
        <CardActions>
          <Button
            data-test="mark-as-read"
            variant="text"
            onClick={() => markGroupAsRead(group.id)}
          >
            Mark All Read
          </Button>
          <Button
            data-test="clear-all"
            variant="text"
            onClick={() => clearGroup(group.id)}
          >
            Clear All
          </Button>
        </CardActions>
      )}
    </Card>
  );
};
