/*
 * Copyright 2026 The Backstage Authors
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
import { useMemo } from 'react';
import * as runtime from 'react/jsx-runtime';
import { evaluateSync } from '@mdx-js/mdx';
import { MDXProvider, useMDXComponents } from '@mdx-js/react';
import type { MDXComponents, MDXContent } from 'mdx/types';
import remarkGfm from 'remark-gfm';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import Typography from '@mui/material/Typography';
import { defaultMdxComponents } from './defaultMdxComponents';

/**
 * Props for {@link MdxContent}.
 *
 * @public
 */
export type MdxContentProps = {
  template: string;
  data: Record<string, unknown>;
  components?: MDXComponents;
};

const RenderError = ({ error }: FallbackProps) => (
  <Typography color="error">
    Failed to render the MDX template: {error.message}
  </Typography>
);

const compile = (template: string): MDXContent => {
  try {
    return evaluateSync(template, {
      ...runtime,
      useMDXComponents,
      remarkPlugins: [remarkGfm],
    }).default;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return () => <Typography color="error">{message}</Typography>;
  }
};

/**
 * Compiles and renders an MDX template, passing `data` to it as props.
 *
 * @public
 */
export const MdxContent = ({ template, data, components }: MdxContentProps) => {
  const Content = useMemo(() => compile(template), [template]);
  const mergedComponents = useMemo(
    () => ({ ...defaultMdxComponents, ...components }),
    [components],
  );

  return (
    <MDXProvider components={mergedComponents}>
      <ErrorBoundary FallbackComponent={RenderError} resetKeys={[template]}>
        <Content {...data} />
      </ErrorBoundary>
    </MDXProvider>
  );
};
