import YAML from 'yaml';

export type YAMLCodeDataType = {
  limits: {
    cpu: number | string;
    memory: number | string;
  };
  requests: {
    cpu: number | string;
    memory: number | string;
  };
};

export const generateYAMLCode = (yamlCodeData: YAMLCodeDataType) => {
  const yamlCode = {
    limits: {
      cpu: yamlCodeData.limits.cpu,
      memory: yamlCodeData.limits.memory,
    },
    requests: {
      cpu: yamlCodeData.requests.cpu,
      memory: yamlCodeData.requests.memory,
    },
  };

  const yamlCodeString = YAML.stringify(yamlCode).replace(/"/g, ''); // prettify;

  return yamlCodeString;
};
