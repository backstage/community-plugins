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
import type { CSSProperties, ReactNode } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  History,
  Play,
  PlugZap,
  Settings2,
  Spade,
  Users,
} from 'lucide-react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  Flex,
  Grid,
  Link,
  Text,
} from '@backstage/ui';
import { CardFace } from '../LiveSessionTab/CardFace';
import { FIBONACCI_VALUES } from '../LiveSessionTab/types';

const PRIMER_URL =
  'https://www.atlassian.com/agile/project-management/estimation';
const WALKTHROUGH_URL = '/pointing-poker-walkthrough.mp4';

const openWalkthrough = () => {
  window.open(WALKTHROUGH_URL, '_blank', 'noopener,noreferrer');
};

const ACCENT = {
  blue: { bg: 'rgba(59, 130, 246, 0.16)', fg: '#2563eb' },
  emerald: { bg: 'rgba(16, 185, 129, 0.16)', fg: '#059669' },
  teal: { bg: 'rgba(20, 184, 166, 0.16)', fg: '#0d9488' },
  violet: { bg: 'rgba(139, 92, 246, 0.16)', fg: '#7c3aed' },
} as const;

type Accent = keyof typeof ACCENT;
type Destination = 'live-session' | 'settings';

const chip = (accent: Accent): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  flexShrink: 0,
  borderRadius: 'var(--bui-radius-full)',
  background: ACCENT[accent].bg,
  color: ACCENT[accent].fg,
});

const panel: CSSProperties = {
  height: '100%',
  padding: 20,
  borderRadius: 'var(--bui-radius-4)',
  border: '1px solid var(--bui-border-1)',
  background: 'var(--bui-bg-neutral-1)',
};

const Section = ({
  children,
  eyebrow,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
}) => (
  <Flex direction="column" gap="3">
    <Box>
      <Text
        as="div"
        variant="body-x-small"
        weight="bold"
        color="secondary"
        style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
      >
        {eyebrow}
      </Text>
      <Text as="h2" variant="title-medium" weight="bold">
        {title}
      </Text>
    </Box>
    {children}
  </Flex>
);

const Step = ({
  accent,
  description,
  icon,
  number,
  title,
}: {
  accent: Accent;
  description: string;
  icon: ReactNode;
  number: string;
  title: string;
}) => (
  <Box style={panel}>
    <Flex direction="column" gap="4">
      <Flex align="center" justify="between">
        <Box style={chip(accent)}>{icon}</Box>
        <Text variant="body-small" weight="bold" color="secondary">
          {number}
        </Text>
      </Flex>
      <Box>
        <Text as="div" variant="body-large" weight="bold">
          {title}
        </Text>
        <Text as="div" variant="body-small" color="secondary">
          {description}
        </Text>
      </Box>
    </Flex>
  </Box>
);

const Benefit = ({ children }: { children: ReactNode }) => (
  <Flex align="start" gap="2">
    <Check
      size={16}
      style={{ flexShrink: 0, marginTop: 2, color: ACCENT.emerald.fg }}
    />
    <Text variant="body-small">{children}</Text>
  </Flex>
);

