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
import type { KeyboardEvent } from 'react';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { CommentSegment } from '@backstage-community/plugin-pointing-poker-common';
import { CharacterAvatar } from './CharacterAvatar';
import { useMentionSearch } from './hooks/useMentionSearch';
import type { MentionUser } from './hooks/useMentionSearch';

export type CommentComposerHandle = Readonly<{
  clear: () => void;
  focus: () => void;
  getPlainText: () => string;
  getSegments: () => CommentSegment[];
}>;

type CommentComposerProps = Readonly<{
  onChange?: (plainText: string) => void;
  placeholder?: string;
}>;

type MentionContext = Readonly<{
  atOffset: number;
  endOffset: number;
  query: string;
  textNode: Text;
}>;

const EDITOR_CLASS = 'pp-comment-editor';

const normalize = (text: string): string => text.replace(/\u00A0/gu, ' ');

// Finds an in-progress "@query" immediately before a collapsed caret.
const getMentionContext = (): MentionContext | null => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) {
    return null;
  }
  const range = selection.getRangeAt(0);
  const node = range.startContainer;
  if (node.nodeType !== Node.TEXT_NODE) {
    return null;
  }
  const caretOffset = range.startOffset;
  const upToCaret = (node.textContent ?? '').slice(0, caretOffset);
  const match = upToCaret.match(/(?:^|\s)@(\S*)$/u);
  if (!match) {
    return null;
  }
  const query = match[1];
  return {
    atOffset: caretOffset - query.length - 1,
    endOffset: caretOffset,
    query,
    textNode: node as Text,
  };
};

const createChip = (user: MentionUser): HTMLSpanElement => {
  const chip = document.createElement('span');
  chip.setAttribute('contenteditable', 'false');
  chip.dataset.accountId = user.id;
  chip.dataset.displayName = user.displayName;
  chip.style.background =
    'color-mix(in srgb, var(--bui-bg-info) 22%, transparent)';
  chip.style.borderRadius = 'var(--bui-radius-2)';
  chip.style.color = 'var(--bui-fg-info)';
  chip.style.fontWeight = '500';
  chip.style.padding = '0 var(--bui-space-1)';
  chip.textContent = `@${user.displayName}`;
  return chip;
};

export const CommentComposer = forwardRef<
  CommentComposerHandle,
  CommentComposerProps
