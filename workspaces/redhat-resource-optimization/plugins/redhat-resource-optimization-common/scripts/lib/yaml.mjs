import { Document as YamlDocument } from 'yaml';

export function toYaml(jsonObject) {
  const yaml = new YamlDocument(jsonObject);
  return yaml.toString();
}
