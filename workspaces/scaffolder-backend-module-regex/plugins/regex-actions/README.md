# Regex actions for Backstage

This plugin provides [Backstage](https://backstage.io/) template [actions](https://backstage.io/docs/features/software-templates/builtin-actions) for [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp).

The following actions are currently supported in this plugin:

- [String replacement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace)

## Prerequisites

- A [Backstage](https://backstage.io/docs/getting-started/) project

## Installation

Run the following command to install the action package in your Backstage project:

```console
yarn workspace backend add @backstage-community/plugin-scaffolder-backend-module-regex
```

### Installing the action on the new backend

Add the following to your `packages/backend/src/index.ts` file:

```ts title="packages/backend/src/index.ts"
const backend = createBackend();

// Add the following line
backend.add(
  import('@backstage-community/plugin-scaffolder-backend-module-regex'),
);

backend.start();
```

## Usage

### Action : regex:replace

| Parameter Name             |   Type   | Required | Description                                                                     |
| -------------------------- | :------: | :------: | ------------------------------------------------------------------------------- |
| `regExps[].pattern`        |  string  |   Yes    | The regex pattern to match the value like in `String.prototype.replace()`       |
| `regExps[].flags`          | string[] |    No    | The flags for the regex, possible values are: `g`, `m`, `i`, `y`, `u`, `s`, `d` |
| `regExps[].replacement`    |  string  |   Yes    | The replacement value for the regex like in `String.prototype.replace()`        |
| `regExps[].values[].key`   |  string  |   Yes    | The key to access the regex value                                               |
| `regExps[].values[].value` |  string  |   Yes    | The input value of the regex                                                    |

> **Warning**
>
> The `regExps[].pattern` string cannot have a leading or trailing forward slash
>
> The `regExps[].values[].key` values must all be unique since the key is used for `values.<key>` to access the return value

#### Output

| Name           |  Type  | Description                                                                                        |
| -------------- | :----: | -------------------------------------------------------------------------------------------------- |
| `values.<key>` | string | A new string, with one, some, or all matches of the pattern replaced by the specified replacement. |
