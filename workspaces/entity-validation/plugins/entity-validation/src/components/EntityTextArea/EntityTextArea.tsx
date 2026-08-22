/*
 * Copyright 2023 The Backstage Authors
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
import { useMemo, useState } from 'react';
import { Box } from '@backstage/ui';
import styles from './EntityTextArea.module.css';
import CodeMirror from '@uiw/react-codemirror';
import { showPanel } from '@codemirror/view';
import { StreamLanguage } from '@codemirror/language';
import { yaml as yamlSupport } from '@codemirror/legacy-modes/mode/yaml';
import { useKeyboardEvent } from '@react-hookz/web';

type TemplateTextAreaProps = {
  catalogYaml: string;
  onChange: (value: string) => void;
  onValidate: () => void;
};

export const EntityTextArea = ({
  catalogYaml,
  onChange,
  onValidate,
}: TemplateTextAreaProps) => {
  const [close, setClose] = useState(false);

  const panelExtension = useMemo(() => {
    if (close) {
      return showPanel.of(null);
    }

    const dom = document.createElement('div');
    dom.classList.add(styles.infoPanel);
    dom.textContent =
      'To validate the provided entity descriptor YAML, click the "Validate" button or use "Ctrl + S" or "Ctrl + Enter"';
    dom.onclick = () => setClose(true);
    return showPanel.of(() => ({ dom, top: true }));
  }, [close]);

  // Triggers a validation when Ctrl+S or Ctrl+Enter instead of default behavior
  useKeyboardEvent(
    e => (e.key === 's' || e.key === 'Enter') && (e.ctrlKey || e.metaKey),
    e => {
      e.preventDefault();
      onValidate();
    },
  );

  return (
    <Box className={styles.container}>
      <CodeMirror
        className={styles.codeMirror}
        theme="dark"
        height="100%"
        extensions={[StreamLanguage.define(yamlSupport), panelExtension]}
        value={catalogYaml}
        onChange={onChange}
        onKeyDownCapture={e => {
          // Prevent new line if Ctrl + Enter was clicked
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) e.preventDefault();
        }}
      />
    </Box>
  );
};
