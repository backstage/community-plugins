/*
 * Copyright 2022 The Backstage Authors
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

import { makeStyles } from '@material-ui/core/styles';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import rehypeMermaid from 'rehype-mermaid';
import { useEffect } from 'react';
import { useMermaid } from './useMermaid';

// Temporary fix for backstage's MarkdownContent missing plugin extensibility
// TODO: Remove when https://github.com/backstage/backstage/issues/31388 is resolved

const useStyles = makeStyles(
  theme => ({
    markdown: {
      '& table': {
        borderCollapse: 'collapse',
        border: `1px solid ${theme.palette.border}`,
      },
      '& th, & td': {
        border: `1px solid ${theme.palette.border}`,
        padding: theme.spacing(1),
      },
      '& td': {
        wordBreak: 'break-word',
        overflow: 'hidden',
        verticalAlign: 'middle',
        lineHeight: '1',
        margin: 0,
        padding: theme.spacing(3, 2, 3, 2.5),
        borderBottom: 0,
      },
      '& th': {
        backgroundColor: theme.palette.background.paper,
      },
      '& tr': {
        backgroundColor: theme.palette.background.paper,
      },
      '& tr:nth-child(odd)': {
        backgroundColor: theme.palette.background.default,
      },
      '& a': {
        color: theme.palette.link,
      },
      '& img': {
        maxWidth: '100%',
      },
    },
  }),
  { name: 'AdrMarkdownContent' },
);

export type AdrMarkdownContentProps = {
  /** The markdown content to render */
  content: string;
  /** Function to transform image URLs */
  transformImageUri?: (src: string) => string;
  /** Target attribute for links (e.g., '_blank') */
  linkTarget?: string;
};

/**
 * Renders markdown content with support for GitHub Flavored Markdown
 * and Mermaid diagrams. Uses rehype-mermaid plugin with 'pre-mermaid'
 * strategy for client-side rendering.
 *
 * This component replaces the regex-based ContentSplitter approach
 * with proper AST-based markdown parsing that correctly handles
 * nested structures (e.g., mermaid examples within code blocks).
 *
 * @public
 */
export const AdrMarkdownContent = ({
  content,
  transformImageUri,
  linkTarget,
}: AdrMarkdownContentProps) => {
  const classes = useStyles();
  const mermaid = useMermaid();

  useEffect(() => {
    mermaid.run({
      querySelector: '.mermaid',
    });
  }, [content, mermaid]);

  return (
    <div className={classes.markdown}>
      <ReactMarkdown
        remarkPlugins={[gfm]}
        rehypePlugins={[[rehypeMermaid, { strategy: 'pre-mermaid' }]]}
        urlTransform={transformImageUri}
        components={{
          a: ({ node, children, ...props }) => (
            <a {...props} target={linkTarget || props.target}>
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
