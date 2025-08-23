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
import { ANNOTATION_SUPPORTED } from '@backstage-community/plugin-kiali-common';
import { Entity } from '@backstage/catalog-model';
import {
  CodeSnippet,
  Content,
  EmptyState,
  Page,
} from '@backstage/core-components';
import { Box } from '@material-ui/core';

export const KialiNoResources = (props: { entity: Entity }) => {
  const annotationsKey = Object.keys(
    props.entity.metadata.annotations || [],
  ).filter(key => ANNOTATION_SUPPORTED.indexOf(key) > -1);
  return (
    <Page themeId="tool">
      <Content>
        <EmptyState
          missing="data"
          title="No resources to show with these annotations"
          description={
            <>
              Kiali detected the annotations:
              <ul style={{ marginTop: '5px' }}>
                {annotationsKey.map(key => (
                  <li>
                    <b>{key}</b>:{' '}
                    {props.entity.metadata.annotations
                      ? props.entity.metadata.annotations[key]
                      : 'Not found'}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: '40px' }}>
                This is the entity loaded.
                <Box style={{ marginTop: '10px' }}>
                  <CodeSnippet
                    text={JSON.stringify(props.entity, null, 2)}
                    language="yaml"
                    showLineNumbers
                    customStyle={{ background: 'inherit', fontSize: '115%' }}
                  />
                </Box>
              </div>
            </>
          }
        />
      </Content>
    </Page>
  );
};
