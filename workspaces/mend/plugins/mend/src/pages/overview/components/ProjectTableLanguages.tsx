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
import { useRef, useState, useCallback } from 'react';
import Typography from '@mui/material/Typography';
import { Tag, Tooltip } from '../../../components';
import { useResize } from '../../../hooks';

export const ProjectTableLanguages = ({
  items = [],
}: {
  items: [string, number][];
}) => {
  const languagesNode = useRef<HTMLDivElement | null>(null);
  const indicatorNode = useRef<HTMLDivElement | null>(null);
  const [displayingLength, setDisplayingLength] = useState(0);

  const compare = useCallback(() => {
    const allChildren: HTMLElement[] | null = languagesNode?.current?.children
      ?.length
      ? Array.from(languagesNode?.current?.children).map(
          item => item?.children?.[0] as HTMLElement,
        )
      : null;

    if (allChildren) {
      let currentWidth = 0;
      const visibleItems = [];

      allChildren.forEach(child => {
        const spanWidth = child?.offsetWidth;

        const indicatorWidth = indicatorNode?.current?.offsetWidth || 0;

        if (currentWidth + spanWidth + indicatorWidth + 25 < 270) {
          visibleItems.push(child);
          currentWidth += spanWidth;
        }
      });
      setDisplayingLength(visibleItems?.length);
    }
  }, []);

  useResize(compare);

  return (
    <Tooltip
      extendedClasses={{ tooltip: { borderRadius: '8px' } }}
      isAlwaysVisible
      tooltipContent={
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            margin: '6px',
            gap: '4px',
          }}
        >
          <Typography
            variant="caption"
            component="span"
            sx={{
              fontWeight: 700,
              fontSize: '12px',
            }}
          >
            Languages{' '}
            <Typography
              variant="caption"
              component="span"
              style={{ fontWeight: 400 }}
            >{`(${items?.length})`}</Typography>
          </Typography>

          <ul
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'start',
              width: '100%',
              paddingLeft: '12px',
              gap: '2px',
              margin: 0,
            }}
          >
            {items.map((language: [string, number]) => {
              const lg = language[0];
              return (
                lg?.length && (
                  <li key={`tooltip_${lg}`}>
                    <Typography
                      sx={{
                        fontSize: '12px',
                        fontWeight: 400,
                      }}
                    >
                      {lg}
                    </Typography>
                  </li>
                )
              );
            })}
          </ul>
        </div>
      }
    >
      <div style={{ width: '310px', padding: '9px 0' }}>
        <div
          ref={languagesNode}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            overflow: 'hidden',
            cursor: 'pointer',
            height: '0',
            opacity: '0',
          }}
        >
          {items?.map((language: [string, number]) => {
            const lg = language[0];
            return lg?.length && <Tag key={lg} label={lg} width="auto" />;
          })}
          <Tag
            label={`+${items.length - displayingLength}`}
            width="auto"
            ref={indicatorNode}
          />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            overflow: 'hidden',
            cursor: 'pointer',
          }}
        >
          {items
            ?.slice(0, displayingLength)
            .map((language: [string, number]) => {
              const lg = language[0];
              return lg?.length && <Tag key={lg} label={lg} width="auto" />;
            })}
          {items?.length > displayingLength && (
            <Tag label={`+${items.length - displayingLength}`} width="auto" />
          )}
        </div>
      </div>
    </Tooltip>
  );
};
