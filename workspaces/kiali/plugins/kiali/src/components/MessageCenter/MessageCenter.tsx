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
  MessageType,
  NotificationGroup,
  NotificationMessage,
} from '@backstage-community/plugin-kiali-common/types';
import { Badge, Button, Drawer } from '@material-ui/core';
import { default as React } from 'react';
import { KialiIcon } from '../../config/KialiIcon';
import { KialiAppState, KialiContext } from '../../store';
import { kialiStyle } from '../../styles/StyleUtils';
import { AlertDrawer } from './AlertDrawer';

const bell = kialiStyle({
  position: 'relative',
  right: '5px',
  top: '5px',
});

const calculateMessageStatus = (state: KialiAppState) => {
  type MessageCenterTriggerPropsToMap = {
    newMessagesCount: number;
    badgeDanger: boolean;
    systemErrorsCount: number;
  };

  const dangerousMessageTypes = [MessageType.ERROR, MessageType.WARNING];
  let systemErrorsCount = 0;

  const systemErrorsGroup = state.messageCenter.groups.find(
    item => item.id === 'systemErrors',
  );
  if (systemErrorsGroup) {
    systemErrorsCount = systemErrorsGroup.messages.length;
  }

  return state.messageCenter.groups
    .reduce(
      (unreadMessages: NotificationMessage[], group: NotificationGroup) => {
        return unreadMessages.concat(
          group.messages.reduce(
            (
              unreadMessagesInGroup: NotificationMessage[],
              message: NotificationMessage,
            ) => {
              if (!message.seen) {
                unreadMessagesInGroup.push(message);
              }
              return unreadMessagesInGroup;
            },
            [],
          ),
        );
      },
      [],
    )
    .reduce(
      (
        propsToMap: MessageCenterTriggerPropsToMap,
        message: NotificationMessage,
      ) => {
        propsToMap.newMessagesCount++;
        propsToMap.badgeDanger =
          propsToMap.badgeDanger ||
          dangerousMessageTypes.includes(message.type);
        return propsToMap;
      },
      {
        newMessagesCount: 0,
        systemErrorsCount: systemErrorsCount,
        badgeDanger: false,
      },
    );
};

export const MessageCenter = (props: { color?: string }) => {
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const [isOpen, toggleDrawer] = React.useState(false);
  const messageCenterStatus = calculateMessageStatus(kialiState);
  /*
  const onDismiss = (message: NotificationMessage, userDismissed: boolean) => {
    if (userDismissed) {
      kialiState.messageDispatch(MessageCenterActions.markAsRead(message.id));
    } else {
      kialiState.messageDispatch(MessageCenterActions.hideNotification(message.id));
    }  
  }
  */
  return (
    <>
      <Button
        onClick={() => toggleDrawer(true)}
        style={{ marginTop: '-15px', color: 'white' }}
        data-test="message-center"
      >
        <Badge
          overlap="circular"
          badgeContent={
            messageCenterStatus.newMessagesCount > 0
              ? messageCenterStatus.newMessagesCount
              : undefined
          }
          color={messageCenterStatus.badgeDanger ? 'error' : 'primary'}
        >
          <KialiIcon.Bell className={bell} color={`${props.color}`} />
        </Badge>
      </Button>
      <Drawer anchor="right" open={isOpen} onClose={() => toggleDrawer(false)}>
        <AlertDrawer
          toggleDrawer={toggleDrawer}
          messages={kialiState.messageCenter}
          messageDispatch={kialiState.dispatch.messageDispatch}
        />
      </Drawer>
    </>
  );
};