>(({ onChange, placeholder = 'Add a comment…' }, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const mentionRef = useRef<MentionContext | null>(null);
  const [query, setQuery] = useState<null | string>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { loading, users } = useMentionSearch(query);

  const getPlainText = useCallback(
    () => normalize(editorRef.current?.textContent ?? ''),
    [],
  );

  const serialize = useCallback((): CommentSegment[] => {
    const root = editorRef.current;
    if (!root) {
      return [];
    }
    const segments: CommentSegment[] = [];
    const pushText = (text: string) => {
      if (!text) {
        return;
      }
      const last = segments[segments.length - 1];
      if (last && last.type === 'text') {
        segments[segments.length - 1] = {
          text: last.text + text,
          type: 'text',
        };
      } else {
        segments.push({ text, type: 'text' });
      }
    };
    const walk = (node: Node) => {
      node.childNodes.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          pushText(normalize(child.textContent ?? ''));
        } else if (child.nodeName === 'BR') {
          pushText('\n');
        } else if (child instanceof HTMLElement && child.dataset.accountId) {
          segments.push({
            id: child.dataset.accountId,
            text: child.textContent ?? `@${child.dataset.displayName ?? ''}`,
            type: 'mention',
          });
        } else {
          walk(child);
        }
      });
    };
    walk(root);
    while (segments[0]?.type === 'text' && !segments[0].text.trim()) {
      segments.shift();
    }
    while (
      segments.length > 0 &&
      segments[segments.length - 1].type === 'text' &&
      !(segments[segments.length - 1] as { text: string }).text.trim()
    ) {
      segments.pop();
    }
    return segments;
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      clear: () => {
        if (editorRef.current) {
          editorRef.current.innerHTML = '';
        }
        mentionRef.current = null;
        setQuery(null);
        onChange?.('');
      },
      focus: () => editorRef.current?.focus(),
      getPlainText,
      getSegments: serialize,
    }),
    [getPlainText, onChange, serialize],
  );

  const closeMentions = useCallback(() => {
    mentionRef.current = null;
    setQuery(null);
  }, []);

  const handleInput = useCallback(() => {
    const context = getMentionContext();
    mentionRef.current = context;
    setQuery(context ? context.query : null);
    setActiveIndex(0);
    onChange?.(getPlainText());
  }, [getPlainText, onChange]);

  const insertMention = useCallback(
    (user: MentionUser) => {
      const context = mentionRef.current;
      const root = editorRef.current;
      if (!context || !root) {
        return;
      }
      const range = document.createRange();
      try {
        range.setStart(context.textNode, context.atOffset);
        range.setEnd(context.textNode, context.endOffset);
      } catch {
        closeMentions();
        return;
      }
      range.deleteContents();
      const chip = createChip(user);
      range.insertNode(chip);
      const space = document.createTextNode(' ');
      chip.after(space);

      root.focus();
      const selection = window.getSelection();
      const caret = document.createRange();
      caret.setStartAfter(space);
      caret.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(caret);

      closeMentions();
      onChange?.(getPlainText());
    },
    [closeMentions, getPlainText, onChange],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (query === null || users.length === 0) {
        return;
      }
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setActiveIndex(index => (index + 1) % users.length);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setActiveIndex(index => (index - 1 + users.length) % users.length);
          break;
        case 'Enter':
        case 'Tab':
          event.preventDefault();
          insertMention(users[activeIndex]);
          break;
        case 'Escape':
          event.preventDefault();
          closeMentions();
          break;
        default:
          break;
      }
    },
    [activeIndex, closeMentions, insertMention, query, users],
  );

  const showDropdown = query !== null;

  return (
    <div style={{ position: 'relative' }}>
      <style>{`.${EDITOR_CLASS}:empty:before{content:attr(data-placeholder);color:var(--bui-fg-secondary);}.${EDITOR_CLASS}:focus-visible{outline:2px solid var(--bui-border-info);outline-offset:-1px;}`}</style>
      {showDropdown && (
        <div
          style={{
            background: 'var(--bui-bg-neutral-1)',
            border: '1px solid var(--bui-border-1)',
            borderRadius: 'var(--bui-radius-3)',
            bottom: '100%',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.15)',
            left: 0,
            marginBottom: 'var(--bui-space-1)',
            maxHeight: '15rem',
            overflowY: 'auto',
            padding: 'var(--bui-space-1) 0',
            position: 'absolute',
            width: '100%',
            zIndex: 50,
          }}
        >
          {loading && users.length === 0 && (
            <p
              style={{
                color: 'var(--bui-fg-secondary)',
                fontSize: '0.875rem',
                margin: 0,
                padding: 'var(--bui-space-2) var(--bui-space-3)',
              }}
            >
              Searching…
            </p>
          )}
          {!loading && users.length === 0 && (
            <p
              style={{
                color: 'var(--bui-fg-secondary)',
                fontSize: '0.875rem',
                margin: 0,
                padding: 'var(--bui-space-2) var(--bui-space-3)',
              }}
            >
              No matching users
            </p>
          )}
          {users.map((user, index) => (
            <button
              key={user.id}
              onClick={() => insertMention(user)}
              onMouseDown={event => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              style={{
                alignItems: 'center',
                background:
                  index === activeIndex
                    ? 'var(--bui-bg-neutral-2)'
                    : 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                fontSize: '0.875rem',
                gap: 'var(--bui-space-2)',
                padding: '0.375rem var(--bui-space-3)',
                textAlign: 'left',
                width: '100%',
              }}
              type="button"
            >
              <CharacterAvatar
                name={user.displayName}
                seed={user.avatarUrl}
                size={24}
                style="photo"
              />
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.displayName}
              </span>
            </button>
          ))}
        </div>
      )}

      <div
        aria-label="Add a comment"
        className={EDITOR_CLASS}
        contentEditable
        data-placeholder={placeholder}
        onBlur={() => window.setTimeout(closeMentions, 150)}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        ref={editorRef}
        role="textbox"
        style={{
          background: 'var(--bui-bg-app)',
          border: '1px solid var(--bui-border-1)',
          borderRadius: 'var(--bui-radius-3)',
          fontSize: '0.875rem',
          minHeight: 80,
          overflowY: 'auto',
          padding: 'var(--bui-space-2) var(--bui-space-3)',
          resize: 'vertical',
          width: '100%',
        }}
        suppressContentEditableWarning
        tabIndex={0}
      />
    </div>
  );
});

CommentComposer.displayName = 'CommentComposer';
