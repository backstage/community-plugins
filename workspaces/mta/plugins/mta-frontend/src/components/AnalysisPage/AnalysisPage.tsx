import React from 'react';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  CircularProgress,
  Grid,
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
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const entity = useEntity();

  const { targets } = useFetchTargets();

  const { mutate: analyzeApp } = useAnalyzeApplication({});

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
    event.preventDefault();
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

    analyzeApp(analysisParams);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 5000); // Simulates 2 seconds of analysis
  };
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
