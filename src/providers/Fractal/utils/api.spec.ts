import { constants } from 'ethers';
import { buildGnosisApiUrl } from './api';

describe('Gnosis URL builder tests', () => {
  test('Creates Gnosis Transaction Service URL, no params', async () => {
    const gnosisTransactionURL = buildGnosisApiUrl(
      'https://safe-transaction-goerli.safe.global',
      '/about',
      {},
      'v1'
    );
    const EXPECTED_URL = 'https://safe-transaction-Goerli.safe.global/api/v1/about';
    expect(gnosisTransactionURL).toEqual(EXPECTED_URL);
  });

  test('Creates Gnosis Transaction Service URL, with params', async () => {
    const gnosisTransactionURL = buildGnosisApiUrl(
      'https://safe-transaction-goerli.safe.global',
      `/safes/${constants.AddressZero}/multisig-transactions`,
      { target: constants.AddressZero },
      'v1'
    );
    const EXPECTED_URL = `https://safe-transaction-Goerli.safe.global/api/v1/safes/${constants.AddressZero}/multisig-transactions?target=${constants.AddressZero}`;
    expect(gnosisTransactionURL).toEqual(EXPECTED_URL);
  });
});
