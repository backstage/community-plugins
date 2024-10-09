import { isPrimaryAsset } from './is-primary-asset';

describe('isPrimaryAsset', () => {
  it.each(['pom', 'pom.sha1', 'jar.sha256', 'sha1'])(
    'should return false for %s',
    extension => {
      expect(isPrimaryAsset({ maven2: { extension } })).toBe(false);
    },
  );

  it.each(['jar', 'zip', 'tar.gz', 'proto'])(
    'should return true for %s',
    extension => {
      expect(isPrimaryAsset({ maven2: { extension } })).toBe(true);
    },
  );

  it('should return false for non-maven assets', () => {
    expect(isPrimaryAsset({ format: 'docker' })).toBe(true);
  });

  it('should return false for maven assets without an extension', () => {
    expect(isPrimaryAsset({ format: 'maven2' })).toBe(true);
    expect(isPrimaryAsset({ format: 'maven2', maven2: {} })).toBe(true);
  });
});
