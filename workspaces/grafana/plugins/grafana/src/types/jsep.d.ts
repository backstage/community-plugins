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

/**
 * Local ESM-compatible type shim for jsep.
 * The upstream jsep package uses `export = jsep` which TypeScript 5.8+
 * rejects when targeting ECMAScript modules (TS1203). This shim re-declares
 * the same types using `export default` syntax.
 */

declare function jsep(val: string | jsep.Expression): jsep.Expression;

declare namespace jsep {
  type baseTypes =
    | string
    | number
    | boolean
    | RegExp
    | null
    | undefined
    | object;

  interface Expression {
    type: string;
    [key: string]: baseTypes | Expression | Array<baseTypes | Expression>;
  }

  interface ArrayExpression extends Expression {
    type: 'ArrayExpression';
    elements: Array<null | Expression>;
  }

  interface BinaryExpression extends Expression {
    type: 'BinaryExpression';
    operator: string;
    left: Expression;
    right: Expression;
  }

  interface CallExpression extends Expression {
    type: 'CallExpression';
    arguments: Expression[];
    callee: Expression;
  }

  interface Compound extends Expression {
    type: 'Compound';
    body: Expression[];
  }

  interface SequenceExpression extends Expression {
    type: 'SequenceExpression';
    expressions: Expression[];
  }

  interface ConditionalExpression extends Expression {
    type: 'ConditionalExpression';
    test: Expression;
    consequent: Expression;
    alternate: Expression;
  }

  interface Identifier extends Expression {
    type: 'Identifier';
    name: string;
  }

  interface Literal extends Expression {
    type: 'Literal';
    value: boolean | number | string | RegExp | null;
    raw: string;
  }

  interface MemberExpression extends Expression {
    type: 'MemberExpression';
    computed: boolean;
    object: Expression;
    property: Expression;
    optional?: boolean;
  }

  interface ThisExpression extends Expression {
    type: 'ThisExpression';
  }

  interface UnaryExpression extends Expression {
    type: 'UnaryExpression';
    operator: string;
    argument: Expression;
    prefix: boolean;
  }

  type ExpressionType =
    | 'Compound'
    | 'SequenceExpression'
    | 'Identifier'
    | 'MemberExpression'
    | 'Literal'
    | 'ThisExpression'
    | 'CallExpression'
    | 'UnaryExpression'
    | 'BinaryExpression'
    | 'ConditionalExpression'
    | 'ArrayExpression';

  type PossibleExpression = Expression | undefined;

  interface HookScope {
    index: number;
    readonly expr: string;
    readonly char: string;
    readonly code: number;
    gobbleSpaces: () => void;
    gobbleExpressions: (untilICode?: number) => Expression[];
    gobbleExpression: () => Expression;
    gobbleBinaryOp: () => PossibleExpression;
    gobbleBinaryExpression: () => PossibleExpression;
    gobbleToken: () => PossibleExpression;
    gobbleTokenProperty: (node: Expression) => Expression;
    gobbleNumericLiteral: () => PossibleExpression;
    gobbleStringLiteral: () => PossibleExpression;
    gobbleIdentifier: () => PossibleExpression;
    gobbleArguments: (untilICode: number) => PossibleExpression;
    gobbleGroup: () => Expression;
    gobbleArray: () => PossibleExpression;
    throwError: (msg: string) => never;
  }

  type HookType =
    | 'gobble-expression'
    | 'after-expression'
    | 'gobble-token'
    | 'after-token'
    | 'gobble-spaces';
  type HookCallback = (this: HookScope, env: { node?: Expression }) => void;
  type HookTypeObj = Partial<{ [key in HookType]: HookCallback }>;

  interface IHooks extends HookTypeObj {
    add(name: HookType, cb: HookCallback, first?: boolean): void;
    add(obj: { [name in HookType]: HookCallback }, first?: boolean): void;
    run(name: string, env: { context?: typeof jsep; node?: Expression }): void;
  }
  let hooks: IHooks;

  interface IPlugin {
    name: string;
    init: (this: typeof jsep) => void;
  }
  interface IPlugins {
    registered: { [name: string]: IPlugin };
    register: (...plugins: IPlugin[]) => void;
  }
  let plugins: IPlugins;

  let unary_ops: { [op: string]: any };
  let binary_ops: { [op: string]: number };
  let right_associative: Set<string>;
  let additional_identifier_chars: Set<string>;
  let literals: { [literal: string]: any };
  let this_str: string;

  function addBinaryOp(
    operatorName: string,
    precedence: number,
    rightToLeft?: boolean,
  ): void;
  function addUnaryOp(operatorName: string): void;
  function addLiteral(literalName: string, literalValue: any): void;
  function addIdentifierChar(identifierName: string): void;
  function removeBinaryOp(operatorName: string): void;
  function removeUnaryOp(operatorName: string): void;
  function removeLiteral(literalName: string): void;
  function removeIdentifierChar(identifierName: string): void;
  function removeAllBinaryOps(): void;
  function removeAllUnaryOps(): void;
  function removeAllLiterals(): void;

  const version: string;
}

export default jsep;
