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
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { useSharedShowOverall, useSharedTeam } from '../../contexts';

export function OverallToggle() {
  const [showOverall, setShowOverall] = useSharedShowOverall();
  const [team] = useSharedTeam();

  // Only show the toggle when a team is selected
  if (!team) {
    return null;
  }

  return (
    <FormControlLabel
      control={
        <Switch
          checked={showOverall}
          onChange={e => setShowOverall(e.target.checked)}
          color="primary"
        />
      }
      label="Show Overall Data"
    />
  );
}
