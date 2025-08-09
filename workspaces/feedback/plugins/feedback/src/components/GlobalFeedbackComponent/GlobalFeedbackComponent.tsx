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
import { useEffect, useState } from 'react';

import '@one-platform/opc-feedback';

import {
  alertApiRef,
  configApiRef,
  useAnalytics,
  useApi,
} from '@backstage/core-plugin-api';

import { Entity, parseEntityRef } from '@backstage/catalog-model';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import Fab from '@mui/material/Fab';
import { DateTime } from 'luxon';
import useLocalStorage from 'react-use/lib/useLocalStorage';
import { FeedbackIcon } from '../..';
import { CreateFeedbackModal } from '../CreateFeedbackModal';

const KEY = 'feedbackPlugin.globalComponent';

export const GlobalFeedbackComponent = () => {
  const appConfig = useApi(configApiRef);

  const alertApi = useApi(alertApiRef);
  const catalog = useApi(catalogApiRef);
  const analytics = useAnalytics();

  const projectId = appConfig.getString('feedback.baseEntityRef');

  const [localConfig, setLocalConfig] = useLocalStorage<{
    projectId?: string;
    entity?: Entity;
    ttl?: number;
  }>(KEY, { projectId: projectId });

  const [modalOpen, setModalOpen] = useState(false);
  const handleModalClose = (respObj: { [key: string]: string } | false) => {
    setModalOpen(false);
    analytics.captureEvent('click', 'close - feedback modal');
    if (respObj) {
      if (respObj.error) {
        alertApi.post({
          message: respObj.error,
          severity: 'error',
          display: 'transient',
        });
      } else if (respObj.message) {
        alertApi.post({
          message: respObj.message,
          severity: 'success',
          display: 'transient',
        });
      }
    }
  };

  useEffect(() => {
    if (localConfig)
      if (
        DateTime.fromMillis(localConfig.ttl ?? 0)
          .diffNow()
          .toMillis() < -300000
      ) {
        catalog
          .getEntityByRef(projectId)
          .then(resp => {
            setLocalConfig({
              entity: resp,
              projectId: projectId,
              ttl: DateTime.now().toMillis(),
            });
            if (!resp) {
              alertApi.post({
                message: `Entity ${parseEntityRef(projectId).name} not found`,
                display: 'transient',
                severity: 'error',
              });
            }
          })
          .catch(err =>
            alertApi.post({
              message: err.message,
              display: 'transient',
              severity: 'error',
            }),
          );
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertApi, catalog, projectId]);

  return (
    <>
      {localConfig?.entity && (
        <CreateFeedbackModal
          open={modalOpen}
          handleModalCloseFn={handleModalClose}
          projectEntity={projectId}
          configType={
            localConfig.entity.metadata.annotations?.['feedback/type']
          }
        />
      )}
      <Fab
        variant="extended"
        color="primary"
        sx={{
          position: 'fixed',
          right: '-3.1rem',
          bottom: '8rem',
          rotate: '270deg',
          boxShadow: 3,
          borderRadius: '0',
          p: '0px 15px',
          textTransform: 'none',
          height: '35px',
          fontSize: '1rem',
        }}
        onClick={() => setModalOpen(true)}
      >
        <FeedbackIcon fontSize="medium" sx={{ mr: 1 }} />
        Feedback
      </Fab>
    </>
  );
};
