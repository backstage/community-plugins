/*
 * Copyright 2023 The Backstage Authors
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

import { useState } from 'react';
import type { ReactNode } from 'react';
import { EntityTextArea } from '../EntityTextArea';
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Header,
  TextField,
} from '@backstage/ui';
import { CatalogProcessorResult } from '../../types';
import { parseEntityYaml } from '../../utils';
import { EntityValidationOutput } from '../EntityValidationOutput';
import styles from './EntityValidationPage.module.css';

const EXAMPLE_CATALOG_INFO_YAML = `# Provide your entity descriptor YAML to validate its structure
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: test
  description: Component description
  links: []
  tags: []
  annotations: {}
spec:
  type: service
  lifecycle: experimental
  owner: owner
`;

export const EntityValidationContent = (props: {
  defaultYaml?: string;
  defaultLocation?: string;
  hideFileLocationField?: boolean;
  contentHead?: ReactNode;
}) => {
  const {
    defaultYaml = EXAMPLE_CATALOG_INFO_YAML,
    defaultLocation = 'https://github.com/backstage/backstage/blob/master/catalog-info.yaml',
    hideFileLocationField = false,
    contentHead,
  } = props;

  const [catalogYaml, setCatalogYaml] = useState(defaultYaml);
  const [yamlFiles, setYamlFiles] = useState<CatalogProcessorResult[]>();
  const [locationUrl, setLocationUrl] = useState(defaultLocation);

  const parseYaml = () => {
    const parsedFiles = [
      ...parseEntityYaml(Buffer.from(catalogYaml), {
        type: 'url',
        target: locationUrl ? locationUrl : 'http://localhost',
      }),
    ];
    setYamlFiles(parsedFiles);
  };

  return (
    <Flex
      direction="column"
      gap="4"
      className={styles.mainLayout}
      data-testid="main-grid"
    >
      {contentHead}

      {!hideFileLocationField && (
        <TextField
          isRequired
          id="file-location"
          label="File Location"
          value={locationUrl}
          placeholder={defaultLocation}
          description="Present or future location of your entity descriptor YAML file. This is not the file being validated; this merely adds location annotations to the entity descriptor file being validated."
          onChange={setLocationUrl}
        />
      )}

      <Grid.Root columns="12" gap="4" className={styles.contentRow}>
        <Grid.Item colSpan={{ initial: '12', md: '6' }}>
          <Flex direction="column" align="end" gap="2" className={styles.fill}>
            <Box className={styles.editorContainer}>
              <EntityTextArea
                onValidate={parseYaml}
                onChange={(value: string) => setCatalogYaml(value)}
                catalogYaml={catalogYaml}
              />
            </Box>
            <Button variant="primary" onPress={parseYaml}>
              Validate
            </Button>
          </Flex>
        </Grid.Item>
        <Grid.Item colSpan={{ initial: '12', md: '6' }}>
          <EntityValidationOutput
            processorResults={yamlFiles}
            locationUrl={locationUrl}
          />
        </Grid.Item>
      </Grid.Root>
    </Flex>
  );
};

export const EntityValidationPage = (props: {
  defaultYaml?: string;
  defaultLocation?: string;
  hideFileLocationField?: boolean;
  contentHead?: ReactNode;
}) => {
  const {
    defaultYaml = EXAMPLE_CATALOG_INFO_YAML,
    defaultLocation = 'https://github.com/backstage/backstage/blob/master/catalog-info.yaml',
    hideFileLocationField = false,
    contentHead,
  } = props;

  return (
    <>
      <Header
        title="Entity Validator"
        description="Validate Backstage catalog entity descriptor YAML files"
      />
      <Container>
        <EntityValidationContent
          defaultYaml={defaultYaml}
          defaultLocation={defaultLocation}
          hideFileLocationField={hideFileLocationField}
          contentHead={contentHead}
        />
      </Container>
    </>
  );
};
