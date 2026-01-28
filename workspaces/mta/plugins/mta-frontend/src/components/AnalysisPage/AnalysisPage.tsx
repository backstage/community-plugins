import { useState } from 'react';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  CircularProgress,
  Grid,
  Typography,
  Paper,
} from '@material-ui/core';
import { useForm, Controller } from 'react-hook-form';
import { useFetchTargets, useAnalyzeApplication } from '../../queries/mta';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Application } from '../../api/api';
import { InfoCard } from '@backstage/core-components';

interface IFormInput {
  type: string;
  targetList: string[];
}

export const AnalysisPage = () => {
  const { control, handleSubmit, watch } = useForm<IFormInput>({
    defaultValues: {
      type: '',
      targetList: [],
    },
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [authError, setAuthError] = useState(false);
  const entity = useEntity();

  const { targets, isError: targetsError } = useFetchTargets();

  const { mutate: analyzeApp } = useAnalyzeApplication({
    onError: (error: any) => {
      // Check if it's an authentication error
      if (error?.response?.status === 401) {
        setAuthError(true);
      }
      setIsAnalyzing(false);
    },
  });

  const labelOptions = targets
    ? targets?.flatMap(target =>
        target?.labels?.map(label => ({
          label: label.label,
          name: label?.name || '',
        })),
      )
    : [];

  const [type, targetList] = watch(['type', 'targetList']);
  const enableAnalysis = type && targetList.length > 0;

  const onSubmit = (data: IFormInput, event: any) => {
    // Ensure we prevent default behavior and stop propagation
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    setIsAnalyzing(true);
    const app = entity.entity.metadata.application as unknown as Application;
    const analysisParams = {
      selectedApp: app.id,
      analysisOptions: {
        type: data.type,
        targetList: data.targetList,
        application: app,
      },
    };

    // Wrap in try/catch to handle any errors silently
    try {
      analyzeApp(analysisParams);
    } catch (error) {
      // Silently handle error - we don't want to log to console due to ESLint rules
      setIsAnalyzing(false);
    }

    // Use setTimeout to ensure UI feedback even if the operation is quick
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 5000); // Simulates 5 seconds of analysis

    // Return false to ensure no navigation occurs
    return false;
  };
  // Show authentication error message if there's an auth error
  if (authError || targetsError) {
    return (
      <Grid item xs={12} md={6}>
        <Paper style={{ padding: '16px', backgroundColor: '#fff3f3' }}>
          <Typography variant="h6" color="error">
            Authentication Error (401 Unauthorized)
          </Typography>
          <Typography variant="body1">
            Unable to connect to the MTA server. This is likely because your
            Backstage client in Keycloak is missing the required scopes.
          </Typography>
          <Typography variant="body2" style={{ marginTop: '8px' }}>
            Please ensure a Backstage client is added to your Keycloak realm
            with the necessary scopes (applications:get, analyses:post,
            tasks:get, etc.) to make requests against MTA.
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
      </Grid>
    );
  }

  return (
    <Grid item xs={12} md={6}>
      <InfoCard title="Analyze Application">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Type"
                  // onChange={e => setValue('type', e.target.value)}
                >
                  {['Source', 'Source + Dependencies'].map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Target List</InputLabel>
            <Controller
              name="targetList"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Target List"
                  multiple
                  // onChange={e => setValue('targetList', e.target.value)}
                  // renderValue={selected => selected.join(', ')}
                >
                  {labelOptions.map(label => (
                    <MenuItem key={label?.label} value={label?.label}>
                      {label?.name || ''}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>

          <Grid
            container
            alignItems="center"
            spacing={2}
            style={{ display: 'flex', marginTop: '15px' }}
          >
            <Grid item>
              <Button
                type="submit"
                variant="contained"
                disabled={!enableAnalysis}
              >
                Analyze
              </Button>
            </Grid>
            <Grid item>{isAnalyzing && <CircularProgress size={24} />}</Grid>
          </Grid>
        </form>
      </InfoCard>
    </Grid>
  );
};
