# Locations

The locations will use the name and title from the entity metadata and adds a uni-directional link to a parent location.

Example:

```yaml
apiVersion: inventory.backstage.io/v1alpha1
kind: Location
metadata:
  name: home
spec:
  type: building
---
apiVersion: inventory.backstage.io/v1alpha1
kind: Location
metadata:
  name: kitchen
spec:
  type: room
  parent: home
```

The biggest issue with `kind: Location` is that these items would be displayed in the catalog together with `backstage.io`/`Locations`, which works fine but looks confusing.

Alternative:

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
  parent: building:home # I see this as a pro and con
```

## Relations

- Locations could be in other locations.
- Locations should be uni-directional.
- A user should be able to see all items in a parent-location also if it's just linked to the child-location.
