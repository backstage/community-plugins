/*
 * Copyright 2020 The Backstage Authors
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

import { CodeClimateData } from '../../api';
import { Link } from '@backstage/core-components';
import { Text } from '@backstage/ui';
import styles from './CodeClimateTable.module.css';

const letterColor = (letter: string): string => {
  if (letter === 'A') return '#45d298';
  if (letter === 'B') return '#a5d86e';
  if (letter === 'C') return '#f1ce0c';
  if (letter === 'D') return '#f29141';
  if (letter === 'F') return '#df5869';
  return '#45d298';
};

export const CodeClimateTable = ({
  codeClimateData,
}: {
  codeClimateData: CodeClimateData;
}) => {
  const {
    repoID,
    maintainability: {
      letter: maintainabilityLetter,
      value: maintainabilityValue,
    },
    testCoverage: { letter: testCoverageLetter, value: testCoverageValue },
    numberOfCodeSmells,
    numberOfDuplication,
    numberOfOtherIssues,
  } = codeClimateData;

  if (!codeClimateData) {
    return null;
  }

  return (
    <>
      <div className={styles.spaceAround}>
        <div>
          <Text variant="title-small" as="p">
            Maintainability
          </Text>
          <div className={styles.spaceBetween}>
            <span
              className={styles.letterBadge}
              style={{ backgroundColor: letterColor(maintainabilityLetter) }}
            >
              {maintainabilityLetter}
            </span>
            <Link to={`https://codeclimate.com/repos/${repoID}`}>
              <span className={styles.letterDetails}>
                {maintainabilityValue}
              </span>
            </Link>
          </div>
        </div>
        <div>
          <Text variant="title-small" as="p">
            Test Coverage
          </Text>
          <div className={styles.spaceBetween}>
            <span
              className={styles.letterBadge}
              style={{ backgroundColor: letterColor(testCoverageLetter) }}
            >
              {testCoverageLetter}
            </span>
            <Link to={`https://codeclimate.com/repos/${repoID}`}>
              <span className={styles.letterDetails}>{testCoverageValue}%</span>
            </Link>
          </div>
        </div>
      </div>
      <div className={`${styles.spaceAround} ${styles.paddingTop30}`}>
        <div>
          <Text variant="title-small" as="p">
            Code Smells:
          </Text>
          <Link
            to={`https://codeclimate.com/repos/${repoID}/issues?category%5B%5D=complexity&status%5B%5D=&status%5B%5D=open&status%5B%5D=confirmed`}
          >
            <span className={styles.fontSize}>{numberOfCodeSmells}</span>
          </Link>
        </div>
        <div className={styles.paddingSides20}>
          <Text variant="title-small" as="p">
            Duplication:
          </Text>
          <Link
            to={`https://codeclimate.com/repos/${repoID}/issues?category%5B%5D=duplication&status%5B%5D=&status%5B%5D=open&status%5B%5D=confirmed`}
          >
            <span className={styles.fontSize}>{numberOfDuplication}</span>
          </Link>
        </div>
        <div>
          <Text variant="title-small" as="p">
            Other Issues:
          </Text>
          <Link
            to={`https://codeclimate.com/repos/${repoID}/issues?category%5B%5D=bugrisk&status%5B%5D=&status%5B%5D=open&status%5B%5D=confirmed`}
          >
            <span className={styles.fontSize}>{numberOfOtherIssues}</span>
          </Link>
        </div>
      </div>
    </>
  );
};
