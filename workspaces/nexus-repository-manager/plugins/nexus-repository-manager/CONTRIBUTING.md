# Setting up the development environment for Nexus Repository Manager plugin

In [Backstage plugin
terminology](https://backstage.io/docs/local-dev/cli-build-system#package-roles),
the Nexus Repository Manager plugin is a front-end plugin. You can start a live
development session from the repository root using the following command (only
works from the root directory):

```console
yarn start --filter=@janus-idp/backstage-plugin-nexus-repository-manager
```

Alternatively, you can run the following commands from any directory in the repository:

```console
yarn workspace @janus-idp/backstage-plugin-nexus-repository-manager generate
yarn workspace @janus-idp/backstage-plugin-nexus-repository-manager run start
```

## Setting up the full dev app

To set up an instance of the plugin running in a full Backstage instance, to
make real calls against a Nexus instance, you'll want to do the following:

1. Link the plugin to the dev app as described in the
   [README](/README.md#develop-a-new-plugin-together-with-a-local-backstage-instance)

1. Follow the instructions in the [plugin README](README.md) to add the
   plugin to `EntityPage.tsx`

1. Edit [`app-config.local.yaml`](/app-config.local.yaml) to have your Nexus URL
   (example config in the [plugin README](README.md)), and pull in custom entites:

   ```yaml
   # ...see proxy config in README

   catalog:
     locations:
       - type: file
         target: ../../plugins/nexus-repository-manager/dev/entities.yaml
   ```

1. Edit the [dev entities file](dev/entities.yaml) to have annotations for the
   artifacts you wish to test (ensure they are present in your Nexus instance)

1. (Optional): Tell git to assume the modified files are unchanged, so that
   status/diff commands are representative of your current work:

   ```shell
   git update-index --skip-worktree \
       app-config.local.yaml \
       packages/app/package.json \
       packages/app/src/components/catalog/EntityPage.tsx \
       plugins/nexus-repository-manager/dev/entites.yaml
   ```

1. Start the app, and verify data is being displayed correctly by navigating to
   the "Build Artifacts" tab of one of the example components
