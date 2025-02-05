import SafeServiceClient, {
  SafeInfoResponse,
  AllTransactionsListResponse,
} from '@safe-global/safe-service-client';
import { BigNumber } from 'ethers';
import { DAO } from '../../../.graphclient';
import { IGnosisVetoContract } from '../daoGuard';
import { IGnosisModuleData, IGnosisFreezeData } from '../fractal';

// @todo Rename to NodeActions and NodeAction
export enum GnosisAction {
  SET_SAFE_SERVICE_CLIENT,
  SET_SAFE,
  SET_SAFE_ADDRESS,
  SET_SAFE_TRANSACTIONS,
  SET_MODULES,
  SET_GUARD_CONTRACTS,
  SET_FREEZE_DATA,
  FREEZE_VOTE_EVENT,
  SET_DAO_DATA,
  INVALIDATE,
  RESET,
}

export type GnosisActions =
  | { type: GnosisAction.SET_SAFE_SERVICE_CLIENT; payload: SafeServiceClient }
  | { type: GnosisAction.SET_SAFE; payload: SafeInfoResponse }
  | { type: GnosisAction.SET_SAFE_ADDRESS; payload: string }
  | { type: GnosisAction.SET_SAFE_TRANSACTIONS; payload: AllTransactionsListResponse }
  | { type: GnosisAction.SET_MODULES; payload: IGnosisModuleData[] }
  | { type: GnosisAction.SET_GUARD_CONTRACTS; payload: IGnosisVetoContract }
  | { type: GnosisAction.SET_FREEZE_DATA; payload: IGnosisFreezeData }
  | {
      type: GnosisAction.FREEZE_VOTE_EVENT;
      payload: {
        isVoter: boolean;
        freezeProposalCreatedTime: BigNumber;
        freezeProposalVoteCount: BigNumber;
      };
    }
  | {
      type: GnosisAction.SET_DAO_DATA;
      payload: { daoName?: string; parentDAOAddress?: string; hierarchy?: DAO[] };
    }
  | { type: GnosisAction.INVALIDATE }
  | { type: GnosisAction.RESET };
