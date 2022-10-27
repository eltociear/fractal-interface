/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../common";

export interface IVetoVotingInterface extends utils.Interface {
  functions: {
    "castFreezeVote()": FunctionFragment;
    "castVetoVote(bytes32,bool)": FunctionFragment;
    "getIsVetoed(bytes32)": FunctionFragment;
    "isFrozen()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "castFreezeVote"
      | "castVetoVote"
      | "getIsVetoed"
      | "isFrozen"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "castFreezeVote",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "castVetoVote",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<boolean>]
  ): string;
  encodeFunctionData(
    functionFragment: "getIsVetoed",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(functionFragment: "isFrozen", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "castFreezeVote",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "castVetoVote",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getIsVetoed",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "isFrozen", data: BytesLike): Result;

  events: {
    "FreezeProposalCreated(address)": EventFragment;
    "FreezeVoteCast(address,uint256)": EventFragment;
    "VetoVoteCast(address,bytes32,uint256,bool)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "FreezeProposalCreated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "FreezeVoteCast"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "VetoVoteCast"): EventFragment;
}

export interface FreezeProposalCreatedEventObject {
  creator: string;
}
export type FreezeProposalCreatedEvent = TypedEvent<
  [string],
  FreezeProposalCreatedEventObject
>;

export type FreezeProposalCreatedEventFilter =
  TypedEventFilter<FreezeProposalCreatedEvent>;

export interface FreezeVoteCastEventObject {
  voter: string;
  votesCast: BigNumber;
}
export type FreezeVoteCastEvent = TypedEvent<
  [string, BigNumber],
  FreezeVoteCastEventObject
>;

export type FreezeVoteCastEventFilter = TypedEventFilter<FreezeVoteCastEvent>;

export interface VetoVoteCastEventObject {
  voter: string;
  transactionHash: string;
  votesCast: BigNumber;
  freeze: boolean;
}
export type VetoVoteCastEvent = TypedEvent<
  [string, string, BigNumber, boolean],
  VetoVoteCastEventObject
>;

export type VetoVoteCastEventFilter = TypedEventFilter<VetoVoteCastEvent>;

export interface IVetoVoting extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IVetoVotingInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    castFreezeVote(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    castVetoVote(
      _transactionHash: PromiseOrValue<BytesLike>,
      _freeze: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getIsVetoed(
      _transactionHash: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    isFrozen(overrides?: CallOverrides): Promise<[boolean]>;
  };

  castFreezeVote(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  castVetoVote(
    _transactionHash: PromiseOrValue<BytesLike>,
    _freeze: PromiseOrValue<boolean>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getIsVetoed(
    _transactionHash: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  isFrozen(overrides?: CallOverrides): Promise<boolean>;

  callStatic: {
    castFreezeVote(overrides?: CallOverrides): Promise<void>;

    castVetoVote(
      _transactionHash: PromiseOrValue<BytesLike>,
      _freeze: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<void>;

    getIsVetoed(
      _transactionHash: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    isFrozen(overrides?: CallOverrides): Promise<boolean>;
  };

  filters: {
    "FreezeProposalCreated(address)"(
      creator?: PromiseOrValue<string> | null
    ): FreezeProposalCreatedEventFilter;
    FreezeProposalCreated(
      creator?: PromiseOrValue<string> | null
    ): FreezeProposalCreatedEventFilter;

    "FreezeVoteCast(address,uint256)"(
      voter?: PromiseOrValue<string> | null,
      votesCast?: null
    ): FreezeVoteCastEventFilter;
    FreezeVoteCast(
      voter?: PromiseOrValue<string> | null,
      votesCast?: null
    ): FreezeVoteCastEventFilter;

    "VetoVoteCast(address,bytes32,uint256,bool)"(
      voter?: PromiseOrValue<string> | null,
      transactionHash?: PromiseOrValue<BytesLike> | null,
      votesCast?: null,
      freeze?: null
    ): VetoVoteCastEventFilter;
    VetoVoteCast(
      voter?: PromiseOrValue<string> | null,
      transactionHash?: PromiseOrValue<BytesLike> | null,
      votesCast?: null,
      freeze?: null
    ): VetoVoteCastEventFilter;
  };

  estimateGas: {
    castFreezeVote(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    castVetoVote(
      _transactionHash: PromiseOrValue<BytesLike>,
      _freeze: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getIsVetoed(
      _transactionHash: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isFrozen(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    castFreezeVote(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    castVetoVote(
      _transactionHash: PromiseOrValue<BytesLike>,
      _freeze: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getIsVetoed(
      _transactionHash: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isFrozen(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
