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
import styled from 'styled-components';
// eslint-disable-next-line
import { colors, fontSizes } from '../typedefs/styled';

export interface TextProps {
  className?: string;
  size?: keyof typeof fontSizes;
  bold?: boolean;
  semiBold?: boolean;
  capitalize?: boolean;
  italic?: boolean;
  color?: keyof typeof colors;
  uppercase?: boolean;
  noWrap?: boolean;
  titleHeight?: boolean;
  pointer?: boolean;
}

function textTransform(props: any) {
  if (props.capitalize) {
    return 'capitalize';
  }

  if (props.uppercase) {
    return 'uppercase';
  }

  return 'none';
}

const Text = styled.span<TextProps>`
  font-family: ${props => props.theme.fontFamilies.regular};
  font-size: ${props =>
    props.theme.fontSizes[props.size as keyof typeof fontSizes]};
  font-weight: ${props => {
    if (props.bold) return '800';
    else if (props.semiBold) return '600';
    return '400';
  }};
  text-transform: ${textTransform};

  font-style: ${props => (props.italic ? 'italic' : 'normal')};
  color: ${props => props.theme.colors[props.color as keyof typeof colors]};

  ${props => props.noWrap && 'white-space: nowrap'};
  ${props => props.titleHeight && 'line-height: 1.75'};
  ${props => props.pointer && 'cursor: pointer'};
`;

Text.defaultProps = {
  size: 'medium',
};

export default Text;
