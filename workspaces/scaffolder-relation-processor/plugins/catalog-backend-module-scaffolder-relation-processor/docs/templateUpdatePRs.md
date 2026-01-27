# Template Update Pull Requests

This plugin can automatically create pull requests (or merge requests for GitLab) to keep scaffolded repositories in sync with their source templates. When a template version changes, the plugin compares the template files with the scaffolded repository and creates a PR with any necessary updates.

## How It Works

1. **Template Update Detection**: When the plugin detects that a scaffolder template has been updated to a new version, it triggers the PR creation process for all entities scaffolded from that template.

2. **File Comparison**: The plugin fetches files from both the template repository and each scaffolded repository, then compares them to identify:

   - Files that need to be **updated** (content differs between template and scaffolded repo)
   - Files that need to be **created** (exist in template but not in scaffolded repo)
   - Files that need to be **deleted** (exist in scaffolded repo but no longer in template)

3. **PR Creation**: For each scaffolded entity with differences, a pull request is created containing all the necessary file changes.

4. **Reviewer Assignment**: If the scaffolded entity's owner is a **User** (not a Group), they are automatically assigned as a reviewer on the PR.

5. **Notification**: If notifications are enabled, entity owners receive a notification with a link to the created PR.

> ⚠️ **Important**: Always manually review the generated pull requests before merging. The automatic comparison may include changes that are intentionally different in your scaffolded repository, or may not account for project-specific customizations.

## Prerequisites

### VCS Integration Configuration

The plugin requires appropriate VCS (Version Control System) integrations to be configured in your `app-config.yaml`. The plugin currently supports **GitHub** and **GitLab**.

For detailed configuration of these integrations, see the [Backstage Integrations documentation](https://backstage.io/docs/integrations/).

### Entity Requirements

For the PR feature to work, scaffolded entities must have:

1. **`spec.scaffoldedFrom`**: Reference to the template entity (e.g., `template:default/my-template`)

2. **`backstage.io/managed-by-location`**: This annotation is automatically added by the catalog during entity fetching and points to the source location from which the entity was fetched. The plugin uses this annotation to determine the repository URL for the scaffolded entity.

   > **Note**: The PR feature only works when this annotation is of type `url` and points to a GitHub or GitLab repository. Entities registered from other location types (e.g., `file`) are not supported for automatic PR creation.

## Configuration

Enable the PR feature in your `app-config.yaml`:

```yaml
scaffolder:
  pullRequests:
    templateUpdate:
      enabled: true
```

### Combined with Notifications

You can enable both PR creation and notifications together. Here's the behavior for each combination:

- **Both disabled**: No action taken on template updates
- **Only notifications enabled**: Notification sent to entity owners with link to catalog
- **Only PRs enabled**: PR created, no notification sent
- **Both enabled**: PR created, notification sent with link to PR

Example configuration with both features enabled:

```yaml
scaffolder:
  notifications:
    templateUpdate:
      enabled: true
      message:
        title: '$ENTITY_DISPLAY_NAME has a template update PR ready'
        description: 'A pull request has been created to sync template changes: $PR_LINK'
  pullRequests:
    templateUpdate:
      enabled: true
```

When PRs are enabled, you can use the `$PR_LINK` template variable in your notification message to include a link to the created PR. If the PR creation fails, a notification with default (not custom) text is still sent along with error details.

## PR Details

### Branch Naming

PRs are created on a branch named:

```
[component-name]/template-upgrade-v[new-version]
```

For example: `my-service/template-upgrade-v1.2.0`

### PR Title

```
Template Upgrade: Update [Template Name] from [old-version] to [new-version]
```

## Reviewer Assignment

The plugin automatically assigns a reviewer to the PR if the scaffolded entity's owner is a **User** entity (not a Group). The reviewer assignment works as follows:

### For GitHub

The plugin looks for the `github.com/user-login` annotation on the owner User entity:

```yaml
# User entity example
apiVersion: backstage.io/v1alpha1
kind: User
metadata:
  name: john.doe
  annotations:
    github.com/user-login: johndoe # GitHub username
spec:
  profile:
    displayName: John Doe
```

### For GitLab

The plugin looks for the `gitlab.com/user-login` annotation on the owner User entity:

```yaml
# User entity example
apiVersion: backstage.io/v1alpha1
kind: User
metadata:
  name: john.doe
  annotations:
    gitlab.com/user-login: johndoe # GitLab username
spec:
  profile:
    displayName: John Doe
```

If the owner is a **Group** or the user annotation is not present, the PR is created without a reviewer assignment.

## Error Handling

### No Changes Detected

If there are no differences between the template and the scaffolded repository, no PR is created and no notification is sent for that entity.

### PR Creation Failures

If PR creation fails (e.g., authentication issues, API errors), the plugin:

- Logs the error
- Sends a notification to the entity owner (if notifications are enabled) with error details
- The notification uses a default message indicating the failure, regardless of any custom message configuration

Common failure reasons:

- Missing or invalid VCS integration credentials
- Insufficient permissions to create branches or PRs
- Network connectivity issues
- Rate limiting by the VCS provider

## Limitations

- **Template variable resolution**: During file comparison, the plugin attempts to replace template variables (e.g., `${{ values.name }}`) with the actual values from the scaffolded repository by matching YAML keys. However, this has limitations:

  - If a key cannot be matched between the template and scaffolded file, the raw template syntax will appear in the PR and must be resolved manually
  - Variables that were left empty during scaffolding may appear as differences
  - Only simple key-value patterns are matched; inline variables or complex nested structures may not be resolved correctly
  - Jinja2 conditionals (`{% if %}`, `{% endif %}`, etc.) are automatically stripped, but conditional content may still cause unexpected differences

- **File-based comparison only**: The plugin compares files at the repository root level based on the entity's managed-by-location annotation. It does not handle complex template structures with multiple directories.

- **No conflict resolution**: If the scaffolded repository has diverged significantly from the template, the PR may contain merge conflicts that need manual resolution.

- **Single PR per template update**: Each template version change creates new PRs for all scaffolded entities. If a previous PR is still open, the creation may fail if a branch with the same name already exists.

## Troubleshooting

### PRs Not Being Created

1. **Check VCS integration**: Ensure your `app-config.yaml` has the correct integration configured for your VCS provider.

2. **Check entity annotations**: Verify that scaffolded entities have the `backstage.io/managed-by-location` annotation pointing to a valid repository URL.

3. **Check logs**: Look for error messages in the Backstage backend logs related to `scaffolder-relation-processor`.

4. **Verify permissions**: Ensure the token or GitHub App has permissions to:
   - Read repository contents
   - Create branches
   - Create pull requests
   - Request reviewers (for reviewer assignment)

### Reviewer Not Being Assigned

1. **Check owner type**: Reviewer assignment only works for User entities, not Groups.

2. **Check user annotations**: Ensure the owner User entity has the appropriate VCS login annotation (`github.com/user-login` or `gitlab.com/user-login`).
