## API Report File for "@backstage-community/plugin-codescene"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts
import { BackstagePlugin } from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';
import { JSX as JSX_2 } from 'react/jsx-runtime';
import { RouteRef } from '@backstage/core-plugin-api';
import { SvgIconProps } from '@material-ui/core/SvgIcon';

// @public (undocumented)
export const CODESCENE_PROJECT_ANNOTATION = 'codescene.io/project-id';

// @public (undocumented)
export const CodeSceneEntityFileSummary: () => JSX_2.Element;

// @public (undocumented)
export const CodeSceneEntityKPICard: () => JSX_2.Element;

// @public (undocumented)
export const CodeSceneIcon: (props: SvgIconProps) => JSX_2.Element;

// @public (undocumented)
export const CodeScenePage: () => JSX_2.Element;

// @public (undocumented)
export const codescenePlugin: BackstagePlugin<
  {
    root: RouteRef<undefined>;
    projectPage: RouteRef<{
      projectId: string;
    }>;
  },
  {},
  {}
>;

// @public (undocumented)
export const CodeSceneProjectDetailsPage: () => JSX_2.Element;

// @public (undocumented)
export const isCodeSceneAvailable: (entity: Entity) => boolean;

// (No @packageDocumentation comment for this package)
```
