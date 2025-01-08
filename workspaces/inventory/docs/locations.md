# Locations

The locations will use the name and title from the entity metadata and adds a uni-directional link to a parent location.

Example:

```yaml
apiVersion: inventory.backstage.io/v1alpha1
kind: Building
metadata:
  name: home
---
apiVersion: inventory.backstage.io/v1alpha1
kind: Room
metadata:
  name: kitchen
spec:
  parent: building:home
```

## Relations

- Locations could be in other locations.
- Locations should be uni-directional. TODO: validation
- A user should be able to see all items in a parent-location also if it's just linked to the child-location. TODO: auto-assign all parent-locations of an item as relationship?
