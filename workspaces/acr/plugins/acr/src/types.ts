export type TagsResponse = {
  imageName: string;
  registry: string;
  tags: Tag[];
};

export type Tag = {
  name: string;
  createdTime: Date;
  lastUpdateTime: Date;
  digest: string;
  signed: boolean;
  changeableAttributes: ChangeableAttributes;
};

export type ChangeableAttributes = {
  deleteEnabled: boolean;
  listEnabled: boolean;
  readEnabled: boolean;
  writeEnabled: boolean;
};

export type TagRow = {
  name: string;
  createdTime: string;
  lastModified: string;
  manifestDigest: string;
  id: string;
};
