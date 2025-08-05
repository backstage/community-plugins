Compile code:

```
yarn install
```

Configure `app-config.local.yaml`. See more in [`Configuration.md`](./Configuration.md).

Open `examples/org.yaml` and set the email for the `guest` user. This email should match a user in your ServiceNow instance.

Open `examples/entities.yaml` and find the `example-website` component. Note the value of the `servicenow.com/entity-id` annotation (e.g., 'website-for-my-nice-service').

In your ServiceNow instance, create a few incidents. Make sure to set the custom field `servicenow.com/entity-id` on these incidents to the same value from the annotation in `examples/entities.yaml`.

Start the development instance:

```
yarn start
```

Open catalog http://localhost:3000/catalog/default/component/example-website/servicenow, it should display list tickets.
