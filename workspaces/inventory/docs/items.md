# Items

Items will use metadata name, title as defined in https://backstage.io/docs/features/software-catalog/descriptor-format

The additional spec will contain information like:

- assigned or responsible user (I guess owner is misleading here)
- expected `location` (ref to a location entity)
- last seen location (ref to a location entity)
- rented to (more for personal belongings)
- identifiers (a record of IDs and serial numbers)
- a note?
- picture(s)?
- history?

(Exact property names tbd.)

Example:

```yaml
apiVersion: inventory.backstage.io/v1alpha1
kind: Item
metadata:
  name: coffee-machine
spec:
  location: room:kitchen
```

## Relations

- Unsure if items could be saved in other items.
- Items could be saved in locations.
