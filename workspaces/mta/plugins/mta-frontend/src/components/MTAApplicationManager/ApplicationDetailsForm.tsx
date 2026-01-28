import { useMemo, useState } from 'react';
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
  Paper,
  Snackbar,
  SnackbarContent,
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
  const [authError, setAuthError] = useState(false);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);

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
    formState: { errors, isSubmitting, isDirty },
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
      .catch((error: any) => {
        // Handle authentication errors
        if (error?.response?.status === 401) {
          setAuthError(true);
          setShowErrorSnackbar(true);
        }
        setIsWaiting(false);
      });
  };

  const { mutate: updateApplication } = useUpdateApplication(onSuccessCallback);

  // Close error snackbar
  const handleCloseSnackbar = () => {
    setShowErrorSnackbar(false);
  };

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
  const isFormValid = sourceCredentials && mavenCredentials && repositoryUrl;
  const canUpdate = isDirty && isFormValid && !Object.keys(errors).length;

  // Show authentication error message if there's an auth error
  if (authError) {
    return (
      <Paper style={{ padding: '16px', backgroundColor: '#fff3f3' }}>
        <Typography variant="h6" color="error">
          Authentication Error (401 Unauthorized)
        </Typography>
        <Typography variant="body1">
          Unable to update application details. This is likely because your
          Backstage client in Keycloak is missing the required scopes.
        </Typography>
        <Typography variant="body2" style={{ marginTop: '8px' }}>
          Please ensure a Backstage client is added to your Keycloak realm with
          the necessary scopes (applications:get, applications:put,
          identities:get, etc.) to make requests against MTAt pu.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          style={{ marginTop: '16px' }}
          onClick={() => {
            setAuthError(false);
            window.location.reload();
          }}
        >
          Retry
        </Button>
      </Paper>
    );
  }

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
              !canUpdate ||
              isProcessing ||
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

      {/* Error Snackbar */}
      <Snackbar
        open={showErrorSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <SnackbarContent
          style={{ backgroundColor: '#f44336' }}
          message={
            <span>
              Authentication error (401). Your Backstage client in Keycloak may
              be missing the required scopes (applications:get,
              applications:put, identities:get, etc.).
            </span>
          }
          action={
            <Button color="inherit" size="small" onClick={handleCloseSnackbar}>
              Close
            </Button>
          }
        />
      </Snackbar>
    </form>
  );
};

export default ApplicationDetailsForm;
