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
import { NavLink as _NavLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { StyledProps } from '../types/styled';

enum Variant {
  SECONDARY = 'secondary',
}

// New Typography
export const Heading1: React.ComponentType<any> = styled('h1')(() => ({
  fontSize: '6rem',
  fontWeight: 600,
  lineHeight: '8rem',
}));

export const Heading2: React.ComponentType<any> = styled('h2')(() => ({
  fontSize: '5rem',
  fontWeight: 600,
  lineHeight: '7rem',
}));

export const Heading3: React.ComponentType<any> = styled('h3')(() => ({
  fontSize: '4.5rem',
  fontWeight: 600,
  lineHeight: '6rem',
}));

export const Heading4: React.ComponentType<any> = styled('h4')(() => ({
  fontSize: '4rem',
  fontWeight: 600,
  lineHeight: '5rem',
}));

export const Heading5: React.ComponentType<any> = styled('h5')(() => ({
  fontSize: '3.5rem',
  fontWeight: 600,
  lineHeight: '5rem',
}));

export const Heading6: React.ComponentType<any> = styled('h6')(() => ({
  fontSize: '3rem',
  fontWeight: 600,
  lineHeight: '4rem',
  textTransform: 'uppercase',
}));

export const SubHeading1: React.ComponentType<any> = styled('div')(() => ({
  fontSize: '5rem',
  fontWeight: 400,
  lineHeight: '7rem',
  color: '#6c7393',
}));

export const SubHeading2: React.ComponentType<any> = styled('div')(() => ({
  fontSize: '4.5rem',
  fontWeight: 300,
  lineHeight: '6rem',
  color: '#6c7393',
}));

export const SubHeading3: React.ComponentType<any> = styled(
  ({ variant, ...props }: StyledProps & { variant?: Variant }) => (
    <div {...props} data-variant={variant} />
  ),
)(() => ({
  fontSize: '4rem',
  fontWeight: 300,
  lineHeight: '6rem',
  color: '#21263f',
  '&[data-variant="secondary"]': {
    color: '#6c7393',
  },
}));

export const SubHeading4: React.ComponentType<any> = styled('div')(() => ({
  fontSize: '3.5rem',
  fontWeight: 300,
  lineHeight: '5rem',
  color: '#6c7393',
}));

export const Caption1: React.ComponentType<any> = styled('div')(() => ({
  fontSize: '3rem',
  fontWeight: 400,
  lineHeight: '4rem',
}));

export const Caption2: React.ComponentType<any> = styled('div')(() => ({
  fontSize: '3rem',
  fontWeight: 300,
  lineHeight: '4rem',
}));

export const Caption3: React.ComponentType<any> = styled('div')(() => ({
  fontSize: '2.75rem',
  fontWeight: 400,
  lineHeight: '3rem',
}));

export const Caption4: React.ComponentType<any> = styled('div')(() => ({
  fontSize: '2.75rem',
  fontWeight: 300,
  lineHeight: '3rem',
}));

export const FontSerifSmall: React.ComponentType<any> = styled('span')(() => ({
  fontFamily: 'Courier',
  fontSize: '3rem',
  fontWeight: 400,
  lineHeight: '4rem',
  overflow: 'hidden',
}));

export const FontSerifLarge: React.ComponentType<any> = styled('span')(() => ({
  fontFamily: 'Courier',
  fontSize: '3.5rem',
  fontWeight: 400,
  lineHeight: '5rem',
  overflow: 'hidden',
}));

// Old typography
export const Title: React.ComponentType<any> = styled('h1')(() => ({
  fontSize: '3.25em',
  fontWeight: 700,
  marginBottom: '5rem',
}));

export const Subtitle: React.ComponentType<any> = styled('h2')(() => ({
  fontSize: '2.75em',
  marginBottom: '4rem',
}));

export const Heading: React.ComponentType<any> = styled('h3')(() => ({
  fontSize: '1.25em',
  fontWeight: 700,
  '&:not(:last-child)': {
    marginBottom: '2rem',
  },
}));

export const Paragraph: React.ComponentType<any> = styled('p')(() => ({
  fontSize: '3.5rem',
  fontWeight: 300,
  lineHeight: '5rem',
  '&:not(:last-child)': {
    marginBottom: '2rem',
  },
}));
export const Small: React.ComponentType<any> = styled('small')(() => ({
  color: '#414558',
  fontSize: '3rem',
  fontWeight: 300,
}));

export const Light: React.ComponentType<any> = styled('span')(() => ({
  fontWeight: 300,
}));

export const Strong: React.ComponentType<any> = styled('strong')(() => ({
  fontWeight: 700,
}));

export const Emphasize: React.ComponentType<any> = styled('em')(() => ({}));

export const Underline: React.ComponentType<any> = styled('u')(() => ({}));

export const Code: React.ComponentType<any> = styled('code')(() => ({
  height: '5rem',
  padding: '0 1.5rem',
  border: '0.125rem solid #b6b9c9',
  borderRadius: '1rem',
  backgroundColor: '#f6f6f9',
  fontSize: '3rem',
  fontFamily: '"Courier Prime", sans-serif',
}));

export const NavLink: React.ComponentType<any> = styled(_NavLink)(() => ({
  display: 'inline-block',
}));

export const OrderedList: React.ComponentType<any> = styled('ol')(() => ({
  padding: '0 4rem',
  '&:not(:last-child)': {
    marginBottom: '2rem',
  },
}));

export const UnorderedList: React.ComponentType<any> = styled('ul')(() => ({
  padding: '0 4rem',
  '&:not(:last-child)': {
    marginBottom: '2rem',
  },
}));

export const ListItem: React.ComponentType<any> = styled('li')(() => ({
  '&:not(:last-child)': {
    marginBottom: '2rem',
  },
}));

export const EllipsisText: React.ComponentType<any> = styled('span')(() => ({
  display: 'block',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
}));

export const LinesEllipsisText: React.ComponentType<any> = styled('span')<{
  lines?: number;
}>(({ lines }) => ({
  overflow: 'hidden',
  overflowWrap: 'anywhere',
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: lines ?? 2,
}));
