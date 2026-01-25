/**
 * Aleo Wallet Hook
 * Provides wallet connection and transaction functionality
 */

import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { Transaction } from "@demox-labs/aleo-wallet-adapter-base";
import { useCallback, useMemo } from "react";
import { useNetwork, ALEO_NETWORK_IDS } from "@/contexts/NetworkContext";
import { shortenAddress, stringToField, toU8, toU32, toU64, toBool } from "@/lib/aleo-encoding";

export interface TransactionInput {
  programId: string;
  functionName: string;
  inputs: string[];
  fee?: number;
}

export function useAleoWallet() {
  const {
    publicKey,
    wallet,
    connected,
    connecting,
    disconnecting,
    connect,
    disconnect,
    requestRecords,
    requestTransaction,
    transactionStatus,
  } = useWallet();

  const { config, network } = useNetwork();

  // Format the connected address
  const address = useMemo(() => publicKey || null, [publicKey]);
  const shortAddress = useMemo(
    () => (address ? shortenAddress(address) : null),
    [address]
  );

  /**
   * Execute a transaction on an Aleo program
   */
  const executeTransaction = useCallback(
    async (input: TransactionInput): Promise<string | null> => {
      if (!connected || !requestTransaction || !address) {
        throw new Error("Wallet not connected");
      }

      try {
        // Get the Aleo network ID (Leo Wallet uses "testnetbeta" for testnet)
        const aleoNetworkId = ALEO_NETWORK_IDS[network];

        // Use Transaction.createTransaction to build the proper AleoTransaction object
        const transaction = Transaction.createTransaction(
          address,
          aleoNetworkId,
          input.programId,
          input.functionName,
          input.inputs,
          input.fee || 100000, // Default fee: 0.1 credits
          false // feePrivate
        );

        const txId = await requestTransaction(transaction);

        return txId;
      } catch (error) {
        console.error("Transaction error:", error);
        throw error;
      }
    },
    [connected, requestTransaction, address, network]
  );

  /**
   * Get records for a specific program
   */
  const getRecords = useCallback(
    async (programId: string) => {
      if (!connected || !requestRecords) {
        throw new Error("Wallet not connected");
      }

      try {
        const records = await requestRecords(programId);
        return records;
      } catch (error) {
        console.error("Error fetching records:", error);
        throw error;
      }
    },
    [connected, requestRecords]
  );

  /**
   * Check transaction status
   */
  const checkTransactionStatus = useCallback(
    async (txId: string) => {
      if (!transactionStatus) {
        throw new Error("Wallet does not support transaction status check");
      }

      try {
        const status = await transactionStatus(txId);
        return status;
      } catch (error) {
        console.error("Error checking transaction status:", error);
        throw error;
      }
    },
    [transactionStatus]
  );

  /**
   * Create poll transaction
   */
  const createPoll = useCallback(
    async (params: {
      title: string;
      description: string;
      options: string[];
      privacyMode: number;
      showResultsLive: boolean;
      rewardPerVote: bigint;
      maxVoters: bigint;
      durationBlocks: number;
      fundAmount: bigint;
      tokenId: string;
    }) => {
      // Format CreatePollInput as a Leo struct literal
      // Struct fields must be in the same order as defined in the contract
      const structInput = `{
        title: ${stringToField(params.title)},
        description: ${stringToField(params.description)},
        option_0: ${stringToField(params.options[0] || "")},
        option_1: ${stringToField(params.options[1] || "")},
        option_2: ${stringToField(params.options[2] || "")},
        option_3: ${stringToField(params.options[3] || "")},
        option_count: ${toU8(params.options.filter(o => o).length)},
        privacy_mode: ${toU8(params.privacyMode)},
        show_results_live: ${toBool(params.showResultsLive)},
        reward_per_vote: ${toU64(params.rewardPerVote)},
        max_voters: ${toU64(params.maxVoters)},
        duration_blocks: ${toU32(params.durationBlocks)},
        fund_amount: ${toU64(params.fundAmount)},
        token_id: ${params.tokenId}
      }`;

      return executeTransaction({
        programId: config.pollProgramId,
        functionName: "create_poll",
        inputs: [structInput],
      });
    },
    [executeTransaction, config.pollProgramId]
  );

  /**
   * Vote on a poll
   */
  const vote = useCallback(
    async (pollId: bigint, optionIndex: number) => {
      return executeTransaction({
        programId: config.pollProgramId,
        functionName: "vote",
        inputs: [`${pollId}u64`, `${optionIndex}u8`],
      });
    },
    [executeTransaction, config.pollProgramId]
  );

  /**
   * Stake PULSE tokens
   */
  const stake = useCallback(
    async (amount: bigint, lockDuration: number) => {
      return executeTransaction({
        programId: config.stakingProgramId,
        functionName: "stake",
        inputs: [`${amount}u64`, `${lockDuration}u32`],
      });
    },
    [executeTransaction, config.stakingProgramId]
  );

  /**
   * Unstake PULSE tokens
   */
  const unstake = useCallback(
    async (receipt: string) => {
      return executeTransaction({
        programId: config.stakingProgramId,
        functionName: "unstake",
        inputs: [receipt],
      });
    },
    [executeTransaction, config.stakingProgramId]
  );

  /**
   * Swap PULSE to stablecoin
   */
  const swapPulseToStable = useCallback(
    async (amountIn: bigint, minAmountOut: bigint) => {
      return executeTransaction({
        programId: config.swapProgramId,
        functionName: "swap_pulse_to_stable",
        inputs: [`${amountIn}u64`, `${minAmountOut}u64`],
      });
    },
    [executeTransaction, config.swapProgramId]
  );

  /**
   * Swap stablecoin to PULSE
   */
  const swapStableToPulse = useCallback(
    async (amountIn: bigint, minAmountOut: bigint) => {
      return executeTransaction({
        programId: config.swapProgramId,
        functionName: "swap_stable_to_pulse",
        inputs: [`${amountIn}u64`, `${minAmountOut}u64`],
      });
    },
    [executeTransaction, config.swapProgramId]
  );

  /**
   * Claim faucet tokens
   */
  const claimFaucet = useCallback(async () => {
    return executeTransaction({
      programId: config.pulseProgramId,
      functionName: "faucet",
      inputs: [],
    });
  }, [executeTransaction, config.pulseProgramId]);

  return {
    // Connection state
    address,
    shortAddress,
    connected,
    connecting,
    disconnecting,
    wallet,

    // Connection actions
    connect,
    disconnect,

    // Low-level transaction
    executeTransaction,
    getRecords,
    checkTransactionStatus,

    // Poll actions
    createPoll,
    vote,

    // Staking actions
    stake,
    unstake,

    // Swap actions
    swapPulseToStable,
    swapStableToPulse,

    // Faucet
    claimFaucet,
  };
}
