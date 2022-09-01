import { BigNumber, utils } from 'ethers';

export function getRandomBytes() {
  const bytes8Array = new Uint8Array(32);
  self.crypto.getRandomValues(bytes8Array);
  const bytes32 = '0x' + bytes8Array.reduce((o, v) => o + ('00' + v.toString(16)).slice(-2), '');
  return bytes32;
}

export function formatStrToBigNumber(str: string, decimals: number = 18): BigNumber {
  return utils.parseUnits(str, decimals);
}
