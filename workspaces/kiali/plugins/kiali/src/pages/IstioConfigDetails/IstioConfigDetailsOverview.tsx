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
  IstioConfigDetails,
  ObjectReference,
  ServiceReference,
  ValidationMessage,
  ValidationTypes,
  WorkloadReference,
} from '@backstage-community/plugin-kiali-common/types';
import {
  Card,
  CardContent,
  List,
  ListItem,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { default as React } from 'react';
import { HistoryManager } from '../../app/History';
import { Labels } from '../../components/Label/Labels';
import { PFBadge } from '../../components/Pf/PfBadges';
import { LocalTime } from '../../components/Time/LocalTime';
import { ValidationObjectSummary } from '../../components/Validations/ValidationObjectSummary';
import { GVKToBadge } from '../../components/VirtualList/Config';
import { KialiIcon } from '../../config';
import { kialiStyle } from '../../styles/StyleUtils';
import {
  getGVKTypeString,
  getIstioObject,
  getIstioObjectGVK,
  getReconciliationCondition,
} from '../../utils/IstioConfigUtils';
import { IstioConfigReferences } from './IstioConfigReferences';
import { IstioConfigValidationReferences } from './IstioConfigValidationReferences';
import { IstioStatusMessageList } from './IstioStatusMessageList';

export const IstioConfigDetailsOverview = (
  istioConfigDetails: IstioConfigDetails,
): React.JSX.Element => {
  const istioObject = getIstioObject(istioConfigDetails);
  const istioValidations = istioConfigDetails.validation;
  const statusMessages: ValidationMessage[] | undefined =
    istioObject?.status?.validationMessages;
  const cluster = HistoryManager.getClusterName();

  const objectReferences = (): ObjectReference[] => {
    const details: IstioConfigDetails =
      istioConfigDetails ?? ({} as IstioConfigDetails);
    return details.references?.objectReferences ?? ([] as ObjectReference[]);
  };

  const serviceReferences = (): ServiceReference[] => {
    const details: IstioConfigDetails =
      istioConfigDetails ?? ({} as IstioConfigDetails);
    return details.references?.serviceReferences ?? ([] as ServiceReference[]);
  };

  const workloadReferences = (): WorkloadReference[] => {
    const details: IstioConfigDetails =
      istioConfigDetails ?? ({} as IstioConfigDetails);
    return (
      details.references?.workloadReferences ?? ([] as WorkloadReference[])
    );
  };

  const infoStyle = kialiStyle({
    marginLeft: '0.5rem',
    verticalAlign: '-0.06em !important',
  });

  const healthIconStyle = kialiStyle({
    marginLeft: '0.5rem',
    verticalAlign: '-0.06em !important',
  });

  const resourceListStyle = kialiStyle({
    $nest: {
      '& > ul > li > span': {
        float: 'left',
        width: '125px',
        fontWeight: 700,
      },
    },
  });
  const resourceProperties = (
    <div key="properties-list" className={resourceListStyle}>
      <ul style={{ listStyleType: 'none' }}>
        {istioObject && istioObject.metadata.creationTimestamp && (
          <li>
            <span>Created</span>

            <div style={{ display: 'inline-block' }}>
              <LocalTime time={istioObject.metadata.creationTimestamp} />
            </div>
          </li>
        )}

        {istioObject && istioObject.metadata.resourceVersion && (
          <li>
            <span>Version</span>
            {istioObject.metadata.resourceVersion}
          </li>
        )}
      </ul>
    </div>
  );

  const configurationHasWarnings = (): boolean | undefined => {
    return istioValidations?.checks.some(check => {
      return check.severity === ValidationTypes.Warning;
    });
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h4" gutterBottom>
          Istio Config
        </Typography>

        {istioObject && istioObject.kind && (
          <PFBadge
            badge={
              GVKToBadge[
                getGVKTypeString(
                  getIstioObjectGVK(istioObject.apiVersion, istioObject.kind),
                )
              ]
            }
          />
        )}

        {istioObject?.metadata.name}

        <Tooltip placement="right" title={resourceProperties}>
          <span>
            <KialiIcon.Info className={infoStyle} />
          </span>
        </Tooltip>

        {istioValidations &&
          (!statusMessages || statusMessages.length === 0) &&
          (!istioValidations.checks ||
            istioValidations.checks.length === 0) && (
            <span className={healthIconStyle}>
              <ValidationObjectSummary
                id="config-validation"
                validations={[istioValidations]}
                reconciledCondition={getReconciliationCondition(
                  istioConfigDetails,
                )}
              />
            </span>
          )}

        {istioObject?.metadata.labels && (
          <List style={{ paddingTop: 20 }}>
            <ListItem style={{ padding: 0 }}>
              <Labels
                tooltipMessage="Labels defined on this resource"
                labels={istioObject?.metadata.labels}
              />
            </ListItem>
          </List>
        )}

        {((statusMessages && statusMessages.length > 0) ||
          (istioValidations &&
            istioValidations.checks &&
            istioValidations.checks.length > 0)) && (
          <IstioStatusMessageList
            messages={statusMessages}
            checks={istioValidations?.checks}
          />
        )}

        {istioValidations?.references && (
          <IstioConfigValidationReferences
            objectReferences={istioValidations.references}
            cluster={cluster}
          />
        )}

        {istioValidations?.valid && !configurationHasWarnings() && (
          <IstioConfigReferences
            objectReferences={objectReferences()}
            serviceReferences={serviceReferences()}
            workloadReferences={workloadReferences()}
            isValid={istioValidations?.valid}
            cluster={cluster}
          />
        )}
      </CardContent>
    </Card>
  );
};
