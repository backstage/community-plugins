import { AssetHash, AssetXO } from '../../types';

export function getHash(asset: AssetXO | undefined): AssetHash | undefined {
  if (!asset?.checksum) {
    return undefined;
  }

  // SHA-1/MD5 are the defaults for Maven
  // SHA-1 picked over MD5 as it seems to always be present
  // @see {@link https://maven.apache.org/resolver/about-checksums.html}
  if (asset.format === 'maven2' && 'sha1' in asset.checksum) {
    return {
      algorithm: 'sha1',
      value: String(asset.checksum.sha1),
    };
  }

  // The checksum should be present with a sha256
  if ('sha256' in asset.checksum) {
    return {
      algorithm: 'sha256',
      value: String(asset.checksum.sha256),
    };
  }

  return undefined;
}
