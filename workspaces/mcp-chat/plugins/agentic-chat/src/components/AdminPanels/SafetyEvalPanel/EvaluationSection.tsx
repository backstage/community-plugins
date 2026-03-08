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
import { useState, useCallback, useMemo, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';
import Snackbar from '@mui/material/Snackbar';
import Collapse from '@mui/material/Collapse';
import { asStringArray } from '../../../utils';
import { useAdminConfig, useEvaluationStatus } from '../../../hooks';
import { AdminSection } from '../shared/AdminSection';
import { ServerItemPicker } from '../shared/ServerItemPicker';

interface Props {
  providerName: string;
  effectiveConfig?: Record<string, unknown> | null;
  onConfigSaved?: () => void;
}

export const EvaluationSection = ({
  providerName,
  effectiveConfig,
  onConfigSaved,
}: Props) => {
  const enabledConfig = useAdminConfig('evaluationEnabled');
  const scoringConfig = useAdminConfig('scoringFunctions');
  const thresholdConfig = useAdminConfig('minScoreThreshold');
  const evalStatus = useEvaluationStatus();

  const effectiveEnabled =
    (effectiveConfig?.evaluationEnabled as boolean) ?? false;
  const effectiveScoring = useMemo(
    () => asStringArray(effectiveConfig?.scoringFunctions),
    [effectiveConfig?.scoringFunctions],
  );
  const effectiveThreshold =
    (effectiveConfig?.minScoreThreshold as number) ?? 0.5;

  const [enabled, setEnabled] = useState(false);
  const [scoringFunctions, setScoringFunctions] = useState<string[]>([]);
  const [threshold, setThreshold] = useState(0.5);
  const [toast, setToast] = useState<string | null>(null);
  const [initialized, setInitialized] = useState({
    enabled: false,
    scoring: false,
    threshold: false,
  });

  useEffect(() => {
    if (!initialized.enabled && !enabledConfig.loading) {
      const dbValue = enabledConfig.entry?.configValue as boolean | undefined;
      setEnabled(dbValue ?? effectiveEnabled);
      setInitialized(prev => ({ ...prev, enabled: true }));
    }
  }, [
    initialized.enabled,
    enabledConfig.loading,
    enabledConfig.entry,
    effectiveEnabled,
  ]);

  useEffect(() => {
    if (!initialized.scoring && !scoringConfig.loading) {
      const dbValue = scoringConfig.entry?.configValue;
      setScoringFunctions(
        dbValue !== undefined ? asStringArray(dbValue) : [...effectiveScoring],
      );
      setInitialized(prev => ({ ...prev, scoring: true }));
    }
  }, [
    initialized.scoring,
    scoringConfig.loading,
    scoringConfig.entry,
    effectiveScoring,
  ]);

  useEffect(() => {
    if (!initialized.threshold && !thresholdConfig.loading) {
      const dbValue = thresholdConfig.entry?.configValue as number | undefined;
      setThreshold(dbValue ?? effectiveThreshold);
      setInitialized(prev => ({ ...prev, threshold: true }));
    }
  }, [
    initialized.threshold,
    thresholdConfig.loading,
    thresholdConfig.entry,
    effectiveThreshold,
  ]);

  const source =
    enabledConfig.source === 'database' ||
    scoringConfig.source === 'database' ||
    thresholdConfig.source === 'database'
      ? 'database'
      : 'default';

  const saving =
    enabledConfig.saving || scoringConfig.saving || thresholdConfig.saving;
  const error =
    enabledConfig.error || scoringConfig.error || thresholdConfig.error;

  const handleSave = useCallback(async () => {
    const results = await Promise.allSettled([
      enabledConfig.save(enabled),
      scoringConfig.save(scoringFunctions),
      thresholdConfig.save(threshold),
    ]);

    const labels = ['Enabled toggle', 'Scoring Functions', 'Score Threshold'];
    const failed = results
      .map((r, i) => (r.status === 'rejected' ? labels[i] : null))
      .filter(Boolean);

    if (failed.length > 0) {
      setToast(`Failed to save: ${failed.join(', ')}`);
    } else {
      setToast('Evaluation config saved');
      onConfigSaved?.();
    }
  }, [
    enabled,
    scoringFunctions,
    threshold,
    enabledConfig,
    scoringConfig,
    thresholdConfig,
    onConfigSaved,
  ]);

  const handleReset = useCallback(async () => {
    try {
      await Promise.all([
        enabledConfig.reset(),
        scoringConfig.reset(),
        thresholdConfig.reset(),
      ]);
    } catch {
      return;
    }
    setEnabled(effectiveEnabled);
    setScoringFunctions([...effectiveScoring]);
    setThreshold(effectiveThreshold);
    setInitialized({ enabled: false, scoring: false, threshold: false });
    setToast('Reset to YAML defaults');
  }, [
    enabledConfig,
    scoringConfig,
    thresholdConfig,
    effectiveEnabled,
    effectiveScoring,
    effectiveThreshold,
  ]);

  const loading =
    enabledConfig.loading || scoringConfig.loading || thresholdConfig.loading;
  if (loading) return null;

  return (
    <>
      <AdminSection
        title="Response Evaluation"
        description={`Score LLM responses using ${providerName} Scoring API. Responses below the threshold are flagged.`}
        source={source}
        saving={saving}
        error={error}
        onSave={handleSave}
        onReset={handleReset}
      >
        <FormControlLabel
          control={
            <Switch
              checked={enabled}
              onChange={(_, checked) => setEnabled(checked)}
            />
          }
          label={
            <Typography variant="body2">
              {enabled ? 'Evaluation enabled' : 'Evaluation disabled'}
            </Typography>
          }
          sx={{ mb: 1 }}
        />

        <Collapse in={enabled}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <ServerItemPicker
              selected={scoringFunctions}
              onChange={setScoringFunctions}
              serverItems={evalStatus.scoringFunctions}
              serverLoading={evalStatus.loading}
              serverError={evalStatus.error}
              onRefresh={evalStatus.refresh}
              label="Scoring Functions"
              placeholder="e.g. basic::equality"
              itemLabel="scoring functions"
            />

            <Box>
              <Typography variant="caption" color="textSecondary">
                Minimum Score Threshold: {threshold.toFixed(2)}
              </Typography>
              <Slider
                size="small"
                min={0}
                max={1}
                step={0.05}
                value={threshold}
                onChange={(_, v) => setThreshold(v as number)}
                valueLabelDisplay="auto"
                aria-label="Minimum score threshold"
                getAriaValueText={v => `${v.toFixed(2)}`}
                sx={{ mt: 0.5 }}
              />
              <Typography variant="caption" color="textSecondary">
                Responses scoring below this threshold will be flagged as low
                quality.
              </Typography>
            </Box>
          </Box>
        </Collapse>
      </AdminSection>

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};
