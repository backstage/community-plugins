# Manage page extension: tech-insights

To add columns to the table of owned entities, showing tech insight checks, use the `manageTechInsightsColumns` function. To show gauges (e.g. above the tables), use `ManageTechInsightsCards` or `ManageTechInsightsGrid`.

First, ensure to install the tech-insight module by adding its API ref to `createManageApiFactory`:

```ts
import {
  createManageTechInsightsApiFactory,
  manageTechInsightsApiRef,
} from '@backstage-community/plugin-manage-module-tech-insights';

[
  // ...,
  createManageTechInsightsApiFactory(),
  createManageApiFactory({
    extensions: [manageTechInsightsApiRef],
  }),
];
```

In `Manage.tsx` (as described in the README for `@backstage-community/plugin-manage`):

```tsx
import {
  manageTechInsightsColumns,
  ManageTechInsightsCards,
  ManageTechInsightsGrid,
} from '@backstage-community/plugin-manage-module-tech-insights';

export function Manage() {
  return (
    <ManageTabs
      combined={{
        header: <ManageTechInsightsGrid inAccordion />,
        columns: [manageTechInsightsColumns({ combined: true })],
      }}
      starred={{
        header: <ManageTechInsightsGrid inAccordion />,
        columns: [manageTechInsightsColumns({ combined: true })],
      }}
      kinds={{
        [MANAGE_KIND_COMMON]: {
          header: <ManageTechInsightsCards inAccordion />,
          columns: [manageTechInsightsColumns()],
        },
        component: {
          // There are maybe too many tech-insights checks for components to
          // show one per column.
          // The `combined` option squeezes them into one column.
          columns: [manageTechInsightsColumns({ combined: true })],
        },
      }}
    />
  );
}
```
