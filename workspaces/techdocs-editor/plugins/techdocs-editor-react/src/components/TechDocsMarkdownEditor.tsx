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

import { useCallback, useEffect, useRef, useState } from 'react';
import { Text } from '@backstage/ui';
import '@toast-ui/editor/dist/toastui-editor.css';
import styles from './TechDocsMarkdownEditor.module.css';
import {
  MERMAID_CLASS_NAME,
  MERMAID_SOURCE_ATTRIBUTE,
  buildMermaidCodeBlockTokens,
  isMermaidInfo,
} from './mermaidCodeBlock';

// Lazy-load Toast UI to avoid SSR issues
const EditorPromise = import('@toast-ui/react-editor').then(m => m.Editor);

// Lazy-load Mermaid the same way — it's a large dependency and only needed
// once a document actually contains a ```mermaid fence, so we keep it out of
// the initial editor bundle.
const MermaidPromise = import('mermaid').then(m => m.default);

// Delay (ms) between the last content change and re-rendering diagrams. Toast
// UI repaints its preview asynchronously after `onChange`, so we wait a beat
// for the fresh `.mermaid` nodes to exist before processing them, and we
// coalesce bursts of keystrokes into a single render pass.
const MERMAID_RENDER_DEBOUNCE_MS = 250;

/**
 * Props for {@link TechDocsMarkdownEditor}.
 * @public
 */
export type TechDocsMarkdownEditorProps = {
  /** Initial markdown content */
  initialContent: string;
  /** Called when the markdown content changes */
  onChange: (markdown: string) => void;
  /** If true, show source markdown mode; false = WYSIWYG */
  sourceMode?: boolean;
  /**
   * Called when the user picks an image via Toast UI's built-in image
   * toolbar button. Should stage/upload the file and resolve with the URL
   * (typically a relative markdown path) and alt text to insert. If omitted,
   * Toast UI falls back to embedding the raw file as a data URI.
   */
  onUploadImage?: (file: File) => Promise<{ url: string; altText: string }>;
  /**
   * Resolves an image's markdown `destination` (as written in the doc, e.g.
   * a relative path like `./diagram.png`) to a `src` usable for preview —
   * typically a `data:` URI built from the image's actual (possibly staged)
   * content. Relative paths on their own don't resolve to anything in the
   * editor's page, so without this every inserted/existing image would show
   * as a broken-image icon. Falls back to the original destination
   * unchanged if omitted or if it returns the input unresolved (e.g. for
   * external URLs).
   */
  resolveImageSrc?: (destination: string) => string;
};

/**
 * A WYSIWYG markdown editor wrapping Toast UI Editor.
 * Supports a source-mode toggle via the `sourceMode` prop.
 * @public
 */
