import { useState } from 'react';
import { BigNumber } from 'ethers';

import useDAOContract from './useDAOContract';
import useDAOName from './useDAOName';
import useAccessControlAddress from './useAccessControlAddress';
import useAccessControlContract from './useAccessControlContract';
import useModuleAddresses from './useModuleAddresses';
import useGovernorModuleContract from './useGovernorModuleContract';
import useTimelockModuleContract from './useTimelockModuleContract';
import useTokenContract from './useTokenContract';
import useTokenData from './useTokenData';
import useProposals, { ProposalData } from './useProposals';
import { GovernorModule, TimelockUpgradeable } from '../../assets/typechain-types/module-governor';
import { TreasuryModule } from '../../assets/typechain-types/module-treasury';
import { VotesTokenWithSupply } from '../../assets/typechain-types/votes-token';
import { useBlockchainData } from '../blockchainData';
import useTreasuryModuleContract from './treasury/useTreasuryModuleContract';
import useTreasuryEvents from './treasury/useTreasuryEvents';
import useTreasuryAssets from './treasury/useTreasuryAssets';
import { TreasuryAsset } from './treasury/types';

export interface DAOData {
  daoAddress: string | undefined;
  name: string | undefined;
  accessControlAddress: string | undefined;
  modules: {
    treasury: {
      treasuryModuleContract: TreasuryModule | undefined;
      treasuryAssets: TreasuryAsset[];
    };
    governor: {
      governorModuleContract: GovernorModule | undefined;
      timelockModuleContract: TimelockUpgradeable | undefined;
      proposals: ProposalData[] | undefined;
      votingToken: {
        votingTokenContract: VotesTokenWithSupply | undefined;
        votingTokenData: {
          name: string | undefined;
          symbol: string | undefined;
          decimals: number | undefined;
          userBalance: BigNumber | undefined;
          delegatee: string | undefined;
          votingWeight: BigNumber | undefined;
          address: string | undefined;
        };
      };
    };
  };
}

type SetDAOAddressFn = React.Dispatch<React.SetStateAction<string | undefined>>;
export type DAODataContext = readonly [DAOData, SetDAOAddressFn];

export const defaultDAODataResponse = [
  {} as DAOData,
  (() => undefined) as SetDAOAddressFn,
] as const;

const useDAODatas = () => {
  const [daoAddress, setDAOAddress] = useState<string>();
  const daoContract = useDAOContract(daoAddress);
  const name = useDAOName(daoContract);
  const accessControlAddress = useAccessControlAddress(daoContract);
  const accessControlContract = useAccessControlContract(accessControlAddress);
  const moduleAddresses = useModuleAddresses(daoContract, accessControlContract);

  // ***** Module Hooks ****** //
  const governorModuleContract = useGovernorModuleContract(moduleAddresses);
  const timelockModuleContract = useTimelockModuleContract(moduleAddresses);
  const treasuryModuleContract = useTreasuryModuleContract(moduleAddresses);
  const { nativeDeposits, nativeWithdraws, erc20TokenDeposits, erc20TokenWithdraws } =
    useTreasuryEvents(treasuryModuleContract);
  const treasuryAssets = useTreasuryAssets(
    nativeDeposits,
    nativeWithdraws,
    erc20TokenDeposits,
    erc20TokenWithdraws
  );
  // ************************* //

  const votingTokenContract = useTokenContract(governorModuleContract);
  const votingTokenData = useTokenData(votingTokenContract);
  const { currentBlockNumber } = useBlockchainData();
  const proposals = useProposals(governorModuleContract, currentBlockNumber);
  const daoData: DAOData = {
    daoAddress,
    name,
    accessControlAddress,
    modules: {
      treasury: {
        treasuryModuleContract,
        treasuryAssets,
      },
      governor: {
        governorModuleContract,
        timelockModuleContract,
        proposals,
        votingToken: {
          votingTokenContract,
          votingTokenData,
        },
      },
    },
  };

  return [daoData, setDAOAddress] as const;
};

export default useDAODatas;
