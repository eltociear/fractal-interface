import { FractalUsul, OZLinearVoting } from '@fractal-framework/fractal-contracts';
import {
  SafeMultisigTransactionWithTransfersResponse,
  SafeMultisigTransactionResponse,
} from '@safe-global/safe-service-client';
import { BigNumber } from 'ethers';
import { getEventRPC } from '../../../helpers';
import { logError } from '../../../helpers/errorLogging';
import { createAccountSubstring } from '../../../hooks/utils/useDisplayName';
import {
  ActivityEventType,
  ContractConnection,
  DataDecoded,
  Parameter,
  ProposalIsPassedError,
  ProposalMetaData,
  ProposalVote,
  ProposalVotesSummary,
  TxProposalState,
  UsulProposal,
  VOTE_CHOICES,
} from '../../../types';
import { Providers } from '../../../types/network';
import { strategyTxProposalStates } from '../governance/constants';
import { CacheExpiry, CacheKeys, getValue, setValue } from '../hooks/account/useLocalStorage';

export const getTxProposalState = async (
  usulContract: ContractConnection<FractalUsul>,
  linearVotingMasterCopyContract: ContractConnection<OZLinearVoting>,
  proposalId: BigNumber,
  chainId: number
): Promise<TxProposalState> => {
  const cache: TxProposalState = getValue(
    CacheKeys.PROPOSAL_STATE_PREFIX + linearVotingMasterCopyContract.asSigner.address + proposalId,
    chainId
  );
  if (cache) {
    return cache;
  }
  const state = await usulContract.asSigner.state(proposalId);
  if (state === 0) {
    // Usul says proposal is active, but we need to get more info in this case
    const { strategy: strategyAddress } = await usulContract.asSigner.proposals(proposalId);
    const strategy = linearVotingMasterCopyContract.asSigner.attach(strategyAddress);
    const { deadline } = await strategy.proposals(proposalId);
    if (Number(deadline.toString()) * 1000 < new Date().getTime()) {
      // Deadline has passed: we have to determine if proposal is passed or failed
      // Dirty hack: isPassed will fail if the proposal is not passed
      try {
        // This function never returns false, it either returns true or throws an error
        await strategy.isPassed(proposalId);
        return TxProposalState.Queueable;
      } catch (e: any) {
        if (e.message.match(ProposalIsPassedError.MAJORITY_YES_VOTES_NOT_REACHED)) {
          setValue(
            CacheKeys.PROPOSAL_STATE_PREFIX +
              linearVotingMasterCopyContract.asSigner.address +
              proposalId,
            TxProposalState.Rejected,
            chainId,
            CacheExpiry.NEVER
          );
          return TxProposalState.Rejected;
        } else if (e.message.match(ProposalIsPassedError.QUORUM_NOT_REACHED)) {
          setValue(
            CacheKeys.PROPOSAL_STATE_PREFIX +
              linearVotingMasterCopyContract.asSigner.address +
              proposalId,
            TxProposalState.Failed,
            chainId,
            CacheExpiry.NEVER
          );
          return TxProposalState.Failed;
        } else if (e.message.match(ProposalIsPassedError.PROPOSAL_STILL_ACTIVE)) {
          return TxProposalState.Active;
        }
        return TxProposalState.Failed;
      }
    }
    return TxProposalState.Active;
  }
  return strategyTxProposalStates[state];
};

export const getProposalVotesSummary = async (
  usulContract: FractalUsul,
  strategyContract: OZLinearVoting,
  proposalNumber: BigNumber
): Promise<ProposalVotesSummary> => {
  const { strategy: strategyAddress } = await usulContract.proposals(proposalNumber);
  const strategy = strategyContract.attach(strategyAddress);
  const { yesVotes, noVotes, abstainVotes, startBlock } = await strategy.proposals(proposalNumber);

  let quorum;

  try {
    quorum = await strategy.quorum(startBlock);
  } catch (e) {
    // For who knows reason - strategy.quorum might give you an error
    // Seems like occuring when token deployment haven't worked properly
    logError('Error while getting strategy quorum');
    quorum = BigNumber.from(0);
  }

  return {
    yes: yesVotes,
    no: noVotes,
    abstain: abstainVotes,
    quorum,
  };
};

export const getProposalVotes = async (
  strategyContract: OZLinearVoting,
  proposalNumber: BigNumber
): Promise<ProposalVote[]> => {
  const voteEventFilter = strategyContract.filters.Voted();
  const votes = await strategyContract.queryFilter(voteEventFilter);
  const proposalVotesEvent = votes.filter(voteEvent =>
    voteEvent.args.proposalId.eq(proposalNumber)
  );

  return proposalVotesEvent.map(({ args }) => ({
    voter: args.voter,
    choice: VOTE_CHOICES[args.support],
    weight: args.weight,
  }));
};

