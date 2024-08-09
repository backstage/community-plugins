import React from 'react';

import { JsonObject } from '@backstage/types';

import { Editor } from '@monaco-editor/react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';

import SubmitButton from '../SubmitButton';

const DEFAULT_VALUE = JSON.stringify({ myKey: 'myValue' }, null, 4);

const JsonTextAreaForm = ({
  isExecuting,
  handleExecute,
}: {
  isExecuting: boolean;
  handleExecute: (getParameters: () => JsonObject) => Promise<void>;
}) => {
  const [jsonText, setJsonText] = React.useState(DEFAULT_VALUE);
  const theme = useTheme();
  const getParameters = (): JsonObject => {
    if (!jsonText) {
      return {};
    }
    const parameters = JSON.parse(jsonText);
    return parameters as JsonObject;
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Alert severity="info" style={{ width: '100%' }}>
          <AlertTitle>Missing JSON Schema for Input Form.</AlertTitle>
          Type the input data in JSON format below.
          <br />
          If you prefer using a form to start the workflow, ensure a valid JSON
          schema is provided in the 'dataInputSchema' property of your workflow
          definition file.
        </Alert>
      </Grid>
      <Grid item xs={12}>
        <Box style={{ border: `1px solid ${theme.palette.divider}` }}>
          <Editor
            value={jsonText}
            language="json"
            onChange={(value: string | undefined) => setJsonText(value ?? '')}
            height="30rem"
            theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
            options={{
              minimap: { enabled: false },
            }}
          />
        </Box>
      </Grid>
      <Grid item xs={12}>
        <SubmitButton
          submitting={isExecuting}
          handleClick={() => handleExecute(getParameters)}
        >
          Run
        </SubmitButton>
      </Grid>
    </Grid>
  );
};

export default JsonTextAreaForm;
