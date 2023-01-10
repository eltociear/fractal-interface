import {
  FractalModule__factory,
  OZLinearVoting__factory,
  FractalUsul__factory,
  VetoERC20Voting__factory,
  VetoGuard__factory,
  VetoMultisigVoting__factory,
  GnosisSafe__factory,
  GnosisSafe,
  UsulVetoGuard__factory,
} from '@fractal-framework/fractal-contracts';
import { BigNumber, ethers } from 'ethers';
import { useCallback } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CreatorProvider } from '../../components/DaoCreator/provider/CreatorProvider';
import {
  GnosisDAO,
  SubDAO,
  TokenGovernanceDAO,
} from '../../components/DaoCreator/provider/types/index';
import { buildContractCall, encodeMultiSend, getRandomBytes } from '../../helpers';
import { GovernanceTypes } from '../../providers/Fractal/types';
import { useWeb3Provider } from '../../providers/Web3Data/hooks/useWeb3Provider';
import { MetaTransaction } from '../../types/transaction';
import useSafeContracts from '../safe/useSafeContracts';

/**
 * The various time periods we use in DAO creation are all denoted *on chain* in SECONDS.
 * However, from the UI/user's perspective, the input fields are denoted in MINUTES.
 *
 * Thus the data from the user inputs must be converted to seconds before passing into
 * the transaction.  This applies to:
 *
 * votingPeriod
 * executionPeriod
 * timelockPeriod
 * freezeProposalPeriod
 * freezePeriod
 *
 * The UI defaults (in minutes) are defined in {@link CreatorProvider}.
 */
const TIMER_MULT = 60;

