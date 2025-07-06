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
  NotificationMessage,
} from '@backstage-community/plugin-kiali-common/types';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  CardContent,
  Typography,
} from '@material-ui/core';
import ExpandMoreRounded from '@material-ui/icons/ExpandMoreRounded';
import moment from 'moment';
import { default as React } from 'react';
import { MessageCenterActions } from '../../actions/MessageCenterActions';
import { KialiIcon } from '../../config/KialiIcon';
import { KialiAppState, KialiContext } from '../../store';

const getIcon = (type: MessageType) => {
  switch (type) {
    case MessageType.ERROR:
      return <KialiIcon.Error />;
    case MessageType.INFO:
      return <KialiIcon.Info />;
    case MessageType.SUCCESS:
      return <KialiIcon.Ok />;
    case MessageType.WARNING:
      return <KialiIcon.Warning />;
    default:
      throw Error('Unexpected type');
  }
};

type AlertDrawerMessageProps = {
  message: NotificationMessage;
};

export const AlertDrawerMessage = (props: AlertDrawerMessageProps) => {
  const kialiState = React.useContext(KialiContext) as KialiAppState;

  // const markAsRead = (message: NotificationMessage) => kialiState.dispatch.messageDispatch(MessageCenterActions.markAsRead(message.id));
  const toggleMessageDetail = (message: NotificationMessage) =>
    kialiState.dispatch.messageDispatch(
      MessageCenterActions.toggleMessageDetail(message.id),
    );

  return (
    <Card>
      <CardContent data-test="drawer-message">
        {getIcon(props.message.type)}{' '}
        {props.message.seen ? (
          props.message.content
        ) : (
          <b>{props.message.content}</b>
        )}
        {props.message.detail && (
          <Accordion elevation={0}>
            <AccordionSummary
              style={{ flexDirection: 'row-reverse' }}
              onClick={() => toggleMessageDetail(props.message)}
              expandIcon={<ExpandMoreRounded />}
            >
              <Typography
                data-test={
                  props.message.showDetail
                    ? 'hide-message-detail'
                    : 'show-message-detail'
                }
              >
                {props.message.showDetail ? 'Hide Detail' : 'Show Detail'}
              </Typography>
            </AccordionSummary>
            <AccordionDetails data-test="message-detail">
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {props.message.detail}
              </pre>
            </AccordionDetails>
          </Accordion>
        )}
        {props.message.count > 1 && (
          <div>
            {props.message.count} {moment().from(props.message.firstTriggered)}
          </div>
        )}
        <div>
          <span style={{ float: 'left' }}>
            {props.message.created.toLocaleDateString()}
          </span>
          <span style={{ float: 'right' }}>
            {props.message.created.toLocaleTimeString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
