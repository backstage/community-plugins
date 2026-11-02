/*
 * Copyright 2022 The Backstage Authors
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
import { TextField } from '@backstage/ui';
import { Context } from '../ContextProvider';
import styles from './ApiBar.module.css';

export const ApiBar = () => {
  return (
    <Context.Consumer>
      {value => (
        <div className={styles.root}>
          <TextField
            id="project-id"
            label="Project ID"
            defaultValue={value.projectId?.toString()}
            onChange={newValue =>
              value.setProjectId?.(parseInt(newValue, 10) || undefined)
            }
          />
        </div>
      )}
    </Context.Consumer>
  );
};
