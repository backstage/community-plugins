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
import { CSSProperties, useMemo, useState } from 'react';
import { createAvatarDataUri } from './utils/avatar';

type CharacterAvatarProps = Readonly<{
  className?: string;
  name?: string;
  seed?: string;
  size?: number | string;
  style?: string;
}>;

const isUrl = (value: string): boolean => /^(data:|https?:)/.test(value);

const getInitials = (name?: string): string => {
  if (!name) {
    return '?';
  }
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const baseStyle: CSSProperties = {
  backgroundColor: 'var(--bui-bg-neutral-2)',
  border: '1px solid var(--bui-border-1)',
  borderRadius: 'var(--bui-radius-full)',
  boxSizing: 'border-box',
};

export const CharacterAvatar = ({
  className,
  name,
  seed,
  size,
  style,
}: CharacterAvatarProps) => {
  const [failed, setFailed] = useState(false);
  const sizeStyle: CSSProperties =
    size === undefined ? {} : { height: size, width: size };
  const initialsFontSize =
    typeof size === 'number'
      ? Math.round(size * 0.4)
      : 'clamp(1.05rem, 2.8vw, 1.75rem)';

  // 'photo' style uses the seed as a real picture URL; everything else generates
  // a deterministic character from the seed.
  const src = useMemo(() => {
    if (!seed) {
      return undefined;
    }
    if (style === 'photo') {
      return isUrl(seed) ? seed : undefined;
    }
    return createAvatarDataUri(style ?? 'personas', seed);
  }, [seed, style]);

  if (!src || failed) {
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          alignItems: 'center',
          color: 'var(--bui-fg-secondary)',
          display: 'flex',
          fontSize: initialsFontSize,
          fontWeight: 600,
          justifyContent: 'center',
          ...sizeStyle,
        }}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      alt={name ?? 'avatar'}
      className={className}
      onError={() => setFailed(true)}
      src={src}
      style={{ ...baseStyle, objectFit: 'cover', ...sizeStyle }}
    />
  );
};