export function OverviewTab({
  onNavigate,
}: {
  onNavigate: (destination: Destination) => void;
}) {
  return (
    <Flex direction="column" gap="5">
      <Card>
        <CardBody>
          <Box
            style={{
              padding: 'clamp(20px, 4vw, 40px)',
              borderRadius: 'var(--bui-radius-4)',
              background:
                'linear-gradient(135deg, rgba(59, 130, 246, 0.14), rgba(139, 92, 246, 0.12) 55%, rgba(20, 184, 166, 0.12))',
            }}
          >
            <Grid.Root columns={{ initial: '1', md: '2' }} gap="6">
              <Flex direction="column" gap="4" justify="center">
                <Flex align="center" gap="2">
                  <Box style={chip('violet')}>
                    <Spade size={21} />
                  </Box>
                  <Text variant="body-small" weight="bold">
                    Collaborative estimation for Backstage
                  </Text>
                </Flex>
                <Box>
                  <Text as="h1" variant="title-large" weight="bold">
                    Turn team discussion into confident story points.
                  </Text>
                  <Text
                    as="p"
                    variant="body-large"
                    color="secondary"
                    style={{ marginTop: 8 }}
                  >
                    Bring issues into the room, vote independently, reveal the
                    result, and write the agreed estimate back—without leaving
                    your developer portal.
                  </Text>
                </Box>
                <Flex gap="3" style={{ flexWrap: 'wrap' }}>
                  <DialogTrigger>
                    <Button iconStart={<Play size={17} />} variant="primary">
                      Watch walkthrough
                    </Button>
                    <Dialog
                      aria-label="Pointing Poker walkthrough"
                      height="94vh"
                      width="96vw"
                    >
                      <DialogHeader>Pointing Poker walkthrough</DialogHeader>
                      <DialogBody
                        style={{
                          display: 'flex',
                          minHeight: 0,
                          overflow: 'hidden',
                          padding: 0,
                        }}
                      >
                        <video
                          autoPlay
                          controls
                          playsInline
                          src={WALKTHROUGH_URL}
                          style={{
                            background: '#000',
                            flex: 1,
                            height: '100%',
                            objectFit: 'contain',
                            width: '100%',
                          }}
                        >
                          <track
                            default
                            kind="captions"
                            label="English"
                            src="/pointing-poker-walkthrough.en.vtt"
                            srcLang="en"
                          />
                        </video>
                      </DialogBody>
                      <DialogFooter>
                        <Button
                          iconStart={<ExternalLink size={17} />}
                          onClick={openWalkthrough}
                          variant="secondary"
                        >
                          Open in new tab
                        </Button>
                      </DialogFooter>
                    </Dialog>
                  </DialogTrigger>
                  <Button
                    iconStart={<Play size={17} />}
                    onClick={() => onNavigate('live-session')}
                    variant="secondary"
                  >
                    Start a session
                  </Button>
                  <Button
                    iconStart={<Settings2 size={17} />}
                    onClick={() => onNavigate('settings')}
                    variant="secondary"
                  >
                    Configure your team
                  </Button>
                </Flex>
              </Flex>

              <Box style={{ ...panel, background: 'var(--bui-bg-neutral-2)' }}>
                <Flex direction="column" gap="4">
                  <Flex align="center" justify="between" gap="3">
                    <Box>
                      <Text variant="body-x-small" color="secondary">
                        SAMPLE VOTE
                      </Text>
                      <Text as="div" variant="body-large" weight="bold">
                        SCRUM-42 · Add team dashboard
                      </Text>
                    </Box>
                    <Flex align="center" gap="1">
                      <Users size={16} />
                      <Text variant="body-small">5</Text>
                    </Flex>
                  </Flex>
                  <Flex align="center" justify="center" gap="3">
                    {(['3', '5', '5', '8'] as const).map((value, index) => (
                      <div
                        key={`${value}-${index}`}
                        style={{ height: 92, width: 58 }}
                      >
                        <CardFace selected={value === '5'} value={value} />
                      </div>
                    ))}
                  </Flex>
                  <Flex
                    align="center"
                    justify="between"
                    gap="3"
                    style={{
                      paddingTop: 12,
                      borderTop: '1px solid var(--bui-border-1)',
                    }}
                  >
                    <Box>
                      <Text as="div" variant="body-x-small" color="secondary">
                        TEAM CONSENSUS
                      </Text>
                      <Text as="div" variant="title-medium" weight="bold">
                        5 points
                      </Text>
                    </Box>
                    <Flex align="center" gap="2">
                      <CheckCircle2
                        size={18}
                        style={{ color: ACCENT.emerald.fg }}
                      />
                      <Text variant="body-small" weight="bold">
                        Ready to accept
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Box>
            </Grid.Root>
          </Box>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <Section
            eyebrow="One simple loop"
            title="From refinement queue to shared estimate"
          >
            <Grid.Root columns={{ initial: '1', md: '3' }} gap="3">
              <Step
                accent="blue"
                description="Load the issues your team needs to refine with a saved query."
                icon={<ArrowDownToLine size={21} />}
                number="01"
                title="Bring in the work"
              />
              <Step
                accent="violet"
                description="Everyone votes privately, then reveals together and discusses the spread."
                icon={<Spade size={21} />}
                number="02"
                title="Estimate as a team"
              />
              <Step
                accent="emerald"
                description="Accept the result to save the agreed story points back to the issue."
                icon={<ArrowUpFromLine size={21} />}
                number="03"
                title="Write back with confidence"
              />
            </Grid.Root>
          </Section>
        </CardBody>
      </Card>

      <Grid.Root columns={{ initial: '1', md: '2' }} gap="5">
        <Card>
          <CardBody>
            <Section
              eyebrow="Issue trackers"
              title="Connect the tools your teams use"
            >
              <Flex direction="column" gap="3">
                <Box style={{ ...panel, height: 'auto' }}>
                  <Flex align="center" gap="3">
                    <Box style={chip('blue')}>
                      <PlugZap size={20} />
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <Text variant="body-large" weight="bold">
                        Jira
                      </Text>{' '}
                      <Text
                        variant="body-x-small"
                        weight="bold"
                        style={{ color: ACCENT.emerald.fg }}
                      >
                        AVAILABLE NOW · FIRST INTEGRATION
                      </Text>
                      <Text as="div" variant="body-small" color="secondary">
                        Query issues, preview context, and save accepted story
                        points directly to Jira.
                      </Text>
                    </Box>
                  </Flex>
                </Box>
                <Box
                  style={{
                    ...panel,
                    height: 'auto',
                    borderStyle: 'dashed',
                    background: 'var(--bui-bg-neutral-2)',
                  }}
                >
                  <Flex align="center" gap="3">
                    <Box style={chip('violet')}>
                      <Clock3 size={20} />
                    </Box>
                    <Box>
                      <Text variant="body-large" weight="bold">
                        Linear
                      </Text>{' '}
                      <Text
                        variant="body-x-small"
                        weight="bold"
                        color="secondary"
                      >
                        COMING NEXT
                      </Text>
                      <Text as="div" variant="body-small" color="secondary">
                        The next integration will bring the same estimation
                        workflow to Linear issues.
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            </Section>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Section eyebrow="Why teams use it" title="Keep refinement moving">
              <Flex direction="column" gap="3">
                <Benefit>
                  Private voting reduces anchoring and groupthink.
                </Benefit>
                <Benefit>
                  Ticket context stays visible during the discussion.
                </Benefit>
                <Benefit>
                  Flag not-ready work without blocking the session.
                </Benefit>
                <Benefit>
                  Session history keeps decisions easy to revisit.
                </Benefit>
                <Benefit>
                  Idle sessions close automatically after eight hours.
                </Benefit>
              </Flex>
            </Section>
          </CardBody>
        </Card>
      </Grid.Root>

      <Card>
        <CardBody>
          <Grid.Root columns={{ initial: '1', md: '2' }} gap="6">
            <Section
              eyebrow="Ready in minutes"
              title="Run your first refinement"
            >
              <Flex direction="column" gap="3">
                <Benefit>Connect Jira in your Backstage configuration.</Benefit>
                <Benefit>
                  Save a team query and choose your voting cards.
                </Benefit>
                <Benefit>
                  Open Live session, invite the team, and start voting.
                </Benefit>
              </Flex>
              <Flex gap="3" style={{ flexWrap: 'wrap' }}>
                <Button
                  iconStart={<Settings2 size={17} />}
                  onClick={() => onNavigate('settings')}
                  variant="primary"
                >
                  Set up Pointing Poker
                </Button>
                <Link href={PRIMER_URL}>New to planning poker?</Link>
              </Flex>
            </Section>

            <Section
              eyebrow="Flexible by design"
              title="A deck your team can own"
            >
              <Flex align="center" gap="1" style={{ flexWrap: 'nowrap' }}>
                {FIBONACCI_VALUES.map(value => (
                  <div
                    key={String(value)}
                    style={{ height: 68, minWidth: 0, width: 40 }}
                  >
                    <CardFace selected={value === '?'} value={value} />
                  </div>
                ))}
              </Flex>
              <Flex align="center" gap="2">
                <History size={16} />
                <Text variant="body-small" color="secondary">
                  Trim the deck in Settings. Use ? when the team needs more
                  context before estimating.
                </Text>
              </Flex>
            </Section>
          </Grid.Root>
        </CardBody>
      </Card>
    </Flex>
  );
}
