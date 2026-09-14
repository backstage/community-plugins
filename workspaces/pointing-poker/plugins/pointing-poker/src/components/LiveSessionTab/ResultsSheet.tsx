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
import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import {
  Box,
  Button,
  ButtonIcon,
  DialogTrigger,
  Flex,
  Popover,
  Text,
} from '@backstage/ui';
import { ResultsPanel } from './ResultsPanel';
import type { ConsensusStatus, VoteAnalysis } from './utils/consensus';
import { acceptChoices } from './utils/deck';

const STATUS_DOT: Record<ConsensusStatus, string> = {
  close: 'var(--bui-fg-success)',
  discuss: 'var(--bui-fg-secondary)',
  unanimous: 'var(--bui-fg-success)',
};

const STATUS_LABEL: Record<ConsensusStatus, string> = {
  close: 'Close enough',
  discuss: 'Needs discussion',
  unanimous: 'Unanimous',
};

type AcceptControlProps = Readonly<{
  onAccept: (value: string) => void;
  splittable: boolean;
  suggested: string;
}>;

const neighbourLabel = (option: string, suggested: string): string => {
  if (option === suggested) {
    return 'suggested';
  }
  return Number(option) < Number(suggested) ? 'one lower' : 'one higher';
};

// One-click Accept on the happy path; a caret opens a bounded override to the
// neighbouring deck card (±1 step) when "close enough" rounding landed a hair
// off. On a unanimous result there's no neighbour to nudge to, so the caret is
// dropped entirely.
const AcceptControl = ({
  onAccept,
  splittable,
  suggested,
}: AcceptControlProps) => {
  const [chosen, setChosen] = useState(suggested);
  const [open, setOpen] = useState(false);
  const options = acceptChoices(suggested);

  useEffect(() => setChosen(suggested), [suggested]);

  if (!splittable || options.length <= 1) {
    return (
      <Button
        iconStart={<Check size={16} />}
        onClick={() => onAccept(suggested)}
        variant="primary"
      >
        {`Accept ${suggested}`}
      </Button>
    );
  }

  return (
    <Flex gap="0">
      <Button
        iconStart={<Check size={16} />}
        onClick={() => onAccept(chosen)}
        style={{ borderBottomRightRadius: 0, borderTopRightRadius: 0 }}
        variant="primary"
      >
        {`Accept ${chosen}`}
      </Button>
      <DialogTrigger isOpen={open} onOpenChange={setOpen}>
        <ButtonIcon
          aria-label="Choose a neighbouring estimate"
          icon={<ChevronDown size={16} />}
          style={{ borderBottomLeftRadius: 0, borderTopLeftRadius: 0 }}
          variant="primary"
        />
        <Popover placement="bottom end">
          <Flex direction="column" gap="0">
            {options.map(option => (
              <Button
                key={option}
                onClick={() => {
                  setChosen(option);
                  setOpen(false);
                }}
                style={{ justifyContent: 'space-between', width: '100%' }}
                variant="tertiary"
              >
                <Text
                  as="span"
                  variant="body-small"
                  weight="bold"
                >{`Accept ${option}`}</Text>
                <Text as="span" color="secondary" variant="body-x-small">
                  {neighbourLabel(option, suggested)}
                </Text>
                {option === chosen && <Check size={14} />}
              </Button>
            ))}
          </Flex>
        </Popover>
      </DialogTrigger>
    </Flex>
  );
};

type ResultsSheetProps = Readonly<{
  acceptValue: null | string;
  analysis: VoteAnalysis;
  hostName: string;
  isHost: boolean;
  onAccept: (value: string) => void;
  onReVote: () => void;
}>;

