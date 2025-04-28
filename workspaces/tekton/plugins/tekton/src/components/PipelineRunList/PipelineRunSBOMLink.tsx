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
import type { FC, ReactElement } from 'react';
import { Link } from 'react-router-dom';

import { TaskRunKind } from '@janus-idp/shared-react';

import {
  getSbomLink,
  hasExternalLink,
  isSbomTaskRun,
} from '../../utils/taskRun-utils';
import LinkToSBomIcon from '../Icons/LinkToSbomIcon';

const PipelineRunSBOMLink: FC<{
  sbomTaskRun: TaskRunKind | undefined;
}> = ({ sbomTaskRun }): ReactElement | null => {
  const isSBOMTask = isSbomTaskRun(sbomTaskRun);
  const isExternalLink: boolean = hasExternalLink(sbomTaskRun);
  const linkToSbom = getSbomLink(sbomTaskRun);

  if (
    isSBOMTask &&
    isExternalLink &&
    (linkToSbom?.startsWith('http://') || linkToSbom?.startsWith('https://'))
  ) {
    // Link to external page
    return (
      <Link target="_blank" to={linkToSbom}>
        <LinkToSBomIcon dataTestId="external-sbom-link" />
      </Link>
    );
  } else if (isSBOMTask && linkToSbom) {
    // Link to internal taskrun page
    return <LinkToSBomIcon dataTestId="internal-sbom-link" />;
  }

  return (
    <LinkToSBomIcon
      disabled={!sbomTaskRun || !isSBOMTask}
      dataTestId="icon-space-holder"
    />
  );
};

export default PipelineRunSBOMLink;
