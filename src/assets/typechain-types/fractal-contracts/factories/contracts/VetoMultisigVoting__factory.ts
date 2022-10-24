/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  VetoMultisigVoting,
  VetoMultisigVotingInterface,
} from "../../contracts/VetoMultisigVoting";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "creator",
        type: "address",
      },
    ],
    name: "FreezeProposalCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "voter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "votesCast",
        type: "uint256",
      },
    ],
    name: "FreezeVoteCast",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "version",
        type: "uint8",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "voter",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "transactionHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "votesCast",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "freeze",
        type: "bool",
      },
    ],
    name: "VetoVoteCast",
    type: "event",
  },
  {
    inputs: [],
    name: "castFreezeVote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_transactionHash",
        type: "bytes32",
      },
      {
        internalType: "bool",
        name: "_freeze",
        type: "bool",
      },
    ],
    name: "castVetoVote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "defrost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "freezeBlockDuration",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "freezeProposalBlockDuration",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "freezeProposalCreatedBlock",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "freezeProposalVoteCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "freezeVotesThreshold",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_transactionHash",
        type: "bytes32",
      },
    ],
    name: "getIsVetoed",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        internalType: "enum Enum.Operation",
        name: "operation",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "safeTxGas",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "baseGas",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "gasPrice",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "gasToken",
        type: "address",
      },
      {
        internalType: "address",
        name: "refundReceiver",
        type: "address",
      },
    ],
    name: "getTransactionHash",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "gnosisSafe",
    outputs: [
      {
        internalType: "contract IGnosisSafe",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "isFrozen",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "initializeParams",
        type: "bytes",
      },
    ],
    name: "setUp",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "transactionVetoVotes",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_freezeBlockDuration",
        type: "uint256",
      },
    ],
    name: "updateFreezeBlockDuration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_freezeProposalBlockDuration",
        type: "uint256",
      },
    ],
    name: "updateFreezeProposalBlockDuration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_freezeVotesThreshold",
        type: "uint256",
      },
    ],
    name: "updateFreezeVotesThreshold",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_vetoVotesThreshold",
        type: "uint256",
      },
    ],
    name: "updateVetoVotesThreshold",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "userHasFreezeVoted",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "userHasVoted",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "vetoGuard",
    outputs: [
      {
        internalType: "contract IVetoGuard",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "vetoVotesThreshold",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50611001806100206000396000f3fe608060405234801561001057600080fd5b50600436106101735760003560e01c8063a1cb3ed4116100de578063aba9dfe911610097578063e9c17a9411610071578063e9c17a941461034b578063f21cdf6f14610354578063f2fde38b1461035c578063fb80bccc1461036f57600080fd5b8063aba9dfe9146102ff578063e0b44b5a14610312578063e1a411521461032557600080fd5b8063a1cb3ed4146102a2578063a28e6f4a146102b5578063a3fb4897146102be578063a4f9edbf146102d1578063a84173ae146102e4578063a91e5cab146102f757600080fd5b80636e062eff116101305780636e062eff14610216578063715018a61461022b5780638a79cadf146102335780638da5cb5b1461023c5780638f920e1814610261578063919d8fdf1461028f57600080fd5b806301c4f974146101785780631f82bcb1146101ab57806333eeb147146101e957806349a6a4fa146101f1578063559a24e3146101fa57806365d5d08c14610203575b600080fd5b610198610186366004610bba565b606d6020526000908152604090205481565b6040519081526020015b60405180910390f35b6101d96101b9366004610bf8565b606e60209081526000928352604080842090915290825290205460ff1681565b60405190151581526020016101a2565b6101d9610378565b61019860695481565b61019860675481565b610198610211366004610cc7565b6103ad565b610229610224366004610d86565b6103fc565b005b610229610674565b61019860685481565b6033546001600160a01b03165b6040516001600160a01b0390911681526020016101a2565b6101d961026f366004610bf8565b606f60209081526000928352604080842090915290825290205460ff1681565b61022961029d366004610bba565b610688565b6102296102b0366004610bba565b610695565b610198606a5481565b606c54610249906001600160a01b031681565b6102296102df366004610db6565b6106a2565b606b54610249906001600160a01b031681565b61022961082c565b61022961030d366004610bba565b6108e4565b610229610320366004610bba565b6108f1565b6101d9610333366004610bba565b6065546000918252606d602052604090912054101590565b61019860655481565b6102296108fe565b61022961036a366004610df3565b610912565b61019860665481565b60006066546068541015801561039c5750606a546067546103999190610e2d565b43105b156103a75750600190565b50600090565b6000898989805190602001208989898989896040516020016103d799989796959493929190610e45565b6040516020818303038152906040528051906020012090509998505050505050505050565b336000908152606e6020908152604080832085845290915290205460ff16156104655760405162461bcd60e51b8152602060048201526016602482015275155cd95c881a185cc8185b1c9958591e481d9bdd195960521b60448201526064015b60405180910390fd5b606b546040516317aa5fb760e11b81523360048201526001600160a01b0390911690632f54bf6e90602401602060405180830381865afa1580156104ad573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104d19190610ebc565b6105155760405162461bcd60e51b815260206004820152601560248201527402ab9b2b91034b9903737ba1030b71037bbb732b91605d1b604482015260640161045c565b606c5460405163b59ee1db60e01b8152600481018490526001600160a01b039091169063b59ee1db90602401602060405180830381865afa15801561055e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105829190610ed9565b6000036105dd5760405162461bcd60e51b815260206004820152602360248201527f5472616e73616374696f6e20686173206e6f7420796574206265656e207175656044820152621d595960ea1b606482015260840161045c565b6000828152606d602052604081208054916105f783610ef2565b9190505550801561060a5761060a61098b565b336000818152606e60209081526040808320868452825291829020805460ff191660019081179091558251908152841515918101919091528492917f3ff8c993f53ae62959a2df610fd0d5cff5320cd2a5f907e1a9f785499e402d84910160405180910390a35050565b61067c610ab4565b6106866000610b0e565b565b610690610ab4565b606555565b61069d610ab4565b606a55565b600054610100900460ff16158080156106c25750600054600160ff909116105b806106dc5750303b1580156106dc575060005460ff166001145b61073f5760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b606482015260840161045c565b6000805460ff191660011790558015610762576000805461ff0019166101001790555b61076a610b60565b6000806000806000806000888060200190518101906107899190610f0b565b96509650965096509650965096506107a087610b0e565b606595909555606693909355606991909155606a55606b80546001600160a01b039283166001600160a01b031991821617909155606c8054929093169116179055508015610828576000805461ff0019169055604051600181527f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb38474024989060200160405180910390a15b5050565b606b546040516317aa5fb760e11b81523360048201526001600160a01b0390911690632f54bf6e90602401602060405180830381865afa158015610874573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108989190610ebc565b6108dc5760405162461bcd60e51b815260206004820152601560248201527402ab9b2b91034b9903737ba1030b71037bbb732b91605d1b604482015260640161045c565b61068661098b565b6108ec610ab4565b606655565b6108f9610ab4565b606955565b610906610ab4565b60006067819055606855565b61091a610ab4565b6001600160a01b03811661097f5760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b606482015260840161045c565b61098881610b0e565b50565b60695460675461099b9190610e2d565b4311156109db5743606755600160685560405133907fe18d0e7e892cd73f8a648a42186da382bee61a1d78ac88401885943449f78fe490600090a2610a57565b336000908152606f60209081526040808320606754845290915290205460ff1615610a415760405162461bcd60e51b8152602060048201526016602482015275155cd95c881a185cc8185b1c9958591e481d9bdd195960521b604482015260640161045c565b60688054906000610a5183610ef2565b91905055505b336000818152606f602090815260408083206067548452825291829020805460ff1916600190811790915591519182527f3746cafa4f96166ea7502cf76d1ea8ce440f3c8215cbcac3ae32d3ee39afae42910160405180910390a2565b6033546001600160a01b031633146106865760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015260640161045c565b603380546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b600054610100900460ff16610b875760405162461bcd60e51b815260040161045c90610f80565b610686600054610100900460ff16610bb15760405162461bcd60e51b815260040161045c90610f80565b61068633610b0e565b600060208284031215610bcc57600080fd5b5035919050565b6001600160a01b038116811461098857600080fd5b8035610bf381610bd3565b919050565b60008060408385031215610c0b57600080fd5b8235610c1681610bd3565b946020939093013593505050565b634e487b7160e01b600052604160045260246000fd5b600082601f830112610c4b57600080fd5b813567ffffffffffffffff80821115610c6657610c66610c24565b604051601f8301601f19908116603f01168101908282118183101715610c8e57610c8e610c24565b81604052838152866020858801011115610ca757600080fd5b836020870160208301376000602085830101528094505050505092915050565b60008060008060008060008060006101208a8c031215610ce657600080fd5b8935610cf181610bd3565b985060208a0135975060408a013567ffffffffffffffff811115610d1457600080fd5b610d208c828d01610c3a565b97505060608a013560028110610d3557600080fd5b955060808a0135945060a08a0135935060c08a0135925060e08a0135610d5a81610bd3565b9150610d696101008b01610be8565b90509295985092959850929598565b801515811461098857600080fd5b60008060408385031215610d9957600080fd5b823591506020830135610dab81610d78565b809150509250929050565b600060208284031215610dc857600080fd5b813567ffffffffffffffff811115610ddf57600080fd5b610deb84828501610c3a565b949350505050565b600060208284031215610e0557600080fd5b8135610e1081610bd3565b9392505050565b634e487b7160e01b600052601160045260246000fd5b60008219821115610e4057610e40610e17565b500190565b6001600160a01b038a81168252602082018a90526040820189905261012082019060028910610e8457634e487b7160e01b600052602160045260246000fd5b8860608401528760808401528660a08401528560c084015280851660e0840152808416610100840152509a9950505050505050505050565b600060208284031215610ece57600080fd5b8151610e1081610d78565b600060208284031215610eeb57600080fd5b5051919050565b600060018201610f0457610f04610e17565b5060010190565b600080600080600080600060e0888a031215610f2657600080fd5b8751610f3181610bd3565b809750506020880151955060408801519450606088015193506080880151925060a0880151610f5f81610bd3565b60c0890151909250610f7081610bd3565b8091505092959891949750929550565b6020808252602b908201527f496e697469616c697a61626c653a20636f6e7472616374206973206e6f74206960408201526a6e697469616c697a696e6760a81b60608201526080019056fea26469706673582212206a906344941afd5edb37b3be8c850e9efa5b914aaab39a6cc9c146de895781e064736f6c634300080d0033";

type VetoMultisigVotingConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: VetoMultisigVotingConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class VetoMultisigVoting__factory extends ContractFactory {
  constructor(...args: VetoMultisigVotingConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<VetoMultisigVoting> {
    return super.deploy(overrides || {}) as Promise<VetoMultisigVoting>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): VetoMultisigVoting {
    return super.attach(address) as VetoMultisigVoting;
  }
  override connect(signer: Signer): VetoMultisigVoting__factory {
    return super.connect(signer) as VetoMultisigVoting__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): VetoMultisigVotingInterface {
    return new utils.Interface(_abi) as VetoMultisigVotingInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): VetoMultisigVoting {
    return new Contract(address, _abi, signerOrProvider) as VetoMultisigVoting;
  }
}
