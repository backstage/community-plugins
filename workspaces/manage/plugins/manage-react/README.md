# Manage, react package

This package is used by the Manage plugin, and contains components and hooks useful for building components to be used in the Manage page, in an entity tab or outside, or an entity table column.

It also acts as the base for all packages that extends the entity table columns and need a provider. Those packages can provide an api ref of a type that extends the exported type `ManageModuleApi`. When defining the `manageApiRef`, an implementor can add this api ref when doing `createManageApiFactory([...])`.

The hooks in this package can generally be used anywhere in the manage page unless stated otherwise.

## Hooks

### useOwnedKinds

Returns the kinds configured in the ManagePage component (or defaults to the original kinds in Backstage). If the parameter `onlyOwned` is true, it will only return the kinds of entities actually owned by the user.

### useOwnedEntities

Returns an array of all owned entities. By passing a kind (or array of kinds) as parameter, only entities of those kinds are returned.

### useManagedEntities

Returns all managed entities, i.e. owned entities and starred entities.

### useOwners

Returns an object on the form:

```ts
{
  groups: Entity[];
  ownedEntityRefs: string[];
}
```

`ownedEntityRefs` is a list of entity refs for all owners (incl. the current user). `groups` is a list of `Entity` objects for the owners that are groups.

These lists are ordered by:

1. Immediate group membership
2. Groups higher up the group hierarchy
3. User

Within each such category, the entities are ordered by their title/name alpha-numerically.

### useCurrentKind

Returns the _current_ kind, if used within an entity tab. If called from outside an entity tab, returns `undefined`.

### useCurrentKinds

Same as `useCurrentKind` but returns an array of kinds, either only the _current_ kind, but fallbacks to the result of `useOwnedKinds`,

### useCurrentKindTitle

Returns the name (title) of the current kind, e.g. "components" or "systems". Can also be "entities" if the combined view is used, or "starred entities" if that tab is active.

This can be used by modules that extend the page, and is currently used by `@backstage-community/plugin-manage-module-tech-insights` for the accordion title.

## Components

### Accordion

This is a MUI Accordion with the expanded state saved in user settings.

### GaugeCard

This is the `@backstage/core-components` `GuageCard` component with pre-defined props to make them appear the same, when showing multiple gauges from different plugin modules.

### GaugeGrid

Similar to `GaugeCard`, `GaugeGrid` can be used instead, which shows smaller cards for each Gauge.

### ColumnIconError

When implementing a column provider, this component can act as a fallback error icon.

### ColumnIconPercent

When implementing a column provider, this component can show a (circular) percentage gauge.

### ReorderableTabs

A component rendering tabs (although as a button group) with drag-and-drop support. This is used in the Settings page to give the user the ability to reorder the tabs and kinds.

### TabContentFullHeight

The helper component `TabContentFullHeight` can be used as a wrapper around the content for a tab. It sets its exact height to adapt to the screen size (and updates when the window changes size). The optional boolean prop `resizeChild` which can be set to also update the size of the (one and only) child component. The prop `bottomMargin` can be used to set a bottom margin other than the default.
