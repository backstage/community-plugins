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
import { Flex, Tag, TagGroup } from '@backstage/ui';

import styles from './ManifestDigestChip.module.css';

type ManifestDigestChipProps = {
  label: string;
  hash: string;
};

export const ManifestDigestChip = ({
  label,
  hash,
}: ManifestDigestChipProps) => {
  return (
    <Flex align="center">
      <TagGroup aria-label="digest">
        <Tag size="small" className={styles.chip}>
          {label}
        </Tag>
      </TagGroup>
      {hash}
    </Flex>
  );
};
