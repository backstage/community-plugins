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
import type { ReactElement } from 'react';
import { useRef, useState, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import MaterialTooltip from '@mui/material/Tooltip';
import { useResize } from '../hooks';

type ExtendedClassesProps = {
  tooltip?: {
    [key: string]: string | number;
  };
  arrow?: {
    [key: string]: string | number;
  };
};

type TooltipProps = {
  children: string | ReactElement;
  tooltipContent: string | ReactElement;
  isAlwaysVisible?: boolean;
  extendedClasses?: ExtendedClassesProps;
};

export const Tooltip = ({
  children,
  tooltipContent,
  isAlwaysVisible = true,
  extendedClasses = {},
}: TooltipProps) => {
  const theme = useTheme();
  const node = useRef<HTMLDivElement | null>(null);

  const [isEllipsis, setIsEllipsis] = useState(false);

  const compare = useCallback(() => {
    const firstChild = node?.current?.children?.length
      ? Array.from(node?.current?.children)?.[0]
      : null;
    let refChild = null;

    if (firstChild) {
      refChild = firstChild?.children?.length
        ? firstChild?.children?.[0]
        : firstChild;
    }

    if (refChild) setIsEllipsis(refChild?.scrollWidth > refChild?.clientWidth);
  }, []);

  useResize(compare);

  const isDisabled = isAlwaysVisible ? false : !isEllipsis;

  return (
    <MaterialTooltip
      title={tooltipContent}
      disableHoverListener={isDisabled}
      placement="top"
      arrow
      disableInteractive
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor:
              theme.palette.mode === 'light'
                ? '#232F3E'
                : theme.palette.background.default,
            ...extendedClasses?.tooltip,
            marginBottom: '0.8rem',
          },
        },
        arrow: {
          sx: {
            color:
              theme.palette.mode === 'light'
                ? '#232F3E'
                : theme.palette.background.default,
            overflow: 'inherit',
            bottom: 0,
            marginBottom: '-0.25em',
          },
        },
      }}
    >
      <span
        style={{
          cursor: 'auto',
          display: 'block',
          width: 'max-content',
        }}
        ref={node}
      >
        {children}
      </span>
    </MaterialTooltip>
  );
};
