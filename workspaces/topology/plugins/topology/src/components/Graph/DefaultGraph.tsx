/*
 * Copyright 2024 The Backstage Authors
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
  Graph,
  GraphComponent,
  GraphElement,
  isGraph,
  observer,
  WithPanZoomProps,
  WithSelectionProps,
} from '@patternfly/react-topology';

type DefaultGraphProps = {
  element?: GraphElement;
} & Partial<WithPanZoomProps> &
  Partial<WithSelectionProps>;

const DefaultGraph = ({ element, ...rest }: DefaultGraphProps) => {
  if (!isGraph) {
    return null;
  }
  return (
    <GraphComponent
      element={element as Graph}
      // The parameters need to be made optional in GraphComponent. Overwritten by ...rest if passed
      panZoomRef={() => {}}
      dndDropRef={() => {}}
      selected={false}
      onSelect={() => {}}
      onContextMenu={() => {}}
      contextMenuOpen={false}
      {...rest}
    />
  );
};

export default observer(DefaultGraph);
