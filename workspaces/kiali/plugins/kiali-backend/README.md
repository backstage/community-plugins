# Kiali Backend plugin for Backstage

This is the backend part of the Kiali plugin for Backstage. It is called by and responds to requests from the frontend [`@backstage-community/plugin-kiali`](https://github.com/backstage/community-plugins/tree/main/workspaces/kiali/plugins/kiali) plugin.

It directly interfaces with the Kiali API control plane to obtain information about objects that will then be presented at the front end.

## Setup & Configuration

This plugin must be explicitly added to a Backstage app, along with it's peer frontend plugin.

The plugin requires configuration in the Backstage `app-config.yaml` to connect to a Kiali API control plane.

In addition, configuration of an entity's `catalog-info.yaml` helps identify which specific ServiceMesh object(s) should be presented on a specific entity catalog page.
