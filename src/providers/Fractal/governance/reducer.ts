import { IGovernance, GovernanceActions, GovernanceAction } from '../../../types';
import { governanceInitialState } from '../constants';

export const initializeGovernanceState = (_initialState: IGovernance) => {
  return _initialState;
};

export const governanceReducer = (state: IGovernance, action: GovernanceActions): IGovernance => {
  switch (action.type) {
    case GovernanceAction.SET_GOVERNANCE:
      return { ...state, ...action.payload };
    case GovernanceAction.SET_USUL_CONTRACTS:
      return { ...state, contracts: action.payload };
    case GovernanceAction.UPDATE_PROPOSALS:
      return { ...state, txProposalsInfo: { ...action.payload } };
    case GovernanceAction.CONTRACTS_LOADED:
      return { ...state, contracts: { ...state, contractsIsLoading: false } };
    case GovernanceAction.SET_CLAIMING_CONTRACT:
      return { ...state, tokenClaimContract: action.payload };
    case GovernanceAction.RESET:
      return initializeGovernanceState(governanceInitialState);
    default:
      return state;
  }
};
