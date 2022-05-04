import { useCallback } from 'react'
import { useTransaction } from '../web3/transactions';
import { useDAOData } from './index';

const useDelegateVote = ({
  delegatee,
  successCallback,
}: {
  delegatee: string | undefined,
  successCallback: () => void,
}) => {
  const [{ tokenContract }] = useDAOData();
  const [contractCallDelegateVote, contractCallPending] = useTransaction();

  let delegateVote = useCallback(() => {
    if (tokenContract === undefined || delegatee === undefined) {
      return;
    }

    contractCallDelegateVote({
      contractFn: () => tokenContract.delegate(delegatee),
      pendingMessage: "Delegating Vote",
      failedMessage: "Vote Delegation Failed",
      successMessage: "Vote Delegated",
      successCallback: () => successCallback(),
    });
  }, [contractCallDelegateVote, tokenContract, delegatee, successCallback]);

  return [delegateVote, contractCallPending] as const;
}

export default useDelegateVote;