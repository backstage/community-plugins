/*
 * Copyright 2020 The Backstage Authors
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

// Proper type declarations for third-party libraries
// These provide type safety without adding unused runtime dependencies

declare module 'monaco-editor/esm/vs/editor/common/standalone/standaloneEnums.js';

declare module 'monaco-editor/esm/vs/editor/common/services/editorBaseApi.js';

declare module 'monaco-editor/esm/vs/base/common/uri.js';

declare module 'monaco-editor/esm/vs/editor/common/core/range.js';

declare module 'markdown-it' {
  interface Options {
    html?: boolean;
    xhtmlOut?: boolean;
    breaks?: boolean;
    langPrefix?: string;
    linkify?: boolean;
    typographer?: boolean;
    quotes?: string | string[];
    highlight?: (str: string, lang: string, attrs: string) => string;
  }

  interface MarkdownIt {
    render(md: string, env?: any): string;
    renderInline(md: string, env?: any): string;
    use(plugin: any, ...params: any[]): MarkdownIt;
  }

  interface MarkdownItConstructor {
    new (options?: Options): MarkdownIt;
    (options?: Options): MarkdownIt;
  }

  const MarkdownIt: MarkdownItConstructor;
  export = MarkdownIt;
}

declare module 'graphql-ws' {
  export interface ExecutionResult<TData = any> {
    data?: TData;
    errors?: readonly any[];
    extensions?: any;
  }

  export interface ClientOptions {
    url: string;
    connectionParams?:
      | Record<string, unknown>
      | (() =>
          | Record<string, unknown>
          | Promise<Record<string, unknown>>
          | undefined)
      | undefined;
    on?: {
      connected?: (socket: any) => void;
      connecting?: () => void;
      closed?: () => void;
      error?: (error: any) => void;
      message?: (message: any) => void;
    };
  }

  export interface Client {
    subscribe: (payload: any, sink: any) => () => void;
    dispose: () => void;
  }

  export function createClient(options: ClientOptions): Client;
}

declare module 'graphql-config' {
  export interface GraphQLExtensionDeclaration {
    name: string;
  }

  export interface GraphQLProjectConfig {
    name?: string;
    schema?: string | string[];
    documents?: string | string[];
    extensions?: Record<string, any>;
    include?: string[];
    exclude?: string[];
  }

  export interface GraphQLConfig {
    filepath: string;
    dirpath: string;
    projects: Record<string, GraphQLProjectConfig>;
    extensions: Record<string, any>;
    getProject(name?: string): GraphQLProjectConfig;
    getDefault(): GraphQLProjectConfig;
  }

  export function loadConfig(options?: {
    filepath?: string;
    extensions?: GraphQLExtensionDeclaration[];
  }): Promise<GraphQLConfig>;
}
