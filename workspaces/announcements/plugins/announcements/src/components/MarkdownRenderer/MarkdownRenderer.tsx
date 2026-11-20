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
import styles from './MarkdownRenderer.module.css';

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

export const MarkdownRenderer = ({
  content,
  rendererType = 'backstage',
}: MarkdownRendererProps) => {
  switch (rendererType) {
    case 'md-editor':
      return <MDEditor.Markdown source={content} className={styles.mdEditor} />;
    case 'backstage':
    default:
      return <MarkdownContent content={content} />;
  }
};
