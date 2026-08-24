/*
 * Copyright 2020 The Backstage Authors
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
import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogBody,
  DialogFooter,
  TextField,
  Button,
  Text,
  Box,
  Flex,
} from '@backstage/ui';
import useAsyncFn from 'react-use/esm/useAsyncFn';
import { splunkOnCallApiRef } from '../../api';
import { TriggerAlarmRequest } from '../../api';
import { useApi } from '@backstage/core-plugin-api';
import { toastApiRef } from '@backstage/frontend-plugin-api';
import styles from './TriggerDialog.module.css';

type Props = {
  routingKey: string;
  showDialog: boolean;
  handleDialog: () => void;
  onIncidentCreated: () => void;
};

export const TriggerDialog = ({
  routingKey,
  showDialog,
  handleDialog,
  onIncidentCreated,
}: Props) => {
  const toastApi = useApi(toastApiRef);
  const api = useApi(splunkOnCallApiRef);

  const [incidentType, setIncidentType] = useState<string>('');
  const [incidentId, setIncidentId] = useState<string>();
  const [incidentDisplayName, setIncidentDisplayName] = useState<string>('');
  const [incidentMessage, setIncidentMessage] = useState<string>('');
  const [incidentStartTime, setIncidentStartTime] = useState<number>();

  const [
    { value, loading: triggerLoading, error: triggerError },
    handleTriggerAlarm,
  ] = useAsyncFn(
    async (params: TriggerAlarmRequest) => await api.incidentAction(params),
  );

  const handleIncidentType = (type: string) => {
    setIncidentType(type);
  };

  const handleIncidentId = (id: string) => {
    setIncidentId(id);
  };

  const handleIncidentDisplayName = (displayName: string) => {
    setIncidentDisplayName(displayName);
  };

  const handleIncidentMessage = (message: string) => {
    setIncidentMessage(message);
  };

  const handleIncidentStartTime = (e: { target: { value: string } }) => {
    const dateTime = new Date(e.target.value).getTime();
    const dateTimeInSeconds = Math.floor(dateTime / 1000);
    setIncidentStartTime(dateTimeInSeconds);
  };

  useEffect(() => {
    if (value) {
      toastApi.post({
        title: `Alarm successfully triggered`,
      });
      onIncidentCreated();
      handleDialog();
    }
  }, [value, toastApi, handleDialog, onIncidentCreated]);

  if (triggerError) {
    toastApi.post({
      title: `Failed to trigger alarm. ${triggerError.message}`,
      status: 'danger',
    });
  }

  return (
    <DialogTrigger>
      <Dialog
        isOpen={showDialog}
        onOpenChange={open => !open && handleDialog()}
      >
        <DialogHeader>This action will trigger an incident</DialogHeader>
        <DialogBody>
          <Text
            variant="title-small"
            style={{ marginBottom: 'var(--bui-space-2)' }}
          >
            Created by: <b>"REST" Endpoint</b>
          </Text>
          <Box
            style={{
              backgroundColor: 'var(--bui-bg-surface-2)',
              padding: 'var(--bui-space-3)',
              borderRadius: 'var(--bui-radius-1)',
              marginBottom: 'var(--bui-space-3)',
            }}
          >
            <Text variant="body-medium">
              If the issue you are seeing does not need urgent attention, please
              get in touch with the responsible team using their preferred
              communications channel. You can find information about the owner
              of this entity in the "About" card. If the issue is urgent, please
              don't hesitate to trigger the alert.
            </Text>
          </Box>
          <Text
            variant="body-medium"
            style={{ marginBottom: 'var(--bui-space-3)' }}
          >
            Please describe the problem you want to report. Be as descriptive as
            possible. <br />
            Note that only the <b>Incident type</b>,{' '}
            <b>Incident display name</b> and the <b>Incident message</b> fields
            are <b>required</b>.
          </Text>
          <Flex
            className={styles.formControl}
            style={{ gap: 'var(--bui-space-3)' }}
          >
            <Box className={styles.formHeader} style={{ flex: 1 }}>
              <label
                htmlFor="incident-type"
                style={{
                  display: 'block',
                  marginBottom: 'var(--bui-space-1)',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                Incident type
              </label>
              <select
                id="incident-type"
                value={incidentType}
                onChange={e => handleIncidentType(e.target.value)}
                data-testid="trigger-incident-type"
                style={{
                  width: '100%',
                  padding: 'var(--bui-space-2)',
                  borderRadius: 'var(--bui-radius-1)',
                  border: '1px solid var(--bui-border-1)',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                }}
              >
                <option value="">Select incident type</option>
                <option value="CRITICAL">Critical</option>
                <option value="WARNING">Warning</option>
                <option value="INFO">Info</option>
              </select>
            </Box>
            <Box className={styles.formHeader} style={{ flex: 1 }}>
              <label
                htmlFor="datetime-local"
                style={{
                  display: 'block',
                  marginBottom: 'var(--bui-space-1)',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                Incident start time
              </label>
              <input
                id="datetime-local"
                type="datetime-local"
                onChange={handleIncidentStartTime}
                style={{
                  width: '100%',
                  padding: 'var(--bui-space-2)',
                  borderRadius: 'var(--bui-radius-1)',
                  border: '1px solid var(--bui-border-1)',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                }}
              />
            </Box>
          </Flex>
          <TextField
            data-testid="trigger-incident-id"
            id="incident-id"
            label="Incident id"
            onChange={handleIncidentId}
            style={{ marginBottom: 'var(--bui-space-3)' }}
          />
          <TextField
            isRequired
            data-testid="trigger-incident-displayName"
            id="incident-displayName"
            label="Incident display name"
            onChange={handleIncidentDisplayName}
            style={{ marginBottom: 'var(--bui-space-3)' }}
          />
          <div style={{ marginBottom: 'var(--bui-space-3)' }}>
            <label
              htmlFor="incident-message-area"
              style={{
                display: 'block',
                marginBottom: 'var(--bui-space-1)',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Incident message{' '}
              <Text
                as="span"
                style={{ color: 'var(--bui-semantic-intent-danger)' }}
              >
                *
              </Text>
            </label>
            <textarea
              id="incident-message-area"
              data-testid="trigger-incident-message"
              value={incidentMessage}
              onChange={e => handleIncidentMessage(e.target.value)}
              placeholder="Describe the incident..."
              required
              style={{
                width: '100%',
                minHeight: '100px',
                padding: 'var(--bui-space-2)',
                borderRadius: 'var(--bui-radius-1)',
                border: '1px solid var(--bui-border-1)',
                fontFamily: 'inherit',
                fontSize: 'inherit',
              }}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            data-testid="trigger-button"
            id="trigger"
            variant="primary"
            isDisabled={
              !incidentType.length ||
              !incidentDisplayName ||
              !incidentMessage ||
              triggerLoading
            }
            onClick={() =>
              handleTriggerAlarm({
                routingKey,
                incidentType,
                incidentDisplayName,
                incidentMessage,
                ...(incidentId ? { incidentId } : {}),
                ...(incidentStartTime ? { incidentStartTime } : {}),
              } as TriggerAlarmRequest)
            }
          >
            {triggerLoading ? 'Creating...' : 'Trigger Incident'}
          </Button>
          <Button
            id="close"
            variant="secondary"
            slot="close"
            onClick={handleDialog}
          >
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
};
