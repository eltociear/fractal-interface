import Web3Modal from 'web3modal';
import { ethers, getDefaultProvider, providers } from 'ethers';
import {
  InjectedProviderInfo,
  BaseProviderInfo,
  ProviderApiKeys,
  LocalInjectedProviderInfo,
} from './types';

export const makeInjectedProvider = async (
  web3Provider: ethers.providers.Web3Provider
): Promise<InjectedProviderInfo> => {
  const local =
    process.env.REACT_APP_LOCAL_CHAIN_ID &&
    (await web3Provider.getNetwork()).chainId ===
      parseInt(process.env.REACT_APP_LOCAL_CHAIN_ID, 10);

  const signer = web3Provider.getSigner();
  return {
    account: await signer.getAddress(),
    signerOrProvider: signer,
    provider: web3Provider,
    connectionType: 'injected provider',
    network: local ? 'localhost' : (await web3Provider.getNetwork()).name,
    chainId: (await web3Provider.getNetwork()).chainId,
  };
};

export const getInjectedProvider = (
  web3ModalProvider: Web3Modal
): Promise<InjectedProviderInfo> => {
  return new Promise<InjectedProviderInfo>((resolve, reject) => {
    web3ModalProvider
      .connect()
      .then(userSuppliedProvider =>
        makeInjectedProvider(new ethers.providers.Web3Provider(userSuppliedProvider))
      )
      .then(resolve)
      .catch(reject);
  });
};

export const getLocalProvider = async (): Promise<LocalInjectedProviderInfo | undefined> => {
  const isTestEnvironment = process.env.NODE_ENV === 'test';

  const localProvider = new ethers.providers.JsonRpcProvider(
    process.env.REACT_APP_LOCAL_PROVIDER_URL
  );

  try {
    const network = await localProvider.detectNetwork();

    // sets the account and signer automatically in a test environment.
    const signerOrProvider = isTestEnvironment ? localProvider.getSigner() : localProvider;
    const account = isTestEnvironment
      ? await (signerOrProvider as providers.JsonRpcSigner).getAddress()
      : null;

    return {
      account,
      provider: localProvider,
      signerOrProvider,
      connectionType: 'local provider',
      network: 'localhost',
      chainId: network.chainId,
    };
  } catch (e) {
    console.error('Local Provider: ', e);
  }
};

export const getFallbackProvider = (): BaseProviderInfo => {
  const providerApiKeys: ProviderApiKeys = {};
  if (process.env.REACT_APP_INFURA_API_KEY)
    providerApiKeys.infura = process.env.REACT_APP_INFURA_API_KEY;
  if (process.env.REACT_APP_ALCHEMY_API_KEY)
    providerApiKeys.alchemy = process.env.REACT_APP_ALCHEMY_API_KEY;
  if (process.env.REACT_APP_ETHERSCAN_API_KEY)
    providerApiKeys.etherscan = process.env.REACT_APP_ETHERSCAN_API_KEY;

  const network = ethers.providers.getNetwork(
    parseInt(process.env.REACT_APP_FALLBACK_CHAIN_ID || '0', 10)
  );
  const defaultProvider = getDefaultProvider(network, providerApiKeys);

  return {
    provider: defaultProvider,
    signerOrProvider: defaultProvider,
    connectionType: 'readonly provider',
    network: defaultProvider.network.name,
    chainId: defaultProvider.network.chainId,
  };
};
