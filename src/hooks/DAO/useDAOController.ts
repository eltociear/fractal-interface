import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { BASE_ROUTES } from '../../constants/routes';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { TreasuryAction, GovernanceAction, GnosisAction } from '../../types';
import { useSearchDao } from './useSearchDao';

export default function useDAOController({ daoAddress }: { daoAddress: string }) {
  const {
    gnosis: { safe },
    dispatches: { gnosisDispatch, governanceDispatch, treasuryDispatch },
  } = useFractal();
  const { push } = useRouter();

  const { errorMessage, address, isLoading, setSearchString } = useSearchDao();

  /**
   * Passes param address to setSearchString
   */
  const loadDAO = useCallback(() => {
    if (safe.address !== daoAddress) {
      setSearchString(daoAddress! as string);
    }
  }, [safe.address, daoAddress, setSearchString]);

  useEffect(() => loadDAO(), [loadDAO]);

  useEffect(() => {
    if (address) {
      (async () => {
        treasuryDispatch({
          type: TreasuryAction.RESET,
        });
        governanceDispatch({
          type: GovernanceAction.RESET,
        });
        gnosisDispatch({
          type: GnosisAction.SET_SAFE_ADDRESS,
          payload: address,
        });
      })();
      return () => {};
    }
  }, [address, gnosisDispatch, governanceDispatch, treasuryDispatch]);

  useEffect(() => {
    if (!isLoading) {
      if (!!errorMessage) {
        toast(errorMessage, { toastId: 'invalid-dao' });
        gnosisDispatch({ type: GnosisAction.INVALIDATE });
        push(BASE_ROUTES.landing);
      }
    }
  }, [errorMessage, isLoading, gnosisDispatch, push]);
}
