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
import { Health } from '@backstage-community/plugin-kiali-common/func';
import type { HealthItem } from '@backstage-community/plugin-kiali-common/types';
import {
  DEGRADED,
  FAILURE,
  HEALTHY,
  TRAFFICSTATUS,
} from '@backstage-community/plugin-kiali-common/types';
import { Typography } from '@material-ui/core';
import { default as React } from 'react';
import { KialiIcon, serverConfig } from '../../config';
import { PFColors } from '../Pf/PfColors';
import { createIcon } from './Helper';

interface HealthDetailsProps {
  health: Health;
}

// @ts-ignore
export const HealthDetails: React.FC<HealthDetailsProps> = (
  props: HealthDetailsProps,
) => {
  const renderErrorRate = (item: HealthItem, idx: number): React.ReactNode => {
    const config = props.health.getStatusConfig(serverConfig);

    const isValueInConfig =
      config && props.health.health.statusConfig
        ? props.health.health.statusConfig.value > 0
        : false;

    const showTraffic = item.children
      ? item.children.filter(sub => {
          const showItem = sub.value && sub.value > 0;

          return showItem;
        }).length > 0
      : false;

    return showTraffic ? (
      <div key={idx}>
        <>
          {`${item.title}${item.text && item.text.length > 0 ? ': ' : ''} `}

          {config && <KialiIcon.Info color={PFColors.Color200} />}
        </>

        {item.text}

        {item.children && (
          <ul style={{ listStyleType: 'none' }}>
            {item.children.map((sub, subIdx) => {
              const showItem = sub.value && sub.value > 0;

              return showItem ? (
                <li key={subIdx}>
                  <span style={{ marginRight: '0.5rem' }}>
                    {createIcon(sub.status)}
                  </span>
                  {sub.text}
                </li>
              ) : (
                <React.Fragment key={subIdx} />
              );
            })}

            {config && isValueInConfig && (
              <li key="degraded_failure_config">
                <span style={{ marginRight: '0.5rem' }}>
                  {createIcon(DEGRADED)}
                </span>
                : {config.degraded === 0 ? '>' : '>='}
                {config.degraded}% {createIcon(FAILURE)}:{' '}
                {config.degraded === 0 ? '>' : '>='}
                {config.failure}%
              </li>
            )}
          </ul>
        )}
      </div>
    ) : (
      <React.Fragment key={idx} />
    );
  };

  const renderChildren = (item: HealthItem, idx: number): React.ReactNode => {
    return item.title.startsWith(TRAFFICSTATUS) ? (
      renderErrorRate(item, idx)
    ) : (
      <div key={idx}>
        <>{`${item.title}${item.text && item.text.length > 0 ? ': ' : ''}`}</>

        {item.text}

        {item.children && (
          <ul style={{ listStyleType: 'none' }}>
            {item.children.map((sub, subIdx) => {
              return (
                <li key={subIdx}>
                  <span style={{ marginRight: '0.5rem' }}>
                    {createIcon(sub.status)}
                  </span>

                  {sub.text}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  };

  const health = props.health;

  return (
    <>
      {health.health.items.map((item, idx) => {
        return renderChildren(item, idx);
      })}
    </>
  );
  // @ts-ignore
};

export const renderTrafficStatus = (health: Health): React.ReactNode => {
  const config = health.getStatusConfig(serverConfig);
  const isValueInConfig =
    config && health.health.statusConfig
      ? health.health.statusConfig.value > 0
      : false;
  const item = health.getTrafficStatus();

  if (item) {
    const showTraffic = item.children
      ? item.children.filter(sub => {
          const showItem = sub.value && sub.value > 0;

          return sub.status !== HEALTHY && showItem;
        }).length > 0
      : false;

    if (showTraffic) {
      return (
        <div>
          <Typography variant="h6">Traffic</Typography>

          {item.text}

          {item.children && (
            <ul style={{ listStyleType: 'none' }}>
              {item.children.map((sub, _) => {
                const showItem = sub.value && sub.value > 0;

                return sub.status !== HEALTHY && showItem ? (
                  <li key={sub.text}>
                    <span style={{ marginRight: '0.5rem' }}>
                      {createIcon(sub.status)}
                    </span>
                    {sub.text}
                  </li>
                ) : (
                  <React.Fragment key={sub.text} />
                );
              })}

              {config && isValueInConfig && (
                <li key="degraded_failure_config">
                  <span style={{ marginRight: '0.5rem' }}>
                    {createIcon(DEGRADED)}
                  </span>
                  : {config.degraded === 0 ? '>' : '>='}
                  {config.degraded}% {createIcon(FAILURE)}:{' '}
                  {config.degraded === 0 ? '>' : '>='}
                  {config.failure}%
                </li>
              )}
            </ul>
          )}
        </div>
      );
    }
  }

  return undefined;
};
