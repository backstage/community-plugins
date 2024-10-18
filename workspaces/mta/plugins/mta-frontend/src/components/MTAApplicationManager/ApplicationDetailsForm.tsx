import React, { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Grid,
  Typography,
  Link,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@material-ui/core';
import { Application, Identity, Ref } from '../../api/api';
import { LinkButton } from '@backstage/core-components';
import { useUpdateApplication } from '../../queries/mta';
import { catalogApiRef, useEntity } from '@backstage/plugin-catalog-react';
import { useApi } from '@backstage/core-plugin-api';

interface ApplicationDetailsFormProps {
  application: Application;
  identities: Identity[];
  isLoadingIdentities: boolean;
  setApplication: (application: Application) => void;
  setIsWaiting: (isWaiting: boolean) => void;
  isWaiting: boolean;
}

export const ApplicationDetailsForm = ({
  application,
  identities,
  setApplication,
  setIsWaiting,
  isWaiting,
}: ApplicationDetailsFormProps) => {
  const { entity } = useEntity();

  const catalogApi = useApi(catalogApiRef);

  const getDefaultIdentityValue = (appIdentities: Ref[], kind: string) => {
    const appIdentityRef = appIdentities?.find(appIdentity =>
      identities?.some(
        identity => identity.id === appIdentity.id && identity.kind === kind,
      ),
    );

    return appIdentityRef ? appIdentityRef.name : 'None';
  };

  // You'd have these kinds of checks or transformations in a useEffect or similar lifecycle method if the data isn't synchronous
  const defaultSourceIdentity = identities
    ? getDefaultIdentityValue(application.identities || [], 'source')
    : 'None';
  const defaultMavenIdentity = identities
    ? getDefaultIdentityValue(application.identities || [], 'maven')
    : 'None';

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    defaultValues: useMemo(() => {
      return {
        name: application.name,
        repositoryUrl: application?.repository?.url || '',
        sourceCredentials: defaultSourceIdentity,
        mavenCredentials: defaultMavenIdentity,
      };
    }, [application, defaultSourceIdentity, defaultMavenIdentity]),

    mode: 'onSubmit', // Validation will trigger on the change event with each input field
  });

  const sourceCredentials = watch('sourceCredentials');
  const mavenCredentials = watch('mavenCredentials');
  const repositoryUrl = watch('repositoryUrl');

  const sourceIdentityOptions = identities
    ?.filter(identity => identity.kind === 'source')
    .map(identity => ({
      value: identity.name,
      label: identity.name,
      id: identity.id,
    }));
  const mavenIdentityOptions = identities
    ?.filter(identity => identity.kind === 'maven')
    ?.map(identity => ({
      value: identity.name,
      label: identity.name,
      id: identity.id,
    }));

  const onSuccessCallback = () => {
    setIsWaiting(true);
    const kind = entity.kind.toLowerCase(); // Convert kind to lowercase as entity refs are case-insensitive
    const namespace = entity.metadata.namespace || 'default'; // Fallback to 'default' if namespace is not set
    const entityName = entity.metadata.name;

    const entityRef = `${kind}:${namespace}/${entityName}`;
    catalogApi
      .refreshEntity(entityRef)
      .then(() => {
        setTimeout(() => {
          catalogApi.getEntityByRef(entityRef).then(appEntity => {
            setApplication(
              appEntity?.metadata.application as unknown as Application,
            );
            setIsWaiting(false);
          });
        }, 10000);
      })
      .catch(() => {
        setIsWaiting(false);
      });
  };
  const { mutate: updateApplication } = useUpdateApplication(onSuccessCallback);

  const onSubmit = (formData: any, event: any) => {
    // preventDefault();V
    event.preventDefault();
    const findIdentityByName = (identityName: string) => {
      return identities?.find(option => option.name === identityName);
    };

    const mavenIdentity =
      formData.mavenCredentials !== 'None'
        ? findIdentityByName(formData.mavenCredentials)
        : null;

    const sourceIdentity =
      formData.sourceCredentials !== 'None'
        ? findIdentityByName(formData.sourceCredentials)
        : null;

    const updatedApplication: Application = {
      ...application,
      repository: {
        url: formData.repositoryUrl,
      },
      identities: [
        ...(mavenIdentity
          ? [{ id: mavenIdentity.id, name: mavenIdentity.name }]
          : []),
        ...(sourceIdentity
          ? [{ id: sourceIdentity.id, name: sourceIdentity.name }]
          : []),
      ],
    };

    updateApplication(updatedApplication);
  };
  const isProcessing = isSubmitting || isWaiting;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Controller
            disabled
            name="name"
            control={control}
            rules={{ required: 'Application name is required' }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                fullWidth
                label="Application Name"
                variant="outlined"
                error={!!error}
                helperText={error ? error.message : null}
                {...field}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="repositoryUrl"
            control={control}
            rules={{ required: 'Repository URL is required' }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                fullWidth
                label="Repository URL"
                variant="outlined"
                error={!!error}
                helperText={error ? error.message : null}
                InputProps={{
                  endAdornment: (
                    <Link component={LinkButton} to={field.value}>
                      Visit
                    </Link>
                  ),
                }}
                {...field}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth error={!!errors.sourceCredentials}>
            <InputLabel>Source Credentials</InputLabel>
            <Controller
              name="sourceCredentials"
              control={control}
              rules={{ required: 'Source credentials are required' }}
              render={({ field }) => (
                <Select {...field} label="Source Credentials">
                  {sourceIdentityOptions?.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.sourceCredentials && (
              <Typography color="error">
                {errors.sourceCredentials.message}
              </Typography>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth error={!!errors.mavenCredentials}>
            <InputLabel>Maven Credentials</InputLabel>
            <Controller
              name="mavenCredentials"
              control={control}
              rules={{ required: 'Maven credentials are required' }}
              render={({ field }) => (
                <Select {...field} label="Maven Credentials">
                  {mavenIdentityOptions?.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.mavenCredentials && (
              <Typography color="error">
                {errors.mavenCredentials.message}
              </Typography>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={
              isSubmitting ||
              Object.keys(errors).length > 0 ||
              !sourceCredentials ||
              !mavenCredentials ||
              !repositoryUrl
            }
          >
            Update
          </Button>
        </Grid>
        {isProcessing && (
          <Grid item xs={12}>
            <CircularProgress />
            <Typography>Updating...</Typography>
          </Grid>
        )}
      </Grid>
    </form>
  );
};

export default ApplicationDetailsForm;
