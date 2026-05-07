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
import { Entity } from '@backstage/catalog-model';
import { safeEntityDisplayName, safeEntityKind } from './safeEntityDisplayName';

describe('safeEntityDisplayName', () => {
  it('should return humanized ref for a well-formed entity', () => {
    const entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: { name: 'my-service', namespace: 'default' },
    } as Entity;
    expect(safeEntityDisplayName(entity)).toBe('component:my-service');
  });

  it('should label the missing kind when kind is absent', () => {
    const entity = {
      apiVersion: 'backstage.io/v1alpha1',
      metadata: { name: 'my-service' },
    } as unknown as Entity;
    expect(() => safeEntityDisplayName(entity)).not.toThrow();
    expect(safeEntityDisplayName(entity)).toBe('<missing kind>:my-service');
  });

  it('should label the missing name when metadata is null', () => {
    const entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: null,
    } as unknown as Entity;
    expect(() => safeEntityDisplayName(entity)).not.toThrow();
    expect(safeEntityDisplayName(entity)).toBe('component:<missing name>');
  });

  it('should label the missing name when metadata.name is absent', () => {
    const entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {},
    } as unknown as Entity;
    expect(() => safeEntityDisplayName(entity)).not.toThrow();
    expect(safeEntityDisplayName(entity)).toBe('component:<missing name>');
  });

  it('should label both fields when metadata is missing entirely', () => {
    const entity = {
      apiVersion: 'backstage.io/v1alpha1',
    } as unknown as Entity;
    expect(() => safeEntityDisplayName(entity)).not.toThrow();
    expect(safeEntityDisplayName(entity)).toBe('<missing kind>:<missing name>');
  });

  it('should not throw when kind is a non-string (YAML boolean trap)', () => {
    // YAML 1.1 parses `kind: on` as boolean true
    const entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: true,
      metadata: { name: 'my-service' },
    } as unknown as Entity;
    expect(() => safeEntityDisplayName(entity)).not.toThrow();
    expect(safeEntityDisplayName(entity)).toBe('<missing kind>:my-service');
  });

  it('should not throw when name is a non-string', () => {
    const entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: { name: 42 },
    } as unknown as Entity;
    expect(() => safeEntityDisplayName(entity)).not.toThrow();
    expect(safeEntityDisplayName(entity)).toBe('component:<missing name>');
  });

  it('should treat empty string kind as missing', () => {
    const entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: '',
      metadata: { name: 'my-service' },
    } as unknown as Entity;
    expect(safeEntityDisplayName(entity)).toBe('<missing kind>:my-service');
  });

  it('should treat empty string name as missing', () => {
    const entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: { name: '' },
    } as unknown as Entity;
    expect(safeEntityDisplayName(entity)).toBe('component:<missing name>');
  });

  it('should not throw when namespace is a non-string (YAML boolean trap)', () => {
    // YAML 1.1 parses `namespace: on` as boolean true
    const entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: { name: 'my-service', namespace: true },
    } as unknown as Entity;
    expect(() => safeEntityDisplayName(entity)).not.toThrow();
    // Falls back to non-humanized kind:name format because the
    // humanizeEntityRef path would crash on the non-string namespace.
    expect(safeEntityDisplayName(entity)).toBe('component:my-service');
  });
});

describe('safeEntityKind', () => {
  it('should return lowercased kind for a well-formed entity', () => {
    const entity = { kind: 'Component' } as Entity;
    expect(safeEntityKind(entity)).toBe('component');
  });

  it('should return "missing" when kind is absent', () => {
    const entity = {} as unknown as Entity;
    expect(safeEntityKind(entity)).toBe('missing');
  });

  it('should return "missing" when kind is a non-string (YAML boolean trap)', () => {
    const entity = { kind: true } as unknown as Entity;
    expect(() => safeEntityKind(entity)).not.toThrow();
    expect(safeEntityKind(entity)).toBe('missing');
  });
});
