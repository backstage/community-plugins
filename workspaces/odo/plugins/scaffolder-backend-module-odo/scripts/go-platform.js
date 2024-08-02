'use strict';

function getGoOs() {
  if (process.platform === 'win32') {
    return 'windows';
  }

  return process.platform;
}

function getGoArch() {
  switch (process.arch) {
    case 'ia32':
      return '386';
    case 'x64':
      return 'amd64';
    default:
      return process.arch;
  }
}

module.exports = {
  GOOS: getGoOs(),
  GOARCH: getGoArch(),
};
