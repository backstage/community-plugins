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
import { MarkdownContent } from '@backstage/core-components';
import MDEditor from '@uiw/react-md-editor';
import { makeStyles, useTheme } from '@material-ui/core';

/**
 * @public
 * Use this props to specify which rendering mode the MarkdownRenderer should operate in.
 *
 * - `'backstage'`: Indicates that the renderer should use the Backstage built-in style.
 * - `'md-editor'`: Indicates that the renderer should use the Markdown Editor (WYSIWYG) style.
 *
 */
export type MarkdownRendererTypeProps = 'backstage' | 'md-editor';

export interface MarkdownRendererProps {
  content: string;
  rendererType?: MarkdownRendererTypeProps;
}

// Custom styles for the MDEditor to match Backstage MUI theme
const useStyles = makeStyles(theme => ({
  mdEditor: {
    color: theme.palette.text.primary,
    '& a': {
      color: theme.palette.primary.main,
    },
    '& code': {
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.primary,
      borderRadius: theme.shape.borderRadius,
    },
    '& pre': {
      backgroundColor: theme.palette.background.default,
      padding: theme.spacing(1),
      borderRadius: theme.shape.borderRadius,
    },
    '& blockquote': {
      paddingLeft: theme.spacing(1),
      color: theme.palette.text.secondary,
    },
    '& table': {
      '& thead th': {
        color: theme.palette.text.primary,
        backgroundColor:
          theme.palette.type === 'dark'
            ? theme.palette.background.default
            : theme.palette.background.paper,
      },
      '& th, & td': {
        border: 0,
      },
      '& tbody tr:nth-of-type(odd)': {
        backgroundColor:
          theme.palette.type === 'dark'
            ? theme.palette.action.selected
            : theme.palette.action.hover,
      },
      '& tbody tr:nth-of-type(even)': {
        backgroundColor:
          theme.palette.type === 'dark'
            ? theme.palette.background.paper
            : theme.palette.background.paper,
      },
      '& tbody td': {
        borderTop: `1px solid ${theme.palette.divider}`,
      },
    },
  },
}));

export const MarkdownRenderer = ({
  content,
  rendererType = 'backstage',
}: MarkdownRendererProps) => {
  const theme = useTheme();
  const classes = useStyles();

  switch (rendererType) {
    case 'md-editor':
      return (
        <MDEditor.Markdown
          source={content}
          className={classes.mdEditor}
          style={{
            backgroundColor: 'transparent',
            color: theme.palette.text.primary,
            fontFamily: theme.typography.fontFamily,
          }}
        />
      );
    case 'backstage':
    default:
      return <MarkdownContent content={content} />;
  }
};
