# @backstage-community/plugin-feedback-common

Welcome to the common library package for the **Feedback** plugin!

This package is designed to share code, models, types, constants, and permission definitions between the `@backstage-community/plugin-feedback` frontend and `@backstage-community/plugin-feedback-backend` backend plugins.

## Constants

This package defines default categories and tags used to categorize user feedback and bug reports:

- `DEFAULT_ERROR_LIST`: A set of default strings indicating various error and UI/UX friction points for bugs.
  - `Slow Loading`
  - `Not Responsive`
  - `Navigation`
  - `UI Issues`
  - `Other`
- `DEFAULT_EXPERIENCE_LIST`: Default options for rating general user experience.
  - `Excellent`
  - `Good`
  - `Needs Improvement`
  - `Other`

## Permissions

The package provides standard permissions definitions used to secure feedback actions:

- `RESOURCE_TYPE_FEEDBACK`: `'feedback'` (the default resource type reference)
- `feedbackReadPermission`: Read-only permission (`feedback.read`).
- `feedbackCreatePermission`: Create permission (`feedback.create`).
- `feedbackUpdatePermission`: Update permission for specific resource instances (`feedback.update`).
- `feedbackDeletePermission`: Delete permission for specific resource instances (`feedback.delete`).
- `feedbackPermissions`: List containing all feedback permissions.
- `isFeedbackPermission(permission: Permission)`: Utility function checking if a given permission is part of the feedback permissions group.

## Installation and Usage

To use this package in other plugins or packages within your Backstage instance:

```bash
yarn add @backstage-community/plugin-feedback-common
```
