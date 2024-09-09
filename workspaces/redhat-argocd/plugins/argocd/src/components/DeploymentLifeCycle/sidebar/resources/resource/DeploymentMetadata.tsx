import {
  Box,
  Card,
  CardContent,
  Link,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { useDrawerContext } from '../../../DrawerContext';
import { Resource } from '../../../../../types/application';
import { isAppHelmChartType, getCommitUrl } from '../../../../../utils/utils';
import { useEntity } from '@backstage/plugin-catalog-react';
import moment from 'moment';
import Metadata from '../../../../Common/Metadata';
import MetadataItem from '../../../../Common/MetadataItem';
import AppCommitLink from '../../../../Common/AppCommitLink';

const useDeploymentInfoStyles = makeStyles((theme: Theme) => ({
  latestDeploymentContainer: {
    marginBottom: theme.spacing(1),
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
  },
  deploymentHistory: {
    flex: 1,
    width: '400px',
    margin: 0,
    padding: '0',
    minHeight: 0,
    maxHeight: '200px',
    overflowY: 'auto',
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  commitMessage: {
    wordBreak: 'break-word',
  },
}));

const DeploymentMetadata = ({ resource }: { resource: Resource }) => {
  const { entity } = useEntity();
  const { application, latestRevision, revisionsMap, appHistory } =
    useDrawerContext();
  const classes = useDeploymentInfoStyles();

  const ImageLink = () => (
    <Link
      href={`https://${application?.status?.summary?.images?.[0]}`}
      target="_blank"
      rel="noopener"
    >
      {application?.status?.summary?.images?.[0].split('/').pop()}
    </Link>
  );
  const history = appHistory?.slice()?.reverse();
  return (
    <>
      <Metadata>
        <MetadataItem title="Namespace">{resource?.namespace}</MetadataItem>
        {appHistory.length > 0 ? (
          <MetadataItem title="Image">
            <ImageLink />
          </MetadataItem>
        ) : (
          <></>
        )}
        {!isAppHelmChartType(application) ? (
          <MetadataItem title="Commit">
            <AppCommitLink
              application={application}
              entity={entity}
              latestRevision={latestRevision}
              revisionsMap={revisionsMap}
            />
          </MetadataItem>
        ) : (
          <></>
        )}
      </Metadata>
      {appHistory.length > 0 && (
        <>
          <Typography color="textPrimary" variant="body1">
            Deployment history
          </Typography>
          <Box className={classes.deploymentHistory}>
            {history?.map(dep => {
              const annotations = entity?.metadata?.annotations ?? {};
              const commitUrl = application?.spec?.source?.repoURL
                ? getCommitUrl(
                    application.spec.source.repoURL,
                    dep?.revision,
                    annotations,
                  )
                : null;
              return (
                <Card
                  elevation={2}
                  key={dep.id}
                  style={{
                    margin: '1px',
                    padding: 0,
                    width: '50rem',
                    marginBottom: '5px',
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      className={classes.commitMessage}
                    >
                      {revisionsMap[dep.revision]?.message}{' '}
                      <Link
                        aria-disabled={!!commitUrl}
                        href={commitUrl ?? ''}
                        target="_blank"
                        rel="noopener"
                      >
                        {dep.revision.slice(0, 7)}
                      </Link>{' '}
                      deployed {moment(dep.deployedAt).local().fromNow()}
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </>
      )}
    </>
  );
};
export default DeploymentMetadata;
