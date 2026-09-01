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

import techRadarPlugin from '.';

describe('Tech Radar plugin', () => {
  describe('Plugin Structure', () => {
    it('should have correct plugin metadata', () => {
      expect(techRadarPlugin.pluginId).toBe('tech-radar');
      expect(techRadarPlugin.routes.root).toBeDefined();
    });

    it('should export Tech Radar extensions', () => {
      expect(techRadarPlugin.getExtension('api:tech-radar')).toBeDefined();
      expect(techRadarPlugin.getExtension('page:tech-radar')).toBeDefined();
    });
  });
});
