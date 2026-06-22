/*
 * Copyright 2025 The Backstage Authors
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

import { RiExternalLinkLine } from '@remixicon/react';
import { ButtonIcon } from '@backstage/ui';
import { TooltipTrigger, Tooltip } from 'react-aria-components';

import { convertDateFormat } from '../../utils/stringUtils';
import {
  renderStatusLabel,
  usePriorityMap,
  useIncidentStateMap,
} from '../../utils/incidentUtils';
import type { IncidentsData } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { Text } from '@backstage/ui';
import styles from './IncidentsTableRow.module.css';

export const IncidentsTableRow = ({ data }: { data: IncidentsData }) => {
  const { t } = useTranslation();
  const priorityMap = usePriorityMap();
  const incidentStateMap = useIncidentStateMap();

  return (
    <div
      className={styles.tableRow}
      style={{
        display: 'table-row',
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      <div className={styles.tableCellStyle} style={{ display: 'table-cell' }}>
        {data.number}
      </div>
      <div className={styles.tableCellStyle} style={{ display: 'table-cell' }}>
        <TooltipTrigger>
          <Text as="span" className={styles.descriptionCell}>
            {data?.shortDescription}
          </Text>
          <Tooltip>{data?.description}</Tooltip>
        </TooltipTrigger>
      </div>
      <div className={styles.tableCellStyle} style={{ display: 'table-cell' }}>
        {convertDateFormat(data?.sysCreatedOn)}
      </div>
      <div className={styles.tableCellStyle} style={{ display: 'table-cell' }}>
        {renderStatusLabel(priorityMap[data?.priority])}
      </div>

      <div className={styles.tableCellStyle} style={{ display: 'table-cell' }}>
        {renderStatusLabel(incidentStateMap[data?.incidentState])}
      </div>
      <div className={styles.tableCellStyle} style={{ display: 'table-cell' }}>
        <TooltipTrigger>
          <ButtonIcon
            icon={<RiExternalLinkLine size={16} />}
            onPress={() =>
              window.open(data.url, '_blank', 'noopener,noreferrer')
            }
            variant="secondary"
          />
          <Tooltip>{t('actions.openInServicenow')}</Tooltip>
        </TooltipTrigger>
      </div>
    </div>
  );
};
