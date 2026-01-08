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

import {
  createTemplateUpgradeBranchName,
  createTemplateUpgradeCommitMessage,
  createTemplateUpgradePrBody,
  createTemplateUpgradePrTitle,
} from './prFormatting';
import { TemplateInfo } from '../VcsProvider';

describe('prFormatting', () => {
  const createMockTemplateInfo = (
    overrides?: Partial<TemplateInfo>,
  ): TemplateInfo => ({
    owner: 'test-owner',
    repo: 'test-repo',
    name: 'test-template',
    previousVersion: '1.0.0',
    currentVersion: '2.0.0',
    componentName: 'test-component',
    ...overrides,
  });

  describe('createTemplateUpgradeBranchName', () => {
    it('should create a branch name with simple component name and version', () => {
      const templateInfo = createMockTemplateInfo({
        componentName: 'my-component',
        currentVersion: '1.2.3',
      });

      const result = createTemplateUpgradeBranchName(templateInfo);

      expect(result).toBe('my-component/template-upgrade-v1.2.3');
    });

    it('should sanitize component name with spaces', () => {
      const templateInfo = createMockTemplateInfo({
        componentName: 'My Component Name',
        currentVersion: '1.0.0',
      });

      const result = createTemplateUpgradeBranchName(templateInfo);

      expect(result).toBe('my-component-name/template-upgrade-v1.0.0');
    });

    it('should sanitize component name with special characters', () => {
      const templateInfo = createMockTemplateInfo({
        componentName: 'My@Component#Name!',
        currentVersion: '1.0.0',
      });

      const result = createTemplateUpgradeBranchName(templateInfo);

      expect(result).toBe('my-component-name/template-upgrade-v1.0.0');
    });

    it('should sanitize component name with uppercase letters', () => {
      const templateInfo = createMockTemplateInfo({
        componentName: 'MY_COMPONENT',
        currentVersion: '1.0.0',
      });

      const result = createTemplateUpgradeBranchName(templateInfo);

      expect(result).toBe('my_component/template-upgrade-v1.0.0');
    });

    it('should sanitize version with special characters', () => {
      const templateInfo = createMockTemplateInfo({
        componentName: 'test-component',
        currentVersion: 'v1.2.3-beta',
      });

      const result = createTemplateUpgradeBranchName(templateInfo);

      expect(result).toBe('test-component/template-upgrade-vv1.2.3-beta');
    });

    it('should handle component name with leading/trailing dots and dashes', () => {
      const templateInfo = createMockTemplateInfo({
        componentName: '...my-component...',
        currentVersion: '1.0.0',
      });

      const result = createTemplateUpgradeBranchName(templateInfo);

      expect(result).toBe('my-component/template-upgrade-v1.0.0');
    });

    it('should handle version with leading/trailing dots and dashes', () => {
      const templateInfo = createMockTemplateInfo({
        componentName: 'test-component',
        currentVersion: '...1.0.0...',
      });

      const result = createTemplateUpgradeBranchName(templateInfo);

      expect(result).toBe('test-component/template-upgrade-v1.0.0');
    });

    it('should preserve valid characters like dots, dashes, and underscores', () => {
      const templateInfo = createMockTemplateInfo({
        componentName: 'my.component_name-123',
        currentVersion: '1.0.0',
      });

      const result = createTemplateUpgradeBranchName(templateInfo);

      expect(result).toBe('my.component_name-123/template-upgrade-v1.0.0');
    });
  });

  describe('createTemplateUpgradeCommitMessage', () => {
    it('should create a commit message with template info and file count', () => {
      const templateInfo = createMockTemplateInfo({
        owner: 'my-org',
        repo: 'my-template',
      });

      const result = createTemplateUpgradeCommitMessage(templateInfo, 5);

      expect(result).toContain('Update template to new version');
      expect(result).toContain('scaffolder-relation-processor');
      expect(result).toContain('my-org/my-template');
      expect(result).toContain('Updated 5 file(s)');
      expect(result).toContain('Please manually review');
    });
  });

  describe('createTemplateUpgradePrBody', () => {
    it('should create a PR body with template info and file count', () => {
      const templateInfo = createMockTemplateInfo({
        owner: 'my-org',
        repo: 'my-template',
      });

      const result = createTemplateUpgradePrBody(templateInfo, 3);

      expect(result).toContain('scaffolder-relation-processor');
      expect(result).toContain('**Template Source:** my-org/my-template');
      expect(result).toContain('**Updated Files:** 3 file(s)');
      expect(result).toContain('Please manually review');
    });
  });

  describe('createTemplateUpgradePrTitle', () => {
    it('should create a PR title with both previous and current version', () => {
      const templateInfo = createMockTemplateInfo({
        name: 'my-template',
        previousVersion: '1.0.0',
        currentVersion: '2.0.0',
      });

      const result = createTemplateUpgradePrTitle(templateInfo);

      expect(result).toBe(
        'Template Upgrade: Update my-template from 1.0.0 to 2.0.0',
      );
    });

    it('should create a PR title with only current version when previous version is missing', () => {
      const templateInfo = createMockTemplateInfo({
        name: 'my-template',
        previousVersion: '',
        currentVersion: '2.0.0',
      });

      const result = createTemplateUpgradePrTitle(templateInfo);

      expect(result).toBe('Template Upgrade: Update my-template to 2.0.0');
    });

    it('should create a PR title with fallback when current version is missing', () => {
      const templateInfo = createMockTemplateInfo({
        name: 'my-template',
        previousVersion: '1.0.0',
        currentVersion: '',
      });

      const result = createTemplateUpgradePrTitle(templateInfo);

      expect(result).toBe(
        'Template Upgrade: Update my-template to new version',
      );
    });
  });
});
