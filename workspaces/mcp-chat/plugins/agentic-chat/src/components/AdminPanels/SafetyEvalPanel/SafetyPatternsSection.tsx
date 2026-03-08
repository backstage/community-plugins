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
import Snackbar from '@mui/material/Snackbar';
import { asStringArray } from '../../../utils';
import { useAdminConfig } from '../../../hooks';
import { AdminSection } from '../shared/AdminSection';
import { StringListEditor } from '../shared/StringListEditor';

interface Props {
  effectiveConfig?: Record<string, unknown> | null;
  onConfigSaved?: () => void;
}

export const SafetyPatternsSection = ({
  effectiveConfig,
  onConfigSaved,
}: Props) => {
  const config = useAdminConfig('safetyPatterns');
  const effectivePatterns = useMemo(
    () => asStringArray(effectiveConfig?.safetyPatterns),
    [effectiveConfig?.safetyPatterns],
  );

  const [patterns, setPatterns] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && !config.loading) {
      const dbValue = config.entry?.configValue;
      if (dbValue !== undefined) {
        setPatterns(asStringArray(dbValue));
      } else {
        setPatterns([...effectivePatterns]);
      }
      setInitialized(true);
    }
  }, [initialized, config.loading, config.entry, effectivePatterns]);

  const handleSave = useCallback(async () => {
    const cleaned = patterns.filter(p => p.trim().length > 0);
    try {
      await config.save(cleaned);
    } catch {
      return;
    }
    setToast('Safety patterns saved');
    onConfigSaved?.();
  }, [patterns, config, onConfigSaved]);

  const handleReset = useCallback(async () => {
    try {
      await config.reset();
    } catch {
      return;
    }
    setPatterns([...effectivePatterns]);
    setInitialized(false);
    setToast('Reset to YAML default');
  }, [config, effectivePatterns]);

  if (config.loading) return null;

  return (
    <>
      <AdminSection
        title="Safety Patterns"
        description="Words or phrases that trigger safety guardrails when detected in user input."
        source={config.source}
        saving={config.saving}
        error={config.error}
        onSave={handleSave}
        onReset={handleReset}
      >
        <StringListEditor
          items={patterns}
          onChange={setPatterns}
          placeholder="Add a safety pattern..."
        />
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
