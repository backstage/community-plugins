export const caesarCipherDecrypt = (activationKey: string): string => {
  let tmp = '';
  const OFFSET = 4;
  for (let i = 0; i < activationKey.length; i++) {
    tmp += String.fromCharCode(activationKey.charCodeAt(i) - OFFSET);
  }

  const reversed = tmp.split('').reverse().join('');
  return Buffer.from(reversed, 'base64').toString();
};
