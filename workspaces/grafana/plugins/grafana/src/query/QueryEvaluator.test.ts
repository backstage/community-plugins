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

import { EvaluationContext, QueryEvaluator } from './QueryEvaluator';

type example = {
  context: EvaluationContext;
  expectedResult: boolean;
};

type scenario = {
  query: string;
  examples: example[];
};

describe('QueryEvaluator', () => {
  const evaluator = new QueryEvaluator();

  it('throw on unknown literal', () => {
    const parsedQuery = evaluator.parse('unknown @> "my-service"');

    expect(() => {
      evaluator.evaluate(parsedQuery, {});
    }).toThrow('identifier unknown does not exist');
  });

  it('throw on unknown operator', () => {
    const parsedQuery = evaluator.parse(
      'tags @> "my-service" and tags @> "foo" == 42',
    );

    expect(() => {
      evaluator.evaluate(parsedQuery, { tags: [] });
    }).toThrow('unknown node type');
  });

  it('throw on invalid syntax', () => {
    expect(() => {
      evaluator.parse('tags @> "my-service');
    }).toThrow('Unclosed quote after "my-service"');
  });

  it('evaluates common queries', () => {
    const query =
      "(tags @> 'my-service' || tags @> 'my-service-slo') && tags @> 'generated'";
    const parsedQuery = evaluator.parse(query);

    expect(
      evaluator.evaluate(parsedQuery, { tags: ['my-service', 'generated'] }),
    ).toBe(true);
    expect(
      evaluator.evaluate(parsedQuery, {
        tags: ['my-service-slo', 'generated'],
      }),
    ).toBe(true);
    expect(
      evaluator.evaluate(parsedQuery, {
        tags: ['my-service-slo', 'not-generated'],
      }),
    ).toBe(false);
  });

  it('evaluates queries correctly', () => {
    const testCases: scenario[] = [
      {
        query: 'tags @> "foo"',
        examples: [
          { context: { tags: ['foo', 'bar', 'baz'] }, expectedResult: true },
          { context: { tags: ['bar', 'foo', 'baz'] }, expectedResult: true },
          { context: { tags: ['bar', 'baz'] }, expectedResult: false },
        ],
      },
      {
        query: 'tags @> "bar" || tags @> "baz"',
        examples: [
          { context: { tags: ['foo', 'bar', 'baz'] }, expectedResult: true },
          { context: { tags: ['bar', 'baz'] }, expectedResult: true },
          { context: { tags: ['joe', 'la', 'frite'] }, expectedResult: false },
        ],
      },
      {
        query: 'tags @> "bar" && tags @> "baz"',
        examples: [
          { context: { tags: ['foo', 'bar', 'baz'] }, expectedResult: true },
          { context: { tags: ['foo', 'baz'] }, expectedResult: false },
        ],
      },
      {
        query: '(tags @> "bar" && tags @> "baz") || tags @> "joe"',
        examples: [
          { context: { tags: ['foo', 'bar', 'baz'] }, expectedResult: true },
          { context: { tags: ['joe', 'baz'] }, expectedResult: true },
          { context: { tags: ['foo', 'baz'] }, expectedResult: false },
        ],
      },
      {
        query: '!(tags @> "bar" && tags @> "baz")',
        examples: [
          { context: { tags: ['foo', 'bar', 'baz'] }, expectedResult: false },
          { context: { tags: ['joe', 'baz'] }, expectedResult: true },
          { context: { tags: ['foo', 'baz'] }, expectedResult: true },
        ],
      },
    ];

    testCases.forEach(testCase => {
      const parsedQuery = evaluator.parse(testCase.query);

      testCase.examples.forEach(scenario => {
        expect(evaluator.evaluate(parsedQuery, scenario.context)).toBe(
          scenario.expectedResult,
        );
      });
    });
  });
});
