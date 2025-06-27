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
import * as React from 'react';
import styled from 'styled-components';

type Props = {
  children: React.ReactNode;
  className?: string;
  column?: boolean;
  align?: boolean;
  alignItems?: string;
  height?: string;
  between?: boolean;
  center?: boolean;
  wide?: boolean;
  wrap?: boolean;
  shadow?: boolean;
  tall?: string;
  start?: string;
  end?: string;
  gap?: string;
  onMouseEnter?: React.ReactEventHandler;
  onMouseLeave?: React.ReactEventHandler;
  'data-testid'?: string;
};

const withStyles = (component: any) => styled(component)`
  display: flex;
  flex-direction: ${({ column }) => (column ? 'column' : 'row')};
  align-items: ${({ align, alignItems }) => {
    if (alignItems) {
      return alignItems;
    }
    return align ? 'center' : 'start';
  }};
  ${({ gap }) => gap && `gap: ${gap}px`};
  ${({ tall }) => tall && `height: 100%`};
  ${({ wide }) => wide && 'width: 100%'};
  ${({ wrap }) => wrap && 'flex-wrap: wrap'};
  ${({ start }) => start && 'justify-content: flex-start'};
  ${({ end }) => end && 'justify-content: flex-end'};
  ${({ between }) => between && 'justify-content: space-between'};
  ${({ center }) => center && 'justify-content: center'};
  ${({ shadow }) => shadow && 'box-shadow: 5px 10px 50px 3px #0000001a'};
`;

class Flex extends React.PureComponent<Props> {
  render() {
    const {
      className,
      onMouseEnter,
      onMouseLeave,
      'data-testid': dataTestId,
      children,
    } = this.props;
    return (
      <div
        data-testid={dataTestId}
        className={className}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </div>
    );
  }
}

export default withStyles(Flex);
