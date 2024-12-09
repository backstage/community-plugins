import type { AssetXO } from '../../types';

// Extensions we don't want to fetch extra data for, and don't want to display
// as their own entity.
const MAVEN_IGNORED_ASSET_EXTENSIONS = new Set<string>([
  'pom',
  'sha1',
  'md5',
  'sha256',
]);

// Whether an asset has data we might want to fetch, and/or display as its own
// entity.
export function isPrimaryAsset(asset: AssetXO): boolean {
  if (!asset.maven2) {
    return true;
  }
  const { extension } = asset.maven2;
  if (extension === undefined) {
    return true;
  }
  // Extension can be `jar.md5` or `zip.sha1`, for example
  return !MAVEN_IGNORED_ASSET_EXTENSIONS.has(extension.split('.').pop() ?? '');
}
