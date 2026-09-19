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
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { Check, Crown, Eye, Lock, Settings, User } from 'lucide-react';
import { Box, Flex, Text } from '@backstage/ui';
import type { UserRole } from './types';

type RoleSelectorProps = Readonly<{
  hostName?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleChange: (role: UserRole) => void;
  userRole: UserRole;
}>;

type InlinePopoverProps = Readonly<{
  children: ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  width: number;
}>;

const InlinePopover = ({
  children,
  isOpen,
  onOpenChange,
  trigger,
  width,
}: InlinePopoverProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const onDocMouseDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onOpenChange]);

  return (
    <Box ref={ref} style={{ display: 'inline-flex', position: 'relative' }}>
      {trigger}
      {isOpen && (
        <Box
          style={{
            background: 'var(--bui-bg-neutral-1)',
            border: '1px solid var(--bui-border-1)',
            borderRadius: 'var(--bui-radius-3)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.16)',
            marginTop: 4,
            padding: 'var(--bui-space-2)',
            position: 'absolute',
            right: 0,
            top: '100%',
            width,
            zIndex: 50,
          }}
        >
          {children}
        </Box>
      )}
    </Box>
  );
};

const iconFor = (role: UserRole, size: number) => {
  if (role === 'host') {
    return (
      <Crown
        size={size}
        style={{ color: 'var(--bui-fg-warning)', flexShrink: 0 }}
      />
    );
  }
  if (role === 'voter') {
    return (
      <User
        size={size}
        style={{ color: 'var(--bui-fg-info)', flexShrink: 0 }}
      />
    );
  }
  return (
    <Eye
      size={size}
      style={{ color: 'var(--bui-fg-secondary)', flexShrink: 0 }}
    />
  );
};

type RoleOptionProps = Readonly<{
  active: boolean;
  description: string;
  disabled?: boolean;
  onSelect: () => void;
  roleKind: UserRole;
  status?: ReactNode;
  title: string;
}>;

const RoleOption = ({
  active,
  description,
  disabled,
  onSelect,
  roleKind,
  status,
  title,
}: RoleOptionProps) => (
  <button
    disabled={disabled}
    onClick={onSelect}
    style={{
      alignItems: 'flex-start',
      background: active ? 'var(--bui-bg-neutral-2)' : 'transparent',
      border: 'none',
      borderRadius: 'var(--bui-radius-2)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      font: 'inherit',
      gap: 6,
      opacity: disabled ? 0.5 : 1,
      padding: 6,
      textAlign: 'left',
      width: '100%',
    }}
    type="button"
  >
    <Box style={{ marginTop: 2 }}>{iconFor(roleKind, 16)}</Box>
    <Box style={{ flex: 1 }}>
      <Flex align="center" justify="between">
        <Text as="span" variant="body-small" weight="bold">
          {title}
        </Text>
        {status}
      </Flex>
      <Text as="p" variant="body-x-small" color="secondary">
        {description}
      </Text>
    </Box>
  </button>
);

export const RoleSelector = ({
  hostName,
  isOpen,
  onOpenChange,
  onRoleChange,
  userRole,
}: RoleSelectorProps) => {
  const hostLocked = userRole !== 'host' && Boolean(hostName);

  const trigger = (
    <button
      onClick={() => onOpenChange(!isOpen)}
      style={{
        alignItems: 'center',
        background: 'var(--bui-bg-neutral-1)',
        border: '1px solid var(--bui-border-1)',
        borderRadius: 'var(--bui-radius-3)',
        cursor: 'pointer',
        display: 'flex',
        font: 'inherit',
        gap: 8,
        padding: '8px 16px',
      }}
      type="button"
    >
      {iconFor(userRole, 16)}
      <Text as="span" variant="body-small">
        Role
      </Text>
      <Text as="span" variant="body-small" weight="bold">
        {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
      </Text>
      <Settings size={16} style={{ color: 'var(--bui-fg-secondary)' }} />
    </button>
  );

  return (
    <InlinePopover
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      trigger={trigger}
      width={256}
    >
      <Flex direction="column" gap="1">
        <Text
          as="h4"
          variant="body-x-small"
          weight="bold"
          color="secondary"
          style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}
        >
          Your Role
        </Text>
        <RoleOption
          active={userRole === 'host'}
          description={
            hostName
              ? `Taken by ${hostName}`
              : 'Controls reveal, new round, and end session'
          }
          disabled={hostLocked}
          onSelect={() => {
            if (!hostName || userRole === 'host') {
              onRoleChange('host');
              onOpenChange(false);
            }
          }}
          roleKind="host"
          status={(() => {
            if (userRole === 'host') {
              return <Check size={14} />;
            }
            if (hostName) {
              return (
                <Lock size={14} style={{ color: 'var(--bui-fg-secondary)' }} />
              );
            }
            return null;
          })()}
          title="Host"
        />
        <RoleOption
          active={userRole === 'voter'}
          description="Participates in estimation"
          onSelect={() => {
            onRoleChange('voter');
            onOpenChange(false);
          }}
          roleKind="voter"
          status={userRole === 'voter' ? <Check size={14} /> : null}
          title="Voter"
        />
        <RoleOption
          active={userRole === 'observer'}
          description="Watches only, no vote"
          onSelect={() => {
            onRoleChange('observer');
            onOpenChange(false);
          }}
          roleKind="observer"
          status={userRole === 'observer' ? <Check size={14} /> : null}
          title="Observer"
        />
      </Flex>
    </InlinePopover>
  );
};
