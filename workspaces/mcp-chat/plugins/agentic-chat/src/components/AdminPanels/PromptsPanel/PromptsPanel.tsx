/*
 * Copyright 2025 The Backstage Authors
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
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import { useSwimLanesEditor } from '../useSwimLanesEditor';
import { PromptsPanelHeader } from './PromptsPanelHeader';
import { LaneAccordion } from './LaneAccordion';

const CONTAINER_SX = {
  p: 3,
  width: '100%',
  maxWidth: 960,
  mx: 'auto',
} as const;

const LOADING_SX = {
  p: 4,
  display: 'flex',
  justifyContent: 'center',
} as const;

const EMPTY_STATE_SX = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 1.5,
  py: 6,
  px: 2,
} as const;

const EMPTY_ICON_SX = {
  fontSize: 48,
  color: 'text.disabled',
} as const;

const SNACKBAR_ANCHOR = {
  vertical: 'bottom' as const,
  horizontal: 'center' as const,
};

export const PromptsPanel = () => {
  const {
    lanes,
    dirty,
    loading,
    saving,
    error,
    source,
    toast,
    validationErrors,
    handleSave,
    handleReset,
    updateLane,
    updateCard,
    addCard,
    removeCard,
    addLane,
    removeLane,
    dismissToast,
  } = useSwimLanesEditor();

  if (loading) {
    return (
      <Box sx={LOADING_SX}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  const hasLanes = lanes.length > 0;

  return (
    <Box sx={CONTAINER_SX}>
      <PromptsPanelHeader
        source={source}
        dirty={dirty}
        saving={saving}
        onSave={handleSave}
        onReset={handleReset}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {hasLanes ? (
        <>
          {lanes.map((lane, i) => (
            <LaneAccordion
              key={lane._key}
              lane={lane}
              defaultExpanded={i === 0}
              validationErrors={validationErrors}
              onUpdateLane={updateLane}
              onUpdateCard={updateCard}
              onAddCard={addCard}
              onRemoveCard={removeCard}
              onRemoveLane={removeLane}
            />
          ))}

          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={addLane}
            sx={{ mt: 2 }}
          >
            Add Swim Lane
          </Button>
        </>
      ) : (
        <Box sx={EMPTY_STATE_SX}>
          <ViewCarouselOutlinedIcon sx={EMPTY_ICON_SX} />
          <Typography variant="body1" color="textSecondary" textAlign="center">
            No swim lanes configured yet.
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            textAlign="center"
            sx={{ maxWidth: 360 }}
          >
            Add a swim lane to create clickable prompt cards on the welcome
            screen.
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={addLane}
            sx={{ mt: 1 }}
          >
            Add Swim Lane
          </Button>
        </Box>
      )}

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={dismissToast}
        message={toast}
        anchorOrigin={SNACKBAR_ANCHOR}
      />
    </Box>
  );
};
