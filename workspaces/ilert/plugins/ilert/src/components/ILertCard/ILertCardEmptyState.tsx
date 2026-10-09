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

import { CodeSnippet } from '@backstage/core-components';
import { Card, CardHeader, Button, Text } from '@backstage/ui';
import styles from './ILertCardEmptyState.module.css';

const ENTITY_YAML = `apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: example
  description: example.com
  annotations:
    ilert.com/integration-key: [INTEGRATION_KEY]
spec:
  type: website
  lifecycle: production
  owner: guest`;

export const ILertCardEmptyState = () => {
  return (
    <Card data-testid="ilert-empty-card">
      <CardHeader title="ilert" />
      <div className={styles.content}>
        <Text>
          No integration key defined for this entity. You can add integration
          key to your entity YAML as shown in the highlighted example below:
        </Text>
        <div className={styles.code}>
          <CodeSnippet
            text={ENTITY_YAML}
            language="yaml"
            showLineNumbers
            highlightedNumbers={[6, 7]}
            customStyle={{ background: 'inherit', fontSize: '115%' }}
          />
        </div>
        <Button
          variant="primary"
          onPress={() =>
            window.open(
              'https://github.com/backstage/backstage/blob/master/plugins/ilert/README.md',
              '_blank',
            )
          }
        >
          Read more
        </Button>
      </div>
    </Card>
  );
};
