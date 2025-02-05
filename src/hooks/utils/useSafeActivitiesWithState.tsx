import { VetoGuard } from '@fractal-framework/fractal-contracts';
import { SafeMultisigTransactionWithTransfersResponse } from '@safe-global/safe-service-client';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useProvider } from 'wagmi';
import { checkIsRejected, checkIsApproved } from '../../helpers/activity';
import { Activity, ActivityEventType, TxProposalState } from '../../types';

export async function getTxQueuedTimestamp(activity: Activity, vetoGuard: VetoGuard) {
  const multiSigTransaction = activity.transaction as SafeMultisigTransactionWithTransfersResponse;

  const abiCoder = new ethers.utils.AbiCoder();
  const vetoGuardTransactionHash = ethers.utils.solidityKeccak256(
    ['bytes'],
    [
      abiCoder.encode(
        [
          'address',
          'uint256',
          'bytes32',
          'uint256',
          'uint256',
          'uint256',
          'uint256',
          'address',
          'address',
        ],
        [
          multiSigTransaction.to,
          multiSigTransaction.value,
          ethers.utils.solidityKeccak256(['bytes'], [multiSigTransaction.data as string]),
          multiSigTransaction.operation,
          multiSigTransaction.safeTxGas,
          multiSigTransaction.baseGas,
          multiSigTransaction.gasPrice,
          multiSigTransaction.gasToken,
          multiSigTransaction.refundReceiver as string,
        ]
      ),
    ]
  );

  const queuedTimestamp = (
    await vetoGuard.getTransactionQueuedTimestamp(vetoGuardTransactionHash)
  ).toNumber();

  return queuedTimestamp;
}

export function useSafeActivitiesWithState(
  activities: Activity[],
  vetoGuard: VetoGuard | undefined
) {
  const [activitiesWithState, setActivitiesWithState] = useState<Activity[]>([]);

  const provider = useProvider();

  useEffect(() => {
    if (vetoGuard && provider) {
      Promise.all([
        vetoGuard.timelockPeriod(),
        vetoGuard.executionPeriod(),
        provider.getBlockNumber().then((blockNumber: number) => provider.getBlock(blockNumber)),
      ]).then(([timelockPeriod, executionPeriod, lastBlock]) => {
        Promise.all(
          activities.map(async (activity, _, activityArr) => {
            if (activity.eventType !== ActivityEventType.Governance || !activity.transaction) {
              return activity;
            }

            if (activity.transaction.txType === 'MODULE_TRANSACTION') {
              return {
                ...activity,
                state: TxProposalState.Module,
              };
            }

            const isMultiSigTransaction = activity.transaction.txType === 'MULTISIG_TRANSACTION';

            const multiSigTransaction =
              activity.transaction as SafeMultisigTransactionWithTransfersResponse;

            const eventNonce = multiSigTransaction.nonce;

            const isRejected = checkIsRejected(
              isMultiSigTransaction,
              activityArr,
              eventNonce,
              multiSigTransaction
            );

            const isApproved = checkIsApproved(multiSigTransaction);
            const queuedTimestamp = await getTxQueuedTimestamp(activity, vetoGuard);

            let state: TxProposalState;

            if (multiSigTransaction.isExecuted) {
              state = TxProposalState.Executed;
            } else if (queuedTimestamp === 0) {
              // Has not been queued
              if (isRejected) {
                state = TxProposalState.Rejected;
              } else if (isApproved) {
                state = TxProposalState.Queueable;
              } else {
                state = TxProposalState.Active;
              }
            } else {
              // Has been Queued
              if (lastBlock.timestamp > queuedTimestamp + timelockPeriod.toNumber()) {
                // Timelock has ended
                if (
                  lastBlock.timestamp <
                  queuedTimestamp + timelockPeriod.toNumber() + executionPeriod.toNumber()
                ) {
                  // Within execution period
                  state = TxProposalState.Executing;
                } else {
                  // Execution period has ended
                  state = TxProposalState.Expired;
                }
              } else {
                // Within timelock period
                state = TxProposalState.Queued;
              }
            }

            return { ...activity, state };
          })
        ).then(setActivitiesWithState);
      });
    } else {
      // DAO does not have a VetoGuard
      setActivitiesWithState(
        activities.map((activity, _, activityArr) => {
          if (activity.eventType !== ActivityEventType.Governance || !activity.transaction) {
            return activity;
          }

          if (activity.transaction.txType === 'MODULE_TRANSACTION') {
            return {
              ...activity,
              state: TxProposalState.Module,
            };
          }

          const isMultiSigTransaction = activity.transaction.txType === 'MULTISIG_TRANSACTION';

          const multiSigTransaction =
            activity.transaction as SafeMultisigTransactionWithTransfersResponse;

          const eventNonce = multiSigTransaction.nonce;

          const isRejected = checkIsRejected(
            isMultiSigTransaction,
            activityArr,
            eventNonce,
            multiSigTransaction
          );

          const isApproved = checkIsApproved(multiSigTransaction);

          let state;
          if (isRejected) {
            state = TxProposalState.Rejected;
          } else if (multiSigTransaction.isExecuted) {
            state = TxProposalState.Executed;
          } else if (isApproved) {
            state = TxProposalState.Executing;
          } else {
            state = TxProposalState.Active;
          }
          return { ...activity, state };
        })
      );
    }
  }, [activities, provider, vetoGuard]);

  return activitiesWithState;
}
