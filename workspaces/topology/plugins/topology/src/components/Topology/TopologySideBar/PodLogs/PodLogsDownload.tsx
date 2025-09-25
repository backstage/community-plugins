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
import IconButton from '@mui/material/IconButton';
import DownloadIcon from '@mui/icons-material/GetApp';

import { downloadLogFile } from '../../../../utils/download-log-file-utils';
import { useTranslation } from '../../../../hooks/useTranslation';

type PodLogsDownloadProps = {
  logText?: string;
  fileName: string;
};

const PodLogsDownload = ({ logText, fileName }: PodLogsDownloadProps) => {
  const { t } = useTranslation();

  return logText ? (
    <IconButton
      aria-label="download logs"
      onClick={() => downloadLogFile(logText, `${fileName}.log`)}
      size="small"
      color="primary"
    >
      <DownloadIcon fontSize="small" />
      {t('logs.download')}
    </IconButton>
  ) : null;
};

export default PodLogsDownload;
