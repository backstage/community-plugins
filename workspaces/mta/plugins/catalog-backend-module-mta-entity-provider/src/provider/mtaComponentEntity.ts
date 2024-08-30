import {
  ComponentEntityV1alpha1,
  EntityMeta,
  EntityRelation,
} from '@backstage/catalog-model';

export class MTAComponentEntity implements ComponentEntityV1alpha1 {
  apiVersion: 'backstage.io/v1alpha1' | 'backstage.io/v1beta1' =
    'backstage.io/v1alpha1';
  kind: 'Component' = 'Component';
  spec: {
    type: string;
    lifecycle: string;
    owner: string;
    subcomponentOf?: string | undefined;
    providesApis?: string[] | undefined;
    consumesApis?: string[] | undefined;
    dependsOn?: string[] | undefined;
    system?: string | undefined;
  };
  metadata: EntityMeta;
  relations?: EntityRelation[] | undefined;

  constructor(
    spec: {
      type: string;
      lifecycle: string;
      owner: string;
      subcomponentOf?: string;
      providesApis?: string[];
      consumesApis?: string[];
      dependsOn?: string[];
      system?: string;
    },
    metadata: EntityMeta,
  ) {
    this.spec = spec;
    this.metadata = metadata;
  }
}
