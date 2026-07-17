/*
 * Copyright 2021 The Backstage Authors
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
import { Text } from '@backstage/ui';
import styles from './DataValue.module.css';

interface DataValueProps {
  field: string;
  value?: string | number | null | undefined;
}

export const DataValue = ({ field, value }: DataValueProps) => {
  return (
    <div className={styles.root}>
      <Text className={styles.label} variant="body-small">
        {field}
      </Text>
      <Text className={styles.value} variant="body-medium">
        {value ?? '--'}
      </Text>
    </div>
  );
};

interface GridProps {
  xs?: number;
  md?: number;
  lg?: number;
}

export const DataValueGridItem = (props: DataValueProps & GridProps) => (
  <div>
    <DataValue {...props} />
  </div>
);
