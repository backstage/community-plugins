import { OptionValues } from 'commander';

export default async (opts: OptionValues) => {
  const { monorepoPath, pluginName } = opts as {
    monorepoPath: string;
    pluginName: string;
  };

  console.log(`Migrating plugin ${pluginName} in monorepo at ${monorepoPath}`);
};
