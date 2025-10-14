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
  ValidationTypes,
} from '@backstage-community/plugin-kiali-common/types';
import { Card, CardContent, CardHeader, Typography } from '@material-ui/core';
import { default as React } from 'react';
import { HistoryManager } from '../../app/History';
import { Labels } from '../../components/Label/Labels';
import { PFBadge, PFBadges } from '../../components/Pf/PfBadges';
import { ValidationObjectSummary } from '../../components/Validations/ValidationObjectSummary';
import { GVKToBadge } from '../../components/VirtualList/Config';
import { isMultiCluster } from '../../config';
import { cardsHeight, kialiStyle } from '../../styles/StyleUtils';
import {
  getGVKTypeString,
  getIstioObject,
  getIstioObjectGVK,
  getReconciliationCondition,
} from '../../utils/IstioConfigUtils';
import { IstioConfigReferences } from './IstioConfigReferences';
import { IstioConfigValidationReferences } from './IstioConfigValidationReferences';
import { IstioStatusMessageList } from './IstioStatusMessageList';

type IstioConfigDescriptionProps = {
  istioConfig?: IstioConfigDetails;
  view?: string;
};

const iconStyle = kialiStyle({
  display: 'inline-block',
});

const healthIconStyle = kialiStyle({
  marginLeft: '0.5rem',
  verticalAlign: '-0.075rem',
});

export const IstioConfigDescription: React.FC<IstioConfigDescriptionProps> = (
  props: IstioConfigDescriptionProps,
) => {
  const istioObject = props.istioConfig
    ? getIstioObject(props.istioConfig)
    : undefined;
  const istioValidations = props.istioConfig?.validation;
  const statusMessages = istioObject?.status?.validationMessages;
  const cluster = HistoryManager.getClusterName();

  const objectReferences = (): any[] => {
    const details: IstioConfigDetails =
      props.istioConfig ?? ({} as IstioConfigDetails);
    return details.references?.objectReferences ?? [];
  };

  const serviceReferences = (): any[] => {
    const details: IstioConfigDetails =
      props.istioConfig ?? ({} as IstioConfigDetails);
    return details.references?.serviceReferences ?? [];
  };

  const workloadReferences = (): any[] => {
    const details: IstioConfigDetails =
      props.istioConfig ?? ({} as IstioConfigDetails);
    return details.references?.workloadReferences ?? [];
  };

  const configurationHasWarnings = (): boolean | undefined => {
    return istioValidations?.checks.some(check => {
      return check.severity === ValidationTypes.Warning;
    });
  };

  return props.istioConfig ? (
    <Card
      id="IstioConfigDescriptionCard"
      data-test="istio-config-description-card"
      style={{ height: cardsHeight }}
    >
      <CardHeader
        title={
          <>
            <Typography variant="h6">
              <div key="istio-icon" className={iconStyle}>
                <PFBadge
                  badge={
                    istioObject && istioObject.kind
                      ? GVKToBadge[
                          getGVKTypeString(
                            getIstioObjectGVK(
                              istioObject.apiVersion,
                              istioObject.kind,
                            ),
                          )
                        ] || PFBadges.Unknown
                      : PFBadges.Unknown
                  }
                />
              </div>

              {istioObject?.metadata.name}

              {istioValidations &&
                (!statusMessages || statusMessages.length === 0) &&
                (!istioValidations.checks ||
                  istioValidations.checks.length === 0) && (
                  <span className={healthIconStyle}>
                    <ValidationObjectSummary
                      id="config-validation"
                      validations={[istioValidations]}
                      reconciledCondition={getReconciliationCondition(
                        props.istioConfig,
                      )}
                    />
                  </span>
                )}
            </Typography>

            {istioObject?.metadata.clusterName && isMultiCluster && (
              <div key="cluster-icon" style={{ paddingBottom: '0.5rem' }}>
                <PFBadge badge={PFBadges.Cluster} />{' '}
                {istioObject.metadata.clusterName}
              </div>
            )}
          </>
        }
      />
      <CardContent>
        {istioObject?.metadata.labels && (
          <Labels
            labels={istioObject.metadata.labels}
            tooltipMessage="Labels defined on this resource"
          />
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
            view={props.view}
          />
        )}

        {istioValidations?.valid && !configurationHasWarnings() && (
          <IstioConfigReferences
            objectReferences={objectReferences()}
            serviceReferences={serviceReferences()}
            workloadReferences={workloadReferences()}
            isValid={istioValidations?.valid}
            cluster={cluster}
            view={props.view}
          />
        )}
      </CardContent>
    </Card>
  ) : (
    <>Loading</>
  );
};
