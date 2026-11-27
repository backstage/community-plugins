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
import Grid from '@material-ui/core/Grid';
import { SupportButton } from '@backstage/core-components';
import { Container, Header } from '@backstage/ui';
import { ProjectsComponent } from '../ProjectsComponent';

export const CodeScenePageComponent = () => (
  <>
    <Header
      title="CodeScene"
      description="See hidden risks and social patterns in your code. Prioritize and reduce
        technical debt."
      customActions={<SupportButton />}
    />
    <Container>
      <Grid container spacing={3} direction="column">
        <Grid item>
          <ProjectsComponent />
        </Grid>
      </Grid>
    </Container>
  </>
);
