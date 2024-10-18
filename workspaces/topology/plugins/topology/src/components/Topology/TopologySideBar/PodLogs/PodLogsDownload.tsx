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
import React from 'react';

import { IconButton } from '@material-ui/core';
import DownloadIcon from '@material-ui/icons/GetApp';

import { downloadLogFile } from '@janus-idp/shared-react';

type PodLogsDownloadProps = {
  logText?: string;
  fileName: string;
};

const PodLogsDownload = ({ logText, fileName }: PodLogsDownloadProps) => {
  return logText ? (
    <IconButton
      aria-label="download logs"
      onClick={() => downloadLogFile(logText, `${fileName}.log`)}
      size="small"
      color="primary"
    >
      <DownloadIcon fontSize="small" />
      Download
    </IconButton>
  ) : null;
};

export default PodLogsDownload;
