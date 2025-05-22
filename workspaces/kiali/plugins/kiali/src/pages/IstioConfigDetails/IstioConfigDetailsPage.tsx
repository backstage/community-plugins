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
import { IstioConfigDetails } from '@backstage-community/plugin-kiali-common/types';
import { Content } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { Grid } from '@material-ui/core';
import jsYaml from 'js-yaml';
import { default as React } from 'react';
import AceEditor from 'react-ace';
import { useLocation } from 'react-router-dom';
import {
  BreadcrumbView,
  getPath,
} from '../../components/BreadcrumbView/BreadcrumbView';
import { DefaultSecondaryMasthead } from '../../components/DefaultSecondaryMasthead/DefaultSecondaryMasthead';
import { kialiApiRef } from '../../services/Api';
import { KialiAppState, KialiContext } from '../../store';
import { baseStyle } from '../../styles/StyleUtils';
import { getIstioObject } from '../../utils/IstioConfigUtils';
// Enables ACE editor YAML themes
import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/theme-eclipse';
import 'ace-builds/src-noconflict/theme-twilight';
import { parseKialiValidations } from '@backstage-community/plugin-kiali-common/func';
import type { AceValidations } from '@backstage-community/plugin-kiali-common/types';
import { useTheme } from '@material-ui/core/styles';
import { useCallback, useEffect } from 'react';
import { IstioConfigDetailsOverview } from './IstioConfigDetailsOverview';

export const IstioConfigDetailsPage = (props: {
  entity?: boolean;
}): React.JSX.Element => {
  const path = getPath(useLocation());
  const namespace = path.namespace;
  const object = path.item;
  const objectType = path.istioType;

  const kialiClient = useApi(kialiApiRef);
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const [istioConfig, setIstioConfig] = React.useState<IstioConfigDetails>();

  const fetchIstioConfig = useCallback(() => {
    if (!namespace || !objectType || !object) {
      kialiState.alertUtils!.add(
        `Could not fetch Istio Config: Empty namespace, object type or object name`,
      );
      return;
    }

    kialiClient
      .getIstioConfigDetail(namespace, objectType, object, true)
      .then((istioConfigResponse: IstioConfigDetails) => {
        setIstioConfig(istioConfigResponse);
      });
  }, [kialiClient, kialiState.alertUtils, namespace, objectType, object]);

  useEffect(() => {
    fetchIstioConfig();
  }, [fetchIstioConfig, namespace, objectType, object]);

  const fetchYaml = () => {
    const safeDumpOptions = {
      styles: {
        '!!null': 'canonical', // dump null as ~
      },
    };

    const istioObject = getIstioObject(istioConfig);
    return istioObject ? jsYaml.dump(istioObject, safeDumpOptions) : '';
  };

  let editorValidations: AceValidations = {
    markers: [],
    annotations: [],
  };
  const yamlSource = fetchYaml();
  const editorStyle = { border: '1px solid #dcdcdc' };

  const useDefaultTheme = (): string => {
    const muiTheme = useTheme();
    if (muiTheme.palette.type === 'light') {
      return 'eclipse';
    }
    return 'twilight';
  };

  editorValidations = parseKialiValidations(
    yamlSource,
    istioConfig?.validation,
  );

  return (
    <div className={baseStyle}>
      <Content>
        <BreadcrumbView entity={props.entity} />
        <DefaultSecondaryMasthead
          elements={[]}
          onRefresh={() => fetchIstioConfig()}
        />
        <Grid container>
          <Grid item xs={9} style={{ paddingTop: 0 }}>
            <AceEditor
              mode="yaml"
              setOptions={{ useWorker: false }}
              theme={useDefaultTheme()}
              fontSize={14}
              width="100%"
              showGutter
              readOnly
              wrapEnabled
              value={yamlSource}
              annotations={editorValidations.annotations}
              markers={editorValidations.markers}
              style={editorStyle}
            />
          </Grid>
          <Grid xs={3}>
            {istioConfig && <IstioConfigDetailsOverview {...istioConfig} />}
          </Grid>
        </Grid>
      </Content>
    </div>
  );
};