export function TechDocsMarkdownEditor({
  initialContent,
  onChange,
  sourceMode = false,
  onUploadImage,
  resolveImageSrc,
}: TechDocsMarkdownEditorProps) {
  const editorRef = useRef<any>(null);
  const [EditorComponent, setEditorComponent] = useState<any>(null);
  const [editorLoadError, setEditorLoadError] = useState<string | undefined>();

  // Outer wrapper element, used to scope Mermaid DOM queries to this editor
  // instance so we never touch diagrams belonging to another editor on the
  // same page.
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Cached Mermaid module once it has finished loading.
  const mermaidRef = useRef<any>(null);
  // Pending debounce timer for diagram rendering.
  const mermaidTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Find every `.mermaid` block currently in this editor's DOM and (re)render
  // the ones that Toast UI has repainted as raw source. Toast UI recreates the
  // preview markup on each change, so processed diagrams are discarded and the
  // fences reappear as text — we simply reprocess whatever is unprocessed.
  //
  // When `force` is true (e.g. a light/dark theme switch) we restore each
  // block's original source from `data-mermaid-source`, clear the processed
  // flag, and re-render so the diagram picks up the new Mermaid theme.
  const renderMermaid = useCallback((force = false) => {
    const mermaid = mermaidRef.current;
    const root = wrapperRef.current;
    if (!mermaid || !root) return;

    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>(`.${MERMAID_CLASS_NAME}`),
    );
    if (nodes.length === 0) return;

    const isDark = document.body.getAttribute('data-theme-mode') === 'dark';
    // `initialize` is idempotent and cheap; calling it before each pass keeps
    // the diagram theme in sync with the Backstage light/dark toggle.
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      suppressErrorRendering: true,
      fontFamily: 'inherit',
      theme: isDark ? 'dark' : 'default',
    });

    for (const node of nodes) {
      if (force) {
        const source = node.getAttribute(MERMAID_SOURCE_ATTRIBUTE);
        if (source !== null) node.textContent = decodeURIComponent(source);
        node.removeAttribute('data-processed');
      }
    }

    const pending = nodes.filter(
      node =>
        node.getAttribute('data-processed') !== 'true' &&
        (node.textContent ?? '').trim().length > 0,
    );
    if (pending.length === 0) return;

    // `run` is async and throws on invalid syntax (common while the user is
    // still typing a diagram). We swallow those errors so a half-written
    // diagram just stays as-is instead of crashing the preview.
    Promise.resolve(mermaid.run({ nodes: pending })).catch(() => {});
  }, []);

  // Debounced entry point used by change/mode handlers. Stable across
  // renders (refs only) so it can safely be listed as an effect dependency.
  const scheduleMermaidRender = useCallback(
    (force = false) => {
      if (mermaidTimerRef.current) clearTimeout(mermaidTimerRef.current);
      mermaidTimerRef.current = setTimeout(
        () => renderMermaid(force),
        MERMAID_RENDER_DEBOUNCE_MS,
      );
    },
    [renderMermaid],
  );

  useEffect(() => {
    let mounted = true;
    EditorPromise.then(Editor => {
      if (mounted) setEditorComponent(() => Editor);
    }).catch(err => {
      if (mounted) {
        setEditorLoadError(
          `Failed to load editor: ${err?.message ?? String(err)}`,
        );
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Sync editor mode when sourceMode prop changes
  useEffect(() => {
    const instance = editorRef.current?.getInstance?.();
    if (!instance) return;
    if (sourceMode) {
      instance.changeMode('markdown');
    } else {
      instance.changeMode('wysiwyg');
    }
    // The preview is repainted on mode switch, so reprocess diagrams.
    scheduleMermaidRender();
  }, [sourceMode, scheduleMermaidRender]);

  // Load Mermaid, render any diagrams already present in the initial content,
  // and re-render on Backstage light/dark theme changes.
  useEffect(() => {
    let mounted = true;
    let observer: MutationObserver | undefined;

    MermaidPromise.then(mermaid => {
      if (!mounted) return;
      mermaidRef.current = mermaid;
      // Initial pass for content loaded before Mermaid finished loading.
      scheduleMermaidRender(true);

      // Re-theme diagrams when the user toggles light/dark. Toast UI won't
      // repaint the preview on its own for a theme change, so we force it.
      observer = new MutationObserver(() => scheduleMermaidRender(true));
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['data-theme-mode'],
      });
    }).catch(() => {
      // Mermaid failing to load must not break the editor; ```mermaid fences
      // simply stay rendered as plain code blocks.
    });

    return () => {
      mounted = false;
      observer?.disconnect();
      if (mermaidTimerRef.current) clearTimeout(mermaidTimerRef.current);
    };
  }, [scheduleMermaidRender]);

  if (editorLoadError) {
    return (
      <div className={styles.editorWrapper}>
        <Text color="danger" variant="body-small">
          {editorLoadError}
        </Text>
      </div>
    );
  }

  if (!EditorComponent) {
    return <div className={styles.editorWrapper}>Loading editor…</div>;
  }

  // No theme prop is passed to the Toast UI editor here. Instead,
  // TechDocsMarkdownEditor.module.css targets `body[data-theme-mode="dark"]`
  // (set by Backstage's UnifiedThemeProvider) as an ancestor selector to
  // restyle the editor's internal elements. This tracks live theme changes
  // without remounting the editor, which the official `theme="dark"` prop
  // would require.
  return (
    <div className={styles.editorWrapper} ref={wrapperRef}>
      <EditorComponent
        ref={editorRef}
        initialValue={initialContent || ' '}
        previewStyle="vertical"
        height="100%"
        initialEditType={sourceMode ? 'markdown' : 'wysiwyg'}
        useCommandShortcut
        onChange={() => {
          const instance = editorRef.current?.getInstance?.();
          if (instance) {
            onChange(instance.getMarkdown());
          }
          // Re-render diagrams once the preview has been repainted.
          scheduleMermaidRender();
        }}
        toolbarItems={[
          ['heading', 'bold', 'italic', 'strike'],
          ['hr', 'quote'],
          ['ul', 'ol', 'task', 'indent', 'outdent'],
          ['table', 'link', 'image'],
          ['code', 'codeblock'],
        ]}
        customHTMLRenderer={{
          // Render ```mermaid fences as a `.mermaid` container holding the
          // raw diagram source. Toast UI's renderer is synchronous and
          // Mermaid is async, so we can't produce the SVG here — instead we
          // emit the source (also stashed in `data-mermaid-source` so it
          // survives re-theming) and let `renderMermaid` turn it into a
          // diagram after the preview paints. Any other language falls back
          // to Toast UI's default code-block rendering via `context.origin`.
          codeBlock: (node: any, context: any) => {
            if (!isMermaidInfo(node.info)) {
              return context.origin();
            }
            return buildMermaidCodeBlockTokens(node.literal ?? '');
          },
          // Images are written to markdown as relative paths (e.g.
          // `./diagram.png`), which is correct for the saved document, but
          // doesn't resolve to anything on the editor's own page — without
          // this override every image (existing or newly inserted) would
          // render as a broken-image icon. `resolveImageSrc` swaps in a
          // `data:` URI built from the image's actual content when one is
          // available, leaving the destination untouched otherwise (e.g.
          // external URLs).
          image: (node: any, context: any) => {
            const { destination, title } = node;
            context.skipChildren();
            const src = resolveImageSrc
              ? resolveImageSrc(destination)
              : destination;
            return {
              type: 'openTag',
              tagName: 'img',
              selfClose: true,
              attributes: {
                src,
                alt: context.getChildrenText(node),
                ...(title ? { title } : {}),
              },
            };
          },
        }}
        hooks={{
          // Route Toast UI's own "insert image" toolbar button through the
          // app's upload pipeline via `onUploadImage`, instead of letting it
          // fall back to embedding the raw file as an inline base64 data
          // URI (which isn't persisted by the backend and gets
          // lost/corrupted the next time this file is opened).
          //
          // IMPORTANT: Toast UI still performs its own default data-URI
          // embed *in addition to* calling this hook unless the hook
          // explicitly returns `false`. Without that, both insertions race:
          // the real (relative-path) image link from `onUploadImage`, and a
          // giant raw base64 payload from Toast UI's default handling —
          // which is what was corrupting documents on revisit.
          addImageBlobHook: (
            blob: Blob,
            callback: (url: string, altText: string) => void,
          ) => {
            if (!onUploadImage) return false;
            onUploadImage(blob as File)
              .then(({ url, altText }) => callback(url, altText))
              .catch(() => {
                // Swallow the error here; TechDocsEditorPage surfaces upload
                // failures via its own error state.
              });
            return false;
          },
        }}
      />
    </div>
  );
}
