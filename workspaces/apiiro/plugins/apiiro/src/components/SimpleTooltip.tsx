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
import { CustomTooltip } from './common/CustomTooltip';

interface SimpleTooltipProps {
  /**
   * The content to display inside the tooltip trigger
   */
  children: JSX.Element | string | number;

  /**
   * The tooltip content to display - can be string or JSX
   */
  title: string | JSX.Element;

  /**
   * Tooltip placement
   */
  placement?: 'top' | 'bottom' | 'left' | 'right';

  /**
   * Custom tooltip props to override defaults
   */
  tooltipProps?: any;

  /**
   * If true, the content will be centered horizontally and vertically.
   */
  centered?: boolean;
}

/**
 * SimpleTooltip component - A reusable tooltip wrapper without centering
 *
 * @example
 * <SimpleTooltip title="Repository information">
 *   <span>My Repository</span>
 * </SimpleTooltip>
 *
 * @example
 * <SimpleTooltip title="Custom tooltip">
 *   <div>Custom content</div>
 * </SimpleTooltip>
 *
 * @example
 * <SimpleTooltip title={<div><a href="...">Link</a><br/>More content</div>}>
 *   <span>Hover me</span>
 * </SimpleTooltip>
 */
export const SimpleTooltip = ({
  children,
  title,
  placement = 'top',
  tooltipProps,
  centered = false,
}: SimpleTooltipProps) => {
  // CustomTooltip doesn't support offset or PopperProps, but we keep the API for compatibility
  return (
    <CustomTooltip
      title={title}
      placement={placement}
      centered={centered}
      // Spread any additional props that CustomTooltip supports (enterDelay, leaveDelay, disableInteractive)
      {...tooltipProps}
    >
      {children}
    </CustomTooltip>
  );
};

export default SimpleTooltip;
