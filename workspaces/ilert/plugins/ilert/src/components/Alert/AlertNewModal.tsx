/*
 * Copyright 2026 The Backstage Authors
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
import { DEFAULT_NAMESPACE, parseEntityRef } from '@backstage/catalog-model';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import { toastApiRef } from '@backstage/frontend-plugin-api';
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  Text,
} from '@backstage/ui';
import { ilertApiRef } from '../../api';
import { useNewAlert } from '../../hooks/useNewAlert';
import { AlertSource } from '../../types';
import styles from './AlertNewModal.module.css';

export const AlertNewModal = ({
  isModalOpened,
  setIsModalOpened,
  refetchAlerts,
  initialAlertSource,
  entityName,
}: {
  isModalOpened: boolean;
  setIsModalOpened: (open: boolean) => void;
  refetchAlerts: () => void;
  initialAlertSource?: AlertSource | null;
  entityName?: string;
}) => {
  const [
    { alertSources, alertSource, summary, details, isLoading },
    { setAlertSource, setSummary, setDetails, setIsLoading },
  ] = useNewAlert(isModalOpened, initialAlertSource);
  const ilertApi = useApi(ilertApiRef);
  const alertApi = useApi(toastApiRef);
  const identityApi = useApi(identityApiRef);
  const source = window.location.toString();

  const handleClose = () => {
    setIsModalOpened(false);
  };

  let integrationKey = '';
  if (initialAlertSource && initialAlertSource.integrationKey) {
    integrationKey = initialAlertSource.integrationKey;
  } else if (alertSource && alertSource.integrationKey) {
    integrationKey = alertSource.integrationKey;
  }
  const handleCreate = () => {
    if (!integrationKey) {
      return;
    }
    setIsLoading(true);
    setTimeout(async () => {
      try {
        const { userEntityRef } = await identityApi.getBackstageIdentity();
        const { name: userName } = parseEntityRef(userEntityRef, {
          defaultKind: 'User',
          defaultNamespace: DEFAULT_NAMESPACE,
        });
        await ilertApi.createAlert({
          integrationKey,
          summary,
          details,
          userName,
          source,
        });
        alertApi.post({ title: 'Alert created.' });
        refetchAlerts();
      } catch (err) {
        alertApi.post({ title: err, status: 'danger' });
      }
      setIsModalOpened(false);
    }, 250);
  };

  const canCreate = !!integrationKey && !!summary;

  return (
    <DialogTrigger isOpen={isModalOpened} onOpenChange={setIsModalOpened}>
      <Dialog>
        <DialogHeader>
          {entityName ? (
            <div>
              This action will trigger an alert for{' '}
              <strong>{entityName}</strong>.
            </div>
          ) : (
            'New alert'
          )}
        </DialogHeader>
        <DialogBody>
          <div
            style={{
              backgroundColor: 'var(--bui-bg-surface-secondary)',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '16px',
            }}
          >
            <Text variant="body-medium">
              Please describe the problem you want to report. Be as descriptive
              as possible. Your signed in user and a reference to the current
              page will automatically be amended to the alarm so that the
              receiver can reach out to you if necessary.
            </Text>
          </div>
          {!initialAlertSource ? (
            <div className={styles.formControl}>
              <label htmlFor="alert-source-select" className={styles.label}>
                Alert Source
              </label>
              <div className={styles.selectContainer}>
                <select
                  id="alert-source-select"
                  disabled={isLoading}
                  value={alertSource?.id || ''}
                  onChange={e => {
                    const selected = alertSources.find(
                      s => s.id === Number(e.target.value),
                    );
                    if (selected) setAlertSource(selected);
                  }}
                  className={styles.select}
                >
                  <option value="">Select an alert source...</option>
                  {alertSources.map(alertSrc => (
                    <option key={alertSrc.id} value={alertSrc.id}>
                      {alertSrc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}
          <div className={styles.formControl}>
            <label htmlFor="summary-input" className={styles.label}>
              Summary
            </label>
            <input
              id="summary-input"
              disabled={isLoading}
              type="text"
              placeholder="Summary"
              className={styles.textInput}
              value={summary}
              onChange={e => setSummary(e.target.value)}
            />
          </div>
          <div className={styles.formControl}>
            <label htmlFor="details-textarea" className={styles.label}>
              Details
            </label>
            <textarea
              id="details-textarea"
              disabled={isLoading}
              placeholder="Details"
              rows={4}
              className={styles.textarea}
              value={details}
              onChange={e => setDetails(e.target.value)}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            isDisabled={!canCreate || isLoading}
            onPress={handleCreate}
            variant="primary"
          >
            Create
          </Button>
          <Button onPress={handleClose} variant="secondary" slot="close">
            Cancel
          </Button>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
};
