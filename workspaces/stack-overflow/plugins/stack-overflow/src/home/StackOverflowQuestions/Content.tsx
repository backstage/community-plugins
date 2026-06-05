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

import { useApi } from '@backstage/core-plugin-api';
import { Link } from '@backstage/core-components';
import { Text } from '@backstage/ui';
import { RiExternalLinkLine } from '@remixicon/react';
import useAsync from 'react-use/esm/useAsync';
import _unescape from 'lodash/unescape';
import {
  StackOverflowQuestion,
  StackOverflowQuestionsContentProps,
} from '../../types';
import { stackOverflowApiRef } from '../../api';

/**
 * A component to display a list of stack overflow questions on the homepage.
 *
 * @public
 */

export const Content = (props: StackOverflowQuestionsContentProps) => {
  const { requestParams } = props;
  const stackOverflowApi = useApi(stackOverflowApiRef);

  const { value, loading, error } = useAsync(async (): Promise<
    StackOverflowQuestion[]
  > => {
    return await stackOverflowApi.listQuestions({ requestParams });
  }, []);

  if (loading) {
    return <Text>loading...</Text>;
  }

  if (error || !value || !value.length) {
    return <Text>could not load questions</Text>;
  }

  const getSecondaryText = (answer_count: number) =>
    answer_count > 1 ? `${answer_count} answers` : `${answer_count} answer`;

  return (
    <div>
      {value.map(question => (
        <div
          key={question.link}
          style={{
            padding: '8px 0',
            borderBottom: '1px solid var(--bui-border-1)',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
          }}
        >
          {props.icon && <div style={{ flexShrink: 0 }}>{props.icon}</div>}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Link to={question.link}>
              <Text weight="bold" as="h3">
                {_unescape(question.title)}
              </Text>
            </Link>
            <Text style={{ opacity: 0.7 }}>
              {getSecondaryText(question.answer_count)}
            </Text>
          </div>
          <a
            href={question.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="external-link"
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              cursor: 'pointer',
              color: 'var(--bui-fg-secondary)',
              textDecoration: 'none',
            }}
          >
            <RiExternalLinkLine size={20} />
          </a>
        </div>
      ))}
    </div>
  );
};
