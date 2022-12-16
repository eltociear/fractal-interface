import axios from 'axios';
import { isAddress } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { buildGnosisApiUrl } from '../../providers/Fractal/utils/api';
import { useWeb3Provider } from '../../providers/Web3Data/hooks/useWeb3Provider';

const useIsGnosisSafe = (address: string | undefined) => {
  const [loading, setLoading] = useState<boolean>();
  const [isSafe, setIsSafe] = useState<boolean>();
  const {
    state: { chainId },
  } = useWeb3Provider();

  useEffect(() => {
    if (!address || !isAddress(address)) {
      setIsSafe(undefined);
      setLoading(false);
      return;
    }

    setLoading(true);
    axios
      .get(buildGnosisApiUrl(chainId, `/safes/${address}`))
      .then(() => setIsSafe(true))
      .catch(() => setIsSafe(false))
      .finally(() => setLoading(false));
  }, [address, chainId]);

  return [isSafe, loading] as const;
};

export default useIsGnosisSafe;
