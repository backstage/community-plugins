/*
 * Copyright 2026 The Backstage Authors
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
import { Grid } from '@material-ui/core';
import { useFetchAppTasks } from '../../queries/mta';
import { Application } from '../../api/api';
import { InfoCard } from '@backstage/core-components';
import TaskTable from './TaskTable';

interface IAnalysisStatusPageProps {
  application: Application;
}
const AnalysisStatusPage = (props: IAnalysisStatusPageProps) => {
  const { application } = props;
  const { tasks, isFetching } = useFetchAppTasks(application.id);
  return (
    <Grid item xs={12} md={6}>
      <InfoCard title="Analysis Details">
        <TaskTable tasks={tasks} isFetching={isFetching} />
      </InfoCard>
    </Grid>
  );
};
export default AnalysisStatusPage;