export const mapProposalCreatedEventToProposal = async (
  strategyAddress: string,
  proposalNumber: BigNumber,
  proposer: string,
  usulContract: ContractConnection<FractalUsul>,
  linearVotingMasterCopyContract: ContractConnection<OZLinearVoting>,
  provider: Providers,
  chainId: number,
  metaData?: ProposalMetaData
) => {
  const strategyContract = linearVotingMasterCopyContract.asSigner.attach(strategyAddress);
  const strategyContractProvider = getEventRPC<OZLinearVoting>(
    linearVotingMasterCopyContract,
    chainId
  ).attach(strategyAddress);
  const { deadline, startBlock } = await strategyContract.proposals(proposalNumber);
  const state = await getTxProposalState(
    usulContract,
    linearVotingMasterCopyContract,
    proposalNumber,
    chainId
  );
  const votes = await getProposalVotes(strategyContractProvider, proposalNumber);
  const block = await provider.getBlock(startBlock.toNumber());
  const votesSummary = await getProposalVotesSummary(
    usulContract.asSigner,
    linearVotingMasterCopyContract.asSigner,
    proposalNumber
  );

  const targets = metaData
    ? metaData.decodedTransactions.map(tx => createAccountSubstring(tx.target))
    : [];

  let transactionHash: string | undefined;
  if (state === TxProposalState.Executed) {
    const proposalExecutedFilter = usulContract.asSigner.filters.TransactionExecuted();
    const proposalExecutedEvents = await usulContract.asSigner.queryFilter(proposalExecutedFilter);
    const executedEvent = proposalExecutedEvents.find(event => event.args[0].eq(proposalNumber));
    transactionHash = executedEvent?.transactionHash;
  }

  const proposal: UsulProposal = {
    eventType: ActivityEventType.Governance,
    eventDate: new Date(block.timestamp * 1000),
    proposalNumber: proposalNumber.toString(),
    targets,
    proposer,
    startBlock,
    transactionHash,
    deadline: deadline.toNumber(),
    state,
    govTokenAddress: await strategyContract.governanceToken(),
    votes,
    votesSummary,
    metaData,
  };

  return proposal;
};

export const parseMultiSendTransactions = (
  eventTransactionMap: Map<number, any>,
  parameters?: Parameter[]
) => {
  if (!parameters || !parameters.length) {
    return;
  }
  parameters.forEach((param: Parameter) => {
    const valueDecoded = param.valueDecoded;
    if (Array.isArray(valueDecoded)) {
      valueDecoded.forEach(value => {
        const decodedTransaction = {
          target: value.to,
          value: value.value, // This is the ETH value
          function: value.dataDecoded?.method,
          parameterTypes:
            !!value.dataDecoded && value.dataDecoded.parameters
              ? value.dataDecoded.parameters.map(p => p.type)
              : [],
          parameterValues:
            !!value.dataDecoded && value.dataDecoded.parameters
              ? value.dataDecoded.parameters.map(p => p.value)
              : [],
        };
        eventTransactionMap.set(eventTransactionMap.size, {
          ...decodedTransaction,
        });
        if (value.dataDecoded?.parameters && value.dataDecoded?.parameters?.length) {
          return parseMultiSendTransactions(eventTransactionMap, value.dataDecoded.parameters);
        }
      });
    }
  });
};

export const parseDecodedData = (
  multiSigTransaction:
    | SafeMultisigTransactionWithTransfersResponse
    | SafeMultisigTransactionResponse,
  isMultiSigTransaction: boolean
) => {
  const eventTransactionMap = new Map<number, any>();
  const dataDecoded = multiSigTransaction.dataDecoded as any as DataDecoded;
  if (dataDecoded && isMultiSigTransaction) {
    const decodedTransaction = {
      target: multiSigTransaction.to,
      value: multiSigTransaction.value,
      function: dataDecoded.method,
      parameterTypes: dataDecoded.parameters ? dataDecoded.parameters.map(p => p.type) : [],
      parameterValues: dataDecoded.parameters ? dataDecoded.parameters.map(p => p.value) : [],
    };
    eventTransactionMap.set(eventTransactionMap.size, {
      ...decodedTransaction,
    });
    parseMultiSendTransactions(eventTransactionMap, dataDecoded.parameters);
  }
  return Array.from(eventTransactionMap.values());
};
