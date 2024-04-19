/*
 * Copyright 2020 The Backstage Authors
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

import React, {
  useState,
  forwardRef,
  ChangeEvent,
  FormEventHandler,
} from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Alert, AlertFormProps } from '../types';

export type AlertAcceptFormProps = AlertFormProps<Alert, null>;

export const AlertAcceptForm = forwardRef<
  HTMLFormElement,
  AlertAcceptFormProps
>(({ onSubmit, disableSubmit }, ref) => {
  const [checked, setChecked] = useState(false);

  const onFormSubmit: FormEventHandler = e => {
    e.preventDefault();
    onSubmit(null);
  };

  const onChecked = (_: ChangeEvent<HTMLInputElement>, isChecked: boolean) => {
    setChecked(isChecked);
    disableSubmit(!isChecked);
  };

  return (
    <form ref={ref} onSubmit={onFormSubmit}>
      <FormControl component="fieldset" fullWidth>
        <FormControlLabel
          label="My team can commit to making this change soon, or has already."
          value={checked}
          control={
            <Checkbox color="primary" checked={checked} onChange={onChecked} />
          }
        />
      </FormControl>
    </form>
  );
});
