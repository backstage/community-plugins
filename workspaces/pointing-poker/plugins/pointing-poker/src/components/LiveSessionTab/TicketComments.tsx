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
import { Fragment, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { Box, Button, ButtonIcon, Flex, Text } from '@backstage/ui';
import type { TicketComment } from '@backstage-community/plugin-pointing-poker-common';
import { CharacterAvatar } from './CharacterAvatar';
import { CommentComposer } from './CommentComposer';
import type { CommentComposerHandle } from './CommentComposer';
import { Markdown } from '../common/Markdown';
import { useTicketComments } from './hooks/useTicketComments';
import { formatRelativeTime } from './utils/relativeTime';

type TicketCommentsProps = Readonly<{
  ticketKey: string;
}>;

const isPending = (comment: TicketComment): boolean =>
  comment.id.startsWith('pending-');

const CommentRow = ({ comment }: Readonly<{ comment: TicketComment }>) => {
  const pending = isPending(comment);
  return (
    <Flex gap="3" style={{ opacity: pending ? 0.6 : 1 }}>
      <CharacterAvatar
        name={comment.author}
        seed={comment.authorAvatarUrl}
        size={36}
        style="photo"
      />
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Flex align="baseline" gap="2">
          <Text as="span" variant="body-small" weight="bold">
            {comment.author}
          </Text>
          {pending ? (
            <Text
              as="span"
              color="secondary"
              style={{ fontStyle: 'italic' }}
              variant="body-x-small"
            >
              Sending…
            </Text>
          ) : (
            comment.createdAt && (
              <Text as="span" color="secondary" variant="body-x-small">
                {formatRelativeTime(comment.createdAt)}
              </Text>
            )
          )}
        </Flex>
        {comment.body && (
          <Box style={{ marginTop: 2 }}>
            <Markdown text={comment.body} />
          </Box>
        )}
      </Box>
    </Flex>
  );
};

export const TicketComments = ({ ticketKey }: TicketCommentsProps) => {
  const { addComment, comments, loading } = useTicketComments(ticketKey);
  const composerRef = useRef<CommentComposerHandle>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [open, setOpen] = useState(false);

  const handlePost = () => {
    const composer = composerRef.current;
    if (!composer) {
      return;
    }
    const segments = composer.getSegments();
    const plainText = composer.getPlainText();
    if (!plainText.trim() || segments.length === 0) {
      return;
    }
    addComment(segments, plainText);
    composer.clear();
    setIsEmpty(true);
  };

  return (
    <Fragment>
      <Button
        iconStart={<MessageCircle size={16} />}
        onClick={() => setOpen(true)}
        variant="secondary"
      >
        Comments
        {comments.length > 0 && (
          <span
            style={{
              alignItems: 'center',
              background:
                'color-mix(in srgb, var(--bui-bg-info) 20%, transparent)',
              borderRadius: 'var(--bui-radius-full)',
              color: 'var(--bui-fg-info)',
              display: 'inline-flex',
              fontSize: '0.75rem',
              fontWeight: 500,
              justifyContent: 'center',
              marginLeft: 'var(--bui-space-2)',
              minWidth: 20,
              padding: '0 0.375rem',
            }}
          >
            {comments.length}
          </span>
        )}
      </Button>

      {open && (
        <Fragment>
          <button
            aria-label="Close comments"
            onClick={() => setOpen(false)}
            style={{
              background:
                'color-mix(in srgb, var(--bui-bg-app) 60%, transparent)',
              border: 'none',
              cursor: 'default',
              inset: 0,
              position: 'absolute',
              zIndex: 20,
            }}
            type="button"
          />
          <Flex
            direction="column"
            style={{
              background: 'var(--bui-bg-neutral-1)',
              borderLeft: '1px solid var(--bui-border-1)',
              bottom: 0,
              boxShadow: '-8px 0 24px rgba(0,0,0,0.2)',
              position: 'absolute',
              right: 0,
              top: 0,
              width: '85%',
              zIndex: 30,
            }}
          >
            <Flex
              align="center"
              justify="between"
              style={{
                borderBottom: '1px solid var(--bui-border-1)',
                flexShrink: 0,
                padding: 'var(--bui-space-3) var(--bui-space-4)',
              }}
            >
              <Text as="h3" variant="title-x-small" weight="bold">
                {`Comments (${comments.length})`}
              </Text>
              <ButtonIcon
                aria-label="Close comments"
                icon={<X size={16} />}
                onClick={() => setOpen(false)}
                variant="tertiary"
              />
            </Flex>

            {loading && comments.length === 0 ? (
              <Text
                as="p"
                color="secondary"
                style={{ padding: 'var(--bui-space-4)' }}
                variant="body-small"
              >
                Loading comments…
              </Text>
            ) : (
              <Flex
                direction="column"
                gap="4"
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: 'var(--bui-space-4)',
                }}
              >
                {comments.length === 0 ? (
                  <Text as="p" color="secondary" variant="body-small">
                    No comments yet.
                  </Text>
                ) : (
                  comments.map((comment, index) => (
                    <CommentRow comment={comment} key={comment.id ?? index} />
                  ))
                )}
              </Flex>
            )}

            <Flex
              direction="column"
              gap="3"
              style={{
                borderTop: '1px solid var(--bui-border-1)',
                flexShrink: 0,
                padding: 'var(--bui-space-3) var(--bui-space-4)',
              }}
            >
              <CommentComposer
                onChange={text => setIsEmpty(!text.trim())}
                ref={composerRef}
              />
              <Flex justify="end">
                <Button
                  iconStart={<Send size={16} />}
                  isDisabled={isEmpty}
                  onClick={handlePost}
                  variant="secondary"
                >
                  Post
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </Fragment>
      )}
    </Fragment>
  );
};
