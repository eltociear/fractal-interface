import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useIsGnosisSafe from '../safe/useIsSafe';
import useAddress from '../utils/useAddress';

const useSearchDao = () => {
  const [searchString, setSearchString] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [loading, setLoading] = useState<boolean>();

  const { address, isValidAddress, isAddressLoading } = useAddress(searchString);
  const [addressIsGnosisSafe, isGnosisSafeLoading] = useIsGnosisSafe(address);
  const { t } = useTranslation('dashboard');

  /**
   * refresh error state if one exists
   *
   */
  const resetErrorState = useCallback(() => {
    if (errorMessage) {
      setErrorMessage(undefined);
      setSearchString(undefined);
    }
  }, [errorMessage]);

  /**
   * updates search string when 'form' is submited
   *
   */
  const updateSearchString = (searchStr: string) => {
    setSearchString(searchStr);
  };

  /**
   * handles loading state of search
   */
  useEffect(() => {
    if (isAddressLoading !== undefined) {
      setLoading(isAddressLoading || isGnosisSafeLoading);
    }
  }, [isAddressLoading, isGnosisSafeLoading]);

  /**
   * handles errors
   *
   * @dev loading or addressIsDao are initialized as undefined to indicate these processses
   * have not been ran yet.
   */
  useEffect(() => {
    if (loading !== false) {
      return;
    }
    if (!address) {
      resetErrorState();
      return;
    }

    if (isValidAddress) {
      return;
    }

    if (!isValidAddress) {
      setErrorMessage(t('errorInvalidSearch'));
      return;
    }
    if (!isGnosisSafeLoading && addressIsGnosisSafe === false) {
      setErrorMessage(t('errorFailedSearch'));
      return;
    }
  }, [
    address,
    isValidAddress,
    searchString,
    isGnosisSafeLoading,
    addressIsGnosisSafe,
    loading,
    t,
    resetErrorState,
  ]);

  return {
    errorMessage,
    loading,
    address,
    isValidAddress,
    updateSearchString,
    resetErrorState,
    addressIsGnosisSafe,
  };
};

export default useSearchDao;
