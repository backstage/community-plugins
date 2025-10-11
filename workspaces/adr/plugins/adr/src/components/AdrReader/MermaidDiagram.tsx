/*
 * Copyright 2022 The Backstage Authors
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

import { useEffect, useRef } from 'react';
import { useMermaid } from './useMermaid';

export const MermaidDiagram = ({ code }: { code: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mermaid = useMermaid();

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current) return;

      try {
        // Generate a valid CSS selector ID (must start with letter, no dots)
        const id = `mermaid-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}`;
        const { svg } = await mermaid.render(id, code);

        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        if (containerRef.current) {
          containerRef.current.innerHTML = `<pre style="color: red;">Failed to render Mermaid diagram: ${err}</pre>`;
        }
      }
    };

    renderDiagram();
  }, [code, mermaid]);

  return <div ref={containerRef} className="mermaid" />;
};