// A non-blocking drawer docked to the bottom of the stage: a thin verdict strip
// that always fits, expandable to the full breakdown. It floats over the felt so
// the table never has to shrink.
export const ResultsSheet = ({
  acceptValue,
  analysis,
  hostName,
  isHost,
  onAccept,
  onReVote,
}: ResultsSheetProps) => {
  const [expanded, setExpanded] = useState(true);
  const sheetRef = useRef<HTMLDivElement>(null);

  const toggle = () => setExpanded(prev => !prev);

  useEffect(() => {
    if (!expanded) {
      return undefined;
    }
    const collapse = () => {
      (document.activeElement as HTMLElement | null)?.blur?.();
      setExpanded(false);
    };
    const onPointerDown = (event: MouseEvent) => {
      if (
        sheetRef.current &&
        !sheetRef.current.contains(event.target as Node)
      ) {
        collapse();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        collapse();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [expanded]);

  return (
    <div
      ref={sheetRef}
      style={{ bottom: 0, insetInline: 0, position: 'absolute', zIndex: 20 }}
    >
      {expanded && (
        <div
          style={{
            borderRadius: 'var(--bui-radius-5)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
            marginBottom: 'var(--bui-space-2)',
            maxHeight: '60vh',
            overflowY: 'auto',
          }}
        >
          <ResultsPanel
            analysis={analysis}
            hostName={hostName}
            isHost={isHost}
          />
        </div>
      )}

      <Flex
        align="center"
        justify="between"
        style={{
          background: 'var(--bui-bg-neutral-1)',
          border: '1px solid var(--bui-border-1)',
          borderRadius: 'var(--bui-radius-5)',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)',
          gap: 'var(--bui-space-3)',
          padding: 'var(--bui-space-2) var(--bui-space-4)',
        }}
      >
        <button
          aria-expanded={expanded}
          onClick={toggle}
          style={{
            alignItems: 'center',
            background: 'transparent',
            border: 'none',
            borderRadius: 'var(--bui-radius-2)',
            cursor: 'pointer',
            display: 'flex',
            gap: 'var(--bui-space-3)',
            padding: 'var(--bui-space-1) var(--bui-space-2)',
          }}
          title={expanded ? 'Hide breakdown' : 'Show breakdown'}
          type="button"
        >
          <Flex align="center" gap="1">
            <span
              style={{
                background: STATUS_DOT[analysis.status],
                borderRadius: 'var(--bui-radius-full)',
                height: 8,
                width: 8,
              }}
            />
            <Text as="span" variant="body-small" weight="bold">
              {STATUS_LABEL[analysis.status]}
            </Text>
          </Flex>
          {analysis.average && (
            <Text as="span" color="secondary" variant="body-small">
              {'Average '}
              <Text as="span" weight="bold">
                {analysis.average}
              </Text>
            </Text>
          )}
          {analysis.spread && (
            <Text as="span" color="secondary" variant="body-small">
              {'Spread '}
              <Text
                as="span"
                weight="bold"
              >{`${analysis.spread.low}–${analysis.spread.high}`}</Text>
            </Text>
          )}
          <Box
            style={{
              alignItems: 'center',
              background: 'var(--bui-bg-neutral-2)',
              border: '1px solid var(--bui-border-1)',
              borderRadius: 'var(--bui-radius-2)',
              display: 'inline-flex',
              gap: 'var(--bui-space-1)',
              padding: 'var(--bui-space-1) var(--bui-space-2)',
            }}
          >
            <Text as="span" variant="body-x-small" weight="bold">
              {expanded ? 'Hide' : 'Breakdown'}
            </Text>
            {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </Box>
        </button>

        {/* Accept is always the primary (forward) action; Re-vote secondary. */}
        {isHost && (
          <Flex align="center" gap="2" style={{ flexShrink: 0 }}>
            <Button
              iconStart={<RotateCcw size={16} />}
              onClick={onReVote}
              variant="secondary"
            >
              Re-vote
            </Button>
            {acceptValue && (
              <AcceptControl
                onAccept={onAccept}
                splittable={analysis.status !== 'unanimous'}
                suggested={acceptValue}
              />
            )}
          </Flex>
        )}
      </Flex>
    </div>
  );
};
