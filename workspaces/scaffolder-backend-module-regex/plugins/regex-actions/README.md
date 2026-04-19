# Regex actions for Backstage

This plugin provides [Backstage](https://backstage.io/) template [actions](https://backstage.io/docs/features/software-templates/builtin-actions) for [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp).

The following actions are currently supported in this plugin:

- [String search](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match)
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

### Action : regex:search

Searches for strings that match a regular expression pattern in JSON objects. Returns matches from a specified property in each object, preserving all original properties for chaining operations.

#### Input

| Parameter Name    |   Type   | Required | Description                                                                                |
| ----------------- | :------: | :------: | ------------------------------------------------------------------------------------------ |
| `objects`         | object[] |   Yes    | An array of JSON objects to search in                                                      |
| `property`        |  string  |   Yes    | The property name to search in each object                                                 |
| `pattern`         |  string  |   Yes    | The regex pattern to match like in `String.prototype.match()`                              |
| `outputKey`       |  string  |   Yes    | The key to use for the matches in the output objects                                       |
| `firstOnly`       | boolean  |   Yes    | If true, return only the first match as a string; if false, return all matches as an array |
| `global`          | boolean  |    No    | Global flag - find all matches instead of stopping after the first match                   |
| `multiline`       | boolean  |    No    | Multiline flag - ^ and $ match the beginning and end of each line                          |
| `caseInsensitive` | boolean  |    No    | Case insensitive flag - ignore case when matching                                          |
| `sticky`          | boolean  |    No    | Sticky flag - match must start at lastIndex                                                |
| `unicode`         | boolean  |    No    | Unicode flag - treat pattern as unicode                                                    |
| `dotAll`          | boolean  |    No    | DotAll flag - . matches newlines                                                           |
| `hasIndices`      | boolean  |    No    | HasIndices flag - match indices are included in the result                                 |

> **Warning**
>
> The `pattern` string cannot have a leading or trailing forward slash
>
> All original properties from the input objects are preserved in the output, allowing for chaining multiple search operations

#### Output

| Name      |   Type   | Description                                                                                                                                  |
| --------- | :------: | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `results` | object[] | An array of the input objects with all original properties preserved and a new property (named by `outputKey`) containing the search results |