const useBuildDAOTx = () => {
  const {
    state: { account, signerOrProvider },
  } = useWeb3Provider();

  const {
    multiSendContract,
    gnosisSafeFactoryContract,
    gnosisSafeSingletonContract,
    linearVotingMasterCopyContract,
    fractalUsulMasterCopyContract,
    zodiacModuleProxyFactoryContract,
    fractalRegistryContract,
    fractalModuleMasterCopyContract,
    gnosisVetoGuardMasterCopyContract,
    usulVetoGuardMasterCopyContract,
    vetoMultisigVotingMasterCopyContract,
    vetoERC20VotingMasterCopyContract,
    votesTokenMasterCopyContract,
  } = useSafeContracts();

  const { AddressZero, HashZero } = ethers.constants;
  const { solidityKeccak256, getCreate2Address, defaultAbiCoder } = ethers.utils;
  const saltNum = getRandomBytes();

  const buildFractalModuleData = useCallback(
    (parentDAOAddress: string | undefined, safeContract: GnosisSafe) => {
      if (!fractalModuleMasterCopyContract || !zodiacModuleProxyFactoryContract) {
        return {
          predictedFractalModuleAddress: '',
          setModuleCalldata: '',
        };
      }
      // Fractal Module
      const setModuleCalldata =
        // eslint-disable-next-line camelcase
        FractalModule__factory.createInterface().encodeFunctionData('setUp', [
          ethers.utils.defaultAbiCoder.encode(
            ['address', 'address', 'address', 'address[]'],
            [
              parentDAOAddress ? parentDAOAddress : safeContract.address, // Owner -- Parent DAO
              safeContract.address, // Avatar
              safeContract.address, // Target
              [], // Authorized Controllers
            ]
          ),
        ]);

      const fractalByteCodeLinear =
        '0x602d8060093d393df3363d3d373d3d3d363d73' +
        fractalModuleMasterCopyContract.address.slice(2) +
        '5af43d82803e903d91602b57fd5bf3';
      const fractalSalt = solidityKeccak256(
        ['bytes32', 'uint256'],
        [solidityKeccak256(['bytes'], [setModuleCalldata]), saltNum]
      );
      return {
        predictedFractalModuleAddress: getCreate2Address(
          zodiacModuleProxyFactoryContract.address,
          fractalSalt,
          solidityKeccak256(['bytes'], [fractalByteCodeLinear])
        ),
        setModuleCalldata: setModuleCalldata,
      };
    },
    [
      fractalModuleMasterCopyContract,
      zodiacModuleProxyFactoryContract,
      getCreate2Address,
      saltNum,
      solidityKeccak256,
    ]
  );
  const buildVetoVotesContractData = useCallback(
    (parentTokenAddress?: string) => {
      const buildVetoVotes = async () => {
        if (
          !vetoERC20VotingMasterCopyContract ||
          !vetoMultisigVotingMasterCopyContract ||
          !zodiacModuleProxyFactoryContract ||
          !signerOrProvider
        ) {
          return;
        }

        // VETO Voting Contract
        // If parent DAO is a token voting DAO, then we must utilize the veto ERC20 Voting
        const vetoVotesMasterCopyContract = parentTokenAddress
          ? vetoERC20VotingMasterCopyContract
          : vetoMultisigVotingMasterCopyContract;

        const vetoVotesType = parentTokenAddress
          ? VetoERC20Voting__factory
          : VetoMultisigVoting__factory;

        const setVetoVotingCalldata = vetoVotesType.createInterface().encodeFunctionData('owner');
        const vetoVotingByteCodeLinear =
          '0x602d8060093d393df3363d3d373d3d3d363d73' +
          vetoVotesMasterCopyContract.address.slice(2) +
          '5af43d82803e903d91602b57fd5bf3';
        const vetoVotingSalt = solidityKeccak256(
          ['bytes32', 'uint256'],
          [solidityKeccak256(['bytes'], [setVetoVotingCalldata]), saltNum]
        );
        return {
          vetoVotingAddress: getCreate2Address(
            zodiacModuleProxyFactoryContract.address,
            vetoVotingSalt,
            solidityKeccak256(['bytes'], [vetoVotingByteCodeLinear])
          ),
          setVetoVotingCalldata: setVetoVotingCalldata,
          vetoVotesType,
        };
      };
      return buildVetoVotes();
    },
    [
      getCreate2Address,
      saltNum,
      solidityKeccak256,
      zodiacModuleProxyFactoryContract,
      signerOrProvider,
      vetoERC20VotingMasterCopyContract,
      vetoMultisigVotingMasterCopyContract,
    ]
  );
  const buildVetoGuardData = useCallback(
    ({
      executionPeriod,
      parentDAOAddress,
      vetoVotingAddress,
      safeAddress,
      usulAddress,
      strategyAddress,
      timelockPeriod,
    }: {
      executionPeriod: BigNumber;
      parentDAOAddress: string;
      vetoVotingAddress: string;
      safeAddress: string;
      usulAddress?: string;
      strategyAddress?: string;
      timelockPeriod?: BigNumber;
    }) => {
      const buildVetoGuard = async () => {
        if (
          !gnosisVetoGuardMasterCopyContract ||
          !usulVetoGuardMasterCopyContract ||
          !zodiacModuleProxyFactoryContract
        ) {
          return;
        }

        // VETO GUARD Contract
        // If dao config is a usul dao, then we must utilize the usulVetoGuard
        const vetoGuardMasterCopyContract = usulAddress
          ? usulVetoGuardMasterCopyContract
          : gnosisVetoGuardMasterCopyContract;

        const vetoGuardType = usulAddress ? UsulVetoGuard__factory : VetoGuard__factory;

        const setVetoGuardCalldata = vetoGuardType.createInterface().encodeFunctionData('setUp', [
          usulAddress
            ? ethers.utils.defaultAbiCoder.encode(
                ['address', 'address', 'address', 'address', 'uint256'],
                [
                  parentDAOAddress, // Owner -- Parent DAO
                  vetoVotingAddress, // Veto Voting
                  strategyAddress, // Base Strategy
                  usulAddress, // USUL
                  executionPeriod.mul(TIMER_MULT), // Execution Period
                ]
              )
            : ethers.utils.defaultAbiCoder.encode(
                ['uint256', 'uint256', 'address', 'address', 'address'],
                [
                  timelockPeriod?.mul(TIMER_MULT), // Timelock Period
                  executionPeriod.mul(TIMER_MULT), // Execution Period
                  parentDAOAddress, // Owner -- Parent DAO
                  vetoVotingAddress, // Veto Voting
                  safeAddress, // Gnosis Safe
                ]
              ),
        ]);
        const vetoGuardByteCodeLinear =
          '0x602d8060093d393df3363d3d373d3d3d363d73' +
          vetoGuardMasterCopyContract.address.slice(2) +
          '5af43d82803e903d91602b57fd5bf3';
        const vetoGuardSalt = solidityKeccak256(
          ['bytes32', 'uint256'],
          [solidityKeccak256(['bytes'], [setVetoGuardCalldata]), saltNum]
        );
        return {
          predictedVetoModuleAddress: getCreate2Address(
            zodiacModuleProxyFactoryContract.address,
            vetoGuardSalt,
            solidityKeccak256(['bytes'], [vetoGuardByteCodeLinear])
          ),
          setVetoGuardCalldata: setVetoGuardCalldata,
        };
      };
      return buildVetoGuard();
    },
    [
      getCreate2Address,
      gnosisVetoGuardMasterCopyContract,
      usulVetoGuardMasterCopyContract,
      saltNum,
      solidityKeccak256,
      zodiacModuleProxyFactoryContract,
    ]
  );
  const buildDeploySafeTx = useCallback(
    (daoData: GnosisDAO, hasUsul?: boolean, parentDAOAddress?: string) => {
      const buildTx = async () => {
        if (
          !account ||
          !gnosisSafeFactoryContract ||
          !gnosisSafeSingletonContract?.address ||
          !multiSendContract ||
          !signerOrProvider
        ) {
          return;
        }

        const gnosisDaoData = daoData as GnosisDAO;

        const signers = hasUsul
          ? [multiSendContract.address]
          : [
              ...gnosisDaoData.trustedAddresses.map(trustedAddess => trustedAddess.address),
              multiSendContract.address,
            ];
        if (parentDAOAddress) {
          signers.push(parentDAOAddress);
        }

        const createGnosisCalldata = gnosisSafeSingletonContract.interface.encodeFunctionData(
          'setup',
          [
            signers,
            1, // Threshold
            AddressZero,
            HashZero,
            AddressZero,
            AddressZero,
            0,
            AddressZero,
          ]
        );

        const predictedGnosisSafeAddress = getCreate2Address(
          gnosisSafeFactoryContract.address,
          solidityKeccak256(
            ['bytes', 'uint256'],
            [solidityKeccak256(['bytes'], [createGnosisCalldata]), saltNum]
          ),
          solidityKeccak256(
            ['bytes', 'uint256'],
            [
              await gnosisSafeFactoryContract.proxyCreationCode(),
              gnosisSafeSingletonContract.address,
            ]
          )
        );

        const createSafeTx = buildContractCall(
          gnosisSafeFactoryContract,
          'createProxyWithNonce',
          [gnosisSafeSingletonContract.address, createGnosisCalldata, saltNum],
          0,
          false
        );

        return {
          predictedGnosisSafeAddress,
          createSafeTx,
        };
      };

      return buildTx();
    },
    [
      account,
      gnosisSafeFactoryContract,
      gnosisSafeSingletonContract,
      multiSendContract,
      signerOrProvider,
      AddressZero,
      HashZero,
      getCreate2Address,
      solidityKeccak256,
      saltNum,
    ]
  );
  const buildMultisigTx = useCallback(
    (
      daoData: GnosisDAO | TokenGovernanceDAO,
      parentDAOAddress?: string,
      parentTokenAddress?: string
    ) => {
      const buildTx = async () => {
        if (
          !multiSendContract ||
          !fractalRegistryContract ||
          !signerOrProvider ||
          !zodiacModuleProxyFactoryContract ||
          !fractalModuleMasterCopyContract ||
          !gnosisVetoGuardMasterCopyContract ||
          !vetoMultisigVotingMasterCopyContract ||
          !vetoERC20VotingMasterCopyContract
        ) {
          return;
        }
        const gnosisDaoData = daoData as GnosisDAO;
        const deploySafeTx = await buildDeploySafeTx(gnosisDaoData, false, parentDAOAddress);

        if (!deploySafeTx) {
          return;
        }

        const { predictedGnosisSafeAddress, createSafeTx } = deploySafeTx;

        const signatures =
          '0x000000000000000000000000' +
          multiSendContract.address.slice(2) +
          '0000000000000000000000000000000000000000000000000000000000000000' +
          '01';

        const safeContract = GnosisSafe__factory.connect(
          predictedGnosisSafeAddress,
          signerOrProvider
        );

        // Fractal Module
        const { predictedFractalModuleAddress, setModuleCalldata } = buildFractalModuleData(
          parentDAOAddress,
          safeContract
        );

        let internaltTxs: MetaTransaction[];
        if (parentDAOAddress) {
          const subDAOData = daoData as SubDAO;
          // Veto Votes
          const deployVetoVotesTx = await buildVetoVotesContractData(parentTokenAddress);
          if (!deployVetoVotesTx) {
            return;
          }
          const { vetoVotingAddress, setVetoVotingCalldata, vetoVotesType } = deployVetoVotesTx;

          // Veto Guard
          const deployVetoGuardTx = await buildVetoGuardData({
            executionPeriod: subDAOData.executionPeriod,
            parentDAOAddress: parentDAOAddress,
            vetoVotingAddress: vetoVotingAddress,
            safeAddress: safeContract.address,
            timelockPeriod: subDAOData.timelockPeriod,
          });
          if (!deployVetoGuardTx) {
            return;
          }
          const { predictedVetoModuleAddress, setVetoGuardCalldata } = deployVetoGuardTx;
          internaltTxs = [
            // Name Registry
            buildContractCall(
              fractalRegistryContract,
              'updateDAOName',
              [gnosisDaoData.daoName],
              0,
              false
            ),
            // Enable Fractal Module
            buildContractCall(
              safeContract,
              'enableModule',
              [predictedFractalModuleAddress],
              0,
              false
            ),
            // Deploy Veto Voting
            buildContractCall(
              zodiacModuleProxyFactoryContract,
              'deployModule',
              [
                vetoVotesType === VetoERC20Voting__factory
                  ? vetoERC20VotingMasterCopyContract.address
                  : vetoMultisigVotingMasterCopyContract.address,
                setVetoVotingCalldata,
                saltNum,
              ],
              0,
              false
            ),
            // Setup Veto Voting
            buildContractCall(
              vetoVotesType.connect(vetoVotingAddress, signerOrProvider),
              'setUp',
              [
                ethers.utils.defaultAbiCoder.encode(
                  ['address', 'uint256', 'uint256', 'uint256', 'uint256', 'address', 'address'],
                  [
                    parentDAOAddress, // Owner -- Parent DAO
                    subDAOData.vetoVotesThreshold, // VetoVotesThreshold
                    subDAOData.freezeVotesThreshold, // FreezeVotesThreshold
                    subDAOData.freezeProposalPeriod.mul(TIMER_MULT), // FreezeProposalPeriod
                    subDAOData.freezePeriod.mul(TIMER_MULT), // FreezePeriod
                    parentTokenAddress ? parentTokenAddress : parentDAOAddress, // ParentGnosisSafe or Votes Token
                    predictedVetoModuleAddress, // VetoGuard
                  ]
                ),
              ],
              0,
              false
            ),
            // Deploy Veto Guard
            buildContractCall(
              zodiacModuleProxyFactoryContract,
              'deployModule',
              [gnosisVetoGuardMasterCopyContract.address, setVetoGuardCalldata, saltNum],
              0,
              false
            ),
            // Enable Veto Guard
            buildContractCall(safeContract, 'setGuard', [predictedVetoModuleAddress], 0, false),
            // Remove Multisend Contract
            buildContractCall(
              safeContract,
              'removeOwner',
              [
                gnosisDaoData.trustedAddresses[gnosisDaoData.trustedAddresses.length - 1].address,
                multiSendContract.address,
                gnosisDaoData.signatureThreshold,
              ],
              0,
              false
            ),
          ];
        } else {
          internaltTxs = [
            // Name Registry
            buildContractCall(
              fractalRegistryContract,
              'updateDAOName',
              [gnosisDaoData.daoName],
              0,
              false
            ),
            // Enable Fractal Module
            buildContractCall(
              safeContract,
              'enableModule',
              [predictedFractalModuleAddress],
              0,
              false
            ),

            // Remove Multisend Contract
            buildContractCall(
              safeContract,
              'removeOwner',
              [
                gnosisDaoData.trustedAddresses[gnosisDaoData.trustedAddresses.length - 1].address,
                multiSendContract.address,
                gnosisDaoData.signatureThreshold,
              ],
              0,
              false
            ),
          ];
        }

        const safeInternalTx = encodeMultiSend(internaltTxs);
        const execInternalSafeTx = buildContractCall(
          safeContract,
          'execTransaction',
          [
            multiSendContract.address, // to
            '0', // value
            multiSendContract.interface.encodeFunctionData('multiSend', [safeInternalTx]), // calldata
            '1', // operation
            '0', // tx gas
            '0', // base gas
            '0', // gas price
            AddressZero, // gas token
            AddressZero, // receiver
            signatures, // sigs
          ],
          0,
          false
        );

        // Deploy Fractal Module
        const fractalModuleTx = buildContractCall(
          zodiacModuleProxyFactoryContract,
          'deployModule',
          [fractalModuleMasterCopyContract.address, setModuleCalldata, saltNum],
          0,
          false
        );

        const txs: MetaTransaction[] = [createSafeTx, fractalModuleTx, execInternalSafeTx];
        const safeTx = encodeMultiSend(txs);

        return { predictedGnosisSafeAddress, createSafeTx, safeTx };
      };

      return buildTx();
    },
    [
      multiSendContract,
      fractalRegistryContract,
      signerOrProvider,
      buildDeploySafeTx,
      buildFractalModuleData,
      buildVetoGuardData,
      buildVetoVotesContractData,
      vetoERC20VotingMasterCopyContract,
      AddressZero,
      zodiacModuleProxyFactoryContract,
      fractalModuleMasterCopyContract,
      saltNum,
      gnosisVetoGuardMasterCopyContract,
      vetoMultisigVotingMasterCopyContract,
    ]
  );
  const buildUsulTx = useCallback(
    (
      daoData: GnosisDAO | TokenGovernanceDAO,
      parentDAOAddress?: string,
      parentTokenAddress?: string
    ) => {
      const buildTx = async () => {
        if (
          !account ||
          !gnosisSafeFactoryContract ||
          !gnosisSafeSingletonContract?.address ||
          !fractalUsulMasterCopyContract ||
          !zodiacModuleProxyFactoryContract ||
          !linearVotingMasterCopyContract ||
          !multiSendContract ||
          !fractalRegistryContract ||
          !fractalModuleMasterCopyContract ||
          !vetoMultisigVotingMasterCopyContract ||
          !signerOrProvider ||
          !votesTokenMasterCopyContract ||
          !vetoERC20VotingMasterCopyContract ||
          !usulVetoGuardMasterCopyContract
        ) {
          return;
        }

        const gnosisDaoData = daoData as GnosisDAO;
        const tokenGovernanceDaoData = daoData as TokenGovernanceDAO;

        const deploySafeTx = await buildDeploySafeTx(gnosisDaoData, true, parentDAOAddress);

        if (!deploySafeTx) {
          return;
        }

        const { predictedGnosisSafeAddress, createSafeTx } = deploySafeTx;

        const tokenAllocationsOwners = tokenGovernanceDaoData.tokenAllocations.map(
          tokenAllocation => tokenAllocation.address
        );
        const tokenAllocationsValues = tokenGovernanceDaoData.tokenAllocations.map(
          tokenAllocation => tokenAllocation.amount || BigNumber.from(0)
        );

        const tokenAllocationSum = tokenAllocationsValues.reduce((accumulator, tokenAllocation) => {
          return tokenAllocation!.add(accumulator);
        }, BigNumber.from(0));

        if (tokenGovernanceDaoData.tokenSupply.gt(tokenAllocationSum)) {
          tokenAllocationsOwners.push(predictedGnosisSafeAddress);
          tokenAllocationsValues.push(tokenGovernanceDaoData.tokenSupply.sub(tokenAllocationSum));
        }

        const encodedInitTokenData = defaultAbiCoder.encode(
          ['string', 'string', 'address[]', 'uint256[]'],
          [
            tokenGovernanceDaoData.tokenName,
            tokenGovernanceDaoData.tokenSymbol,
            tokenAllocationsOwners,
            tokenAllocationsValues,
          ]
        );

        const encodedSetUpTokenData = votesTokenMasterCopyContract.interface.encodeFunctionData(
          'setUp',
          [encodedInitTokenData]
        );
        const tokenByteCodeLinear =
          '0x602d8060093d393df3363d3d373d3d3d363d73' +
          votesTokenMasterCopyContract.address.slice(2) +
          '5af43d82803e903d91602b57fd5bf3';
        const tokenNonce = getRandomBytes();
        const tokenSalt = solidityKeccak256(
          ['bytes32', 'uint256'],
          [solidityKeccak256(['bytes'], [encodedSetUpTokenData]), tokenNonce]
        );
        const predictedTokenAddress = getCreate2Address(
          zodiacModuleProxyFactoryContract.address,
          tokenSalt,
          solidityKeccak256(['bytes'], [tokenByteCodeLinear])
        );

        const encodedStrategyInitParams = defaultAbiCoder.encode(
          ['address', 'address', 'address', 'uint256', 'uint256', 'uint256', 'string'],
          [
            predictedGnosisSafeAddress, // owner
            predictedTokenAddress,
            '0x0000000000000000000000000000000000000001',
            tokenGovernanceDaoData.votingPeriod.mul(TIMER_MULT),
            tokenGovernanceDaoData.quorumPercentage,
            tokenGovernanceDaoData.timelock.mul(TIMER_MULT),
            'linearVoting',
          ]
        );

        const encodedStrategySetUpData =
          linearVotingMasterCopyContract.interface.encodeFunctionData('setUp', [
            encodedStrategyInitParams,
          ]);
        const strategyByteCodeLinear =
          '0x602d8060093d393df3363d3d373d3d3d363d73' +
          linearVotingMasterCopyContract.address.slice(2) +
          '5af43d82803e903d91602b57fd5bf3';
        const strategyNonce = getRandomBytes();
        const strategySalt = solidityKeccak256(
          ['bytes32', 'uint256'],
          [solidityKeccak256(['bytes'], [encodedStrategySetUpData]), strategyNonce]
        );
        const predictedStrategyAddress = getCreate2Address(
          zodiacModuleProxyFactoryContract.address,
          strategySalt,
          solidityKeccak256(['bytes'], [strategyByteCodeLinear])
        );

        const encodedInitUsulData = defaultAbiCoder.encode(
          ['address', 'address', 'address', 'address[]'],
          [
            predictedGnosisSafeAddress,
            predictedGnosisSafeAddress,
            predictedGnosisSafeAddress,
            [predictedStrategyAddress],
          ]
        );
        const encodedSetupUsulData = fractalUsulMasterCopyContract.interface.encodeFunctionData(
          'setUp',
          [encodedInitUsulData]
        );

        const usulByteCodeLinear =
          '0x602d8060093d393df3363d3d373d3d3d363d73' +
          fractalUsulMasterCopyContract.address.slice(2) +
          '5af43d82803e903d91602b57fd5bf3';
        const usulNonce = getRandomBytes();
        const usulSalt = solidityKeccak256(
          ['bytes32', 'uint256'],
          [solidityKeccak256(['bytes'], [encodedSetupUsulData]), usulNonce]
        );
        const predictedUsulAddress = getCreate2Address(
          zodiacModuleProxyFactoryContract.address,
          usulSalt,
          solidityKeccak256(['bytes'], [usulByteCodeLinear])
        );

        const signatures =
          '0x000000000000000000000000' +
          multiSendContract.address.slice(2) +
          '0000000000000000000000000000000000000000000000000000000000000000' +
          '01';

        const safeContract = GnosisSafe__factory.connect(
          predictedGnosisSafeAddress,
          signerOrProvider
        );
        const usulContract = FractalUsul__factory.connect(predictedUsulAddress, signerOrProvider);
        const linearVotingContract = OZLinearVoting__factory.connect(
          predictedStrategyAddress,
          signerOrProvider
        );

        // Fractal Module
        const { predictedFractalModuleAddress, setModuleCalldata } = buildFractalModuleData(
          parentDAOAddress,
          safeContract
        );

        let internaltTxs: MetaTransaction[];
        if (parentDAOAddress) {
          const subDAOData = daoData as SubDAO;

          // Veto Votes
          const deployVetoVotesTx = await buildVetoVotesContractData(parentTokenAddress);
          if (!deployVetoVotesTx) {
            return;
          }
          const { vetoVotingAddress, setVetoVotingCalldata, vetoVotesType } = deployVetoVotesTx;

          // Veto Guard
          const deployVetoGuardTx = await buildVetoGuardData({
            executionPeriod: subDAOData.executionPeriod,
            parentDAOAddress: parentDAOAddress,
            vetoVotingAddress: vetoVotingAddress,
            safeAddress: safeContract.address,
            usulAddress: predictedUsulAddress,
            strategyAddress: predictedStrategyAddress,
          });
          if (!deployVetoGuardTx) {
            return;
          }
          const { predictedVetoModuleAddress, setVetoGuardCalldata } = deployVetoGuardTx;
          internaltTxs = [
            buildContractCall(
              fractalRegistryContract,
              'updateDAOName',
              [gnosisDaoData.daoName],
              0,
              false
            ),
            buildContractCall(linearVotingContract, 'setUsul', [usulContract.address], 0, false),
            buildContractCall(safeContract, 'enableModule', [usulContract.address], 0, false),

            // Enable Fractal Module
            buildContractCall(
              safeContract,
              'enableModule',
              [predictedFractalModuleAddress],
              0,
              false
            ),

            // Deploy Veto Voting
            buildContractCall(
              zodiacModuleProxyFactoryContract,
              'deployModule',
              [
                vetoVotesType === VetoERC20Voting__factory
                  ? vetoERC20VotingMasterCopyContract.address
                  : vetoMultisigVotingMasterCopyContract.address,
                setVetoVotingCalldata,
                saltNum,
              ],
              0,
              false
            ),
            // Setup Veto Voting
            buildContractCall(
              vetoVotesType.connect(vetoVotingAddress, signerOrProvider),
              'setUp',
              [
                ethers.utils.defaultAbiCoder.encode(
                  ['address', 'uint256', 'uint256', 'uint256', 'uint256', 'address', 'address'],
                  [
                    parentDAOAddress, // Owner -- Parent DAO
                    subDAOData.vetoVotesThreshold, // VetoVotesThreshold
                    subDAOData.freezeVotesThreshold, // FreezeVotesThreshold
                    subDAOData.freezeProposalPeriod.mul(TIMER_MULT), // FreezeProposalPeriod
                    subDAOData.freezePeriod.mul(TIMER_MULT), // FreezePeriod
                    parentTokenAddress ? parentTokenAddress : parentDAOAddress, // ParentGnosisSafe or Votes Token
                    predictedVetoModuleAddress, // VetoGuard
                  ]
                ),
              ],
              0,
              false
            ),

            // Deploy Veto Guard
            buildContractCall(
              zodiacModuleProxyFactoryContract,
              'deployModule',
              [usulVetoGuardMasterCopyContract.address, setVetoGuardCalldata, saltNum],
              0,
              false
            ),
            // Enable Veto Guard
            buildContractCall(usulContract, 'setGuard', [predictedVetoModuleAddress], 0, false),

            // Add Usul Contract as the Safe owner
            buildContractCall(
              safeContract,
              'addOwnerWithThreshold',
              [usulContract.address, 1],
              0,
              false
            ),
            // Remove Multisend contract
            buildContractCall(
              safeContract,
              'removeOwner',
              [usulContract.address, multiSendContract.address, 1],
              0,
              false
            ),
          ];
        } else {
          internaltTxs = [
            buildContractCall(
              fractalRegistryContract,
              'updateDAOName',
              [gnosisDaoData.daoName],
              0,
              false
            ),
            buildContractCall(linearVotingContract, 'setUsul', [usulContract.address], 0, false),
            buildContractCall(safeContract, 'enableModule', [usulContract.address], 0, false),
            // Enable Fractal Module
            buildContractCall(
              safeContract,
              'enableModule',
              [predictedFractalModuleAddress],
              0,
              false
            ),
            buildContractCall(
              safeContract,
              'addOwnerWithThreshold',
              [usulContract.address, 1],
              0,
              false
            ),
            buildContractCall(
              safeContract,
              'removeOwner',
              [usulContract.address, multiSendContract.address, 1],
              0,
              false
            ),
          ];
        }
        const safeInternalTx = encodeMultiSend(internaltTxs);

        const createTokenTx = buildContractCall(
          zodiacModuleProxyFactoryContract,
          'deployModule',
          [votesTokenMasterCopyContract.address, encodedSetUpTokenData, tokenNonce],
          0,
          false
        );

        const deployStrategyTx = buildContractCall(
          zodiacModuleProxyFactoryContract,
          'deployModule',
          [linearVotingMasterCopyContract.address, encodedStrategySetUpData, strategyNonce],
          0,
          false
        );
        const deployUsulTx = buildContractCall(
          zodiacModuleProxyFactoryContract,
          'deployModule',
          [fractalUsulMasterCopyContract.address, encodedSetupUsulData, usulNonce],
          0,
          false
        );
        // Deploy Fractal Module
        const deployFractalModuleTx = buildContractCall(
          zodiacModuleProxyFactoryContract,
          'deployModule',
          [fractalModuleMasterCopyContract.address, setModuleCalldata, saltNum],
          0,
          false
        );
        const execInternalSafeTx = buildContractCall(
          safeContract,
          'execTransaction',
          [
            multiSendContract.address, // to
            '0', // value
            multiSendContract.interface.encodeFunctionData('multiSend', [safeInternalTx]), // calldata
            '1', // operation
            '0', // tx gas
            '0', // base gas
            '0', // gas price
            AddressZero, // gas token
            AddressZero, // receiver
            signatures, // sigs
          ],
          0,
          false
        );

        const txs: MetaTransaction[] = [
          createSafeTx,
          createTokenTx,
          deployStrategyTx,
          deployUsulTx,
          deployFractalModuleTx,
          execInternalSafeTx,
        ];
        const safeTx = encodeMultiSend(txs);

        return { predictedGnosisSafeAddress, createSafeTx, safeTx };
      };
      return buildTx();
    },
    [
      account,
      gnosisSafeFactoryContract,
      gnosisSafeSingletonContract?.address,
      fractalUsulMasterCopyContract,
      zodiacModuleProxyFactoryContract,
      linearVotingMasterCopyContract,
      multiSendContract,
      fractalRegistryContract,
      fractalModuleMasterCopyContract,
      usulVetoGuardMasterCopyContract,
      vetoERC20VotingMasterCopyContract,
      vetoMultisigVotingMasterCopyContract,
      saltNum,
      signerOrProvider,
      buildDeploySafeTx,
      buildFractalModuleData,
      buildVetoGuardData,
      buildVetoVotesContractData,
      defaultAbiCoder,
      getCreate2Address,
      solidityKeccak256,
      AddressZero,
      votesTokenMasterCopyContract,
    ]
  );

  const buildDao = useCallback(
    async (
      daoData: TokenGovernanceDAO | GnosisDAO,
      parentDAOAddress?: string,
      parentTokenAddress?: string
    ) => {
      switch (daoData.governance) {
        case GovernanceTypes.GNOSIS_SAFE_USUL:
          return buildUsulTx(daoData, parentDAOAddress, parentTokenAddress);
        case GovernanceTypes.GNOSIS_SAFE:
          return buildMultisigTx(daoData, parentDAOAddress, parentTokenAddress);
      }
    },
    [buildUsulTx, buildMultisigTx]
  );

  return [buildDao] as const;
};

export default useBuildDAOTx;
