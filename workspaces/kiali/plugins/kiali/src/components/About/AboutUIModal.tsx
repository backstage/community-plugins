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
import type {
  ExternalServiceInfo,
  StatusMap,
} from '@backstage-community/plugin-kiali-common/types';
import { StatusKey } from '@backstage-community/plugin-kiali-common/types';
import { Link } from '@backstage/core-components';
import {
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { Alert } from '@material-ui/lab';
import { default as React } from 'react';
import { config, KialiIcon, KialiLogo } from '../../config';
import { kialiStyle } from '../../styles/StyleUtils';

type AboutUIModalProps = {
  status: StatusMap;
  externalServices: ExternalServiceInfo[];
  warningMessages: string[];
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
};

const iconStyle = kialiStyle({
  marginRight: '10px',
});

const textContentStyle = kialiStyle({
  $nest: {
    '& dt, & dd': {
      lineHeight: 1.667,
    },
  },
});

const closeButton = kialiStyle({
  position: 'absolute',
  right: 10,
  top: 10,
  float: 'right',
  padding: 0,
});

export const AboutUIModal = (props: AboutUIModalProps) => {
  const [showWarnings, setShowWarnings] = React.useState<boolean>(false);

  const additionalComponentInfoContent = (
    externalService: ExternalServiceInfo,
  ) => {
    if (!externalService.version && !externalService.url) {
      return 'N/A';
    }
    const version = externalService.version ? externalService.version : '';
    const url = externalService.url ? (
      <a href={externalService.url} target="_blank" rel="noopener noreferrer">
        {externalService.url}
      </a>
    ) : (
      ''
    );
    return (
      <>
        {version} {url}
      </>
    );
  };

  const renderComponent = (externalService: ExternalServiceInfo) => {
    const name = externalService.version
      ? externalService.name
      : `${externalService.name} URL`;
    const additionalInfo = additionalComponentInfoContent(externalService);
    return (
      <>
        <Grid item xs={8} key={`component_${name}`}>
          {name}
        </Grid>
        <Grid
          data-test={`${externalService.name}`}
          item
          xs={4}
          key={`component_version_${name}`}
        >
          {additionalInfo}
        </Grid>
      </>
    );
  };

  const renderWebsiteLink = () => {
    if (config.about?.website) {
      return (
        <Link to={config.about.website.url} style={{ color: '#2b9af3' }}>
          <KialiIcon.Website className={iconStyle} />
          {config.about.website.linkText}
        </Link>
      );
    }

    return null;
  };

  const renderProjectLink = () => {
    if (config.about?.project) {
      return (
        <Link to={config.about.project.url} style={{ color: '#2b9af3' }}>
          <KialiIcon.Repository className={iconStyle} />
          {config.about.project.linkText}
        </Link>
      );
    }

    return null;
  };

  const coreVersion =
    props.status[StatusKey.KIALI_CORE_COMMIT_HASH] === '' ||
    props.status[StatusKey.KIALI_CORE_COMMIT_HASH] === 'unknown'
      ? props.status[StatusKey.KIALI_CORE_VERSION]
      : `${props.status[StatusKey.KIALI_CORE_VERSION]} (${
          props.status[StatusKey.KIALI_CORE_COMMIT_HASH]
        })`;
  const containerVersion = props.status[StatusKey.KIALI_CONTAINER_VERSION];
  const meshVersion = props.status[StatusKey.MESH_NAME]
    ? `${props.status[StatusKey.MESH_NAME]} ${
        props.status[StatusKey.MESH_VERSION] || ''
      }`
    : 'Unknown';
  const kialiExternalUrl = props.status[StatusKey.KIALI_EXTERNAL_URL];

  return (
    <Dialog
      open={props.showModal}
      onClose={() => props.setShowModal(false)}
      aria-labelledby="Kiali"
      aria-describedby="Kiali"
      fullWidth
    >
      <DialogTitle style={{ backgroundColor: '#030303' }}>
        <KialiLogo />
        <IconButton
          onClick={() => props.setShowModal(false)}
          className={closeButton}
        >
          <CloseIcon style={{ color: 'white', float: 'right' }} />
        </IconButton>
      </DialogTitle>
      <DialogContent style={{ backgroundColor: '#030303', color: 'white' }}>
        <Typography className={textContentStyle}>
          <Typography variant="h4">Kiali</Typography>
          <Grid container>
            <Grid item xs={4}>
              Kiali
            </Grid>
            <Grid item xs={8} data-test="Kiali">
              {coreVersion || 'Unknown'}
            </Grid>
            <Grid item xs={4}>
              Kiali Container
            </Grid>
            <Grid item xs={8} data-test="Kiali container">
              {containerVersion || 'Unknown'}
            </Grid>
            <Grid item xs={4}>
              Service Mesh
            </Grid>
            <Grid item xs={8} data-test="Service Mesh">
              {meshVersion || 'Unknown'}
            </Grid>
            <Grid item xs={4}>
              Kiali External URL
            </Grid>
            <Grid item xs={8}>
              {kialiExternalUrl}
            </Grid>
          </Grid>
        </Typography>
        {props.warningMessages.length > 0 && (
          <Card style={{ margin: '20px' }}>
            <CardHeader
              title={
                <Typography>
                  {props.warningMessages.length} warnings.{' '}
                  <Link
                    to=""
                    onClick={() => setShowWarnings(!showWarnings)}
                    style={{ color: '#2b9af3' }}
                  >
                    ({showWarnings ? 'Close' : 'See'} them)
                  </Link>
                </Typography>
              }
            />
            <CardContent>
              <Collapse in={showWarnings}>
                {props.warningMessages.map(warn => (
                  <Alert
                    key={`warning_msg_${warn.concat('_')}`}
                    severity="warning"
                    style={{ marginTop: '1em' }}
                  >
                    {warn}
                  </Alert>
                ))}
              </Collapse>
            </CardContent>
          </Card>
        )}
        <Typography className={textContentStyle}>
          <Typography variant="h6">Components</Typography>
          <Grid container>{props?.externalServices.map(renderComponent)}</Grid>
        </Typography>
      </DialogContent>
      <DialogActions style={{ backgroundColor: '#030303', display: 'block' }}>
        {renderWebsiteLink()}
        {renderProjectLink()}
      </DialogActions>
    </Dialog>
  );
};
