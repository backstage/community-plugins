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
  DefaultGroup,
  GraphElement,
  isNode,
  observer,
  ScaleDetailsLevel,
  useDetailsLevel,
  WithDragNodeProps,
  WithSelectionProps,
} from '@patternfly/react-topology';

type GroupNodeProps = {
  element?: GraphElement;
} & Partial<WithSelectionProps & WithDragNodeProps>;

const GroupNode = ({ element, ...rest }: GroupNodeProps) => {
  const detailsLevel = useDetailsLevel();

  if (!element || !isNode(element)) {
    return null;
  }

  return (
    <DefaultGroup
      element={element}
      showLabel={detailsLevel === ScaleDetailsLevel.high}
      {...rest}
    />
  );
};

export default observer(GroupNode);
