/**
 * Aleo Indexer - Query mapping data from Aleo explorer APIs
 *
 * Aleo doesn't have The Graph/subgraph equivalent.
 * We use Aleoscan API and Provable API for querying on-chain state.
 */

import { useNetwork } from "@/contexts/NetworkContext";

export interface MappingValue {
  key: string;
  value: string;
}

export interface ProgramMapping {
  program: string;
  mapping: string;
  values: MappingValue[];
}

/**
 * Create an indexer instance for a specific network
 */
export function createIndexer(explorerApiUrl: string, provableApiUrl: string) {
  /**
   * Get a single mapping value by key
   */
  async function getMappingValue(
    programId: string,
    mappingName: string,
    key: string
  ): Promise<string | null> {
    try {
      // Try Provable API first (more reliable)
      const response = await fetch(
        `${provableApiUrl}/testnet/program/${programId}/mapping/${mappingName}/${key}`
      );

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch mapping value: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching mapping value:", error);

      // Fallback to Aleoscan API
      try {
        const response = await fetch(
          `${explorerApiUrl}/mapping/get_value/${programId}/${mappingName}/${key}`
        );

        if (!response.ok) {
          if (response.status === 404) return null;
          throw new Error(`Failed to fetch mapping value: ${response.status}`);
        }

        const data = await response.json();
        return data.value;
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        return null;
      }
    }
  }

  /**
   * Get all values in a mapping (paginated)
   */
  async function getMappingValues(
    programId: string,
    mappingName: string,
    options: { page?: number; limit?: number } = {}
  ): Promise<MappingValue[]> {
    const { page = 0, limit = 100 } = options;

    try {
      // Use Aleoscan API for listing
      const response = await fetch(
        `${explorerApiUrl}/mapping/list_program_mapping_values/${programId}/${mappingName}?p=${page}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch mapping values: ${response.status}`);
      }

      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error("Error fetching mapping values:", error);
      return [];
    }
  }

  /**
   * Get program info
   */
  async function getProgram(programId: string): Promise<any | null> {
    try {
      const response = await fetch(
        `${provableApiUrl}/testnet/program/${programId}`
      );

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch program: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching program:", error);
      return null;
    }
  }

  /**
   * Get transaction by ID
   */
  async function getTransaction(txId: string): Promise<any | null> {
    try {
      const response = await fetch(
        `${provableApiUrl}/testnet/transaction/${txId}`
      );

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch transaction: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching transaction:", error);
      return null;
    }
  }

  /**
   * Get current block height
   */
  async function getBlockHeight(): Promise<number | null> {
    try {
      const response = await fetch(`${provableApiUrl}/testnet/block/height/latest`);

      if (!response.ok) {
        throw new Error(`Failed to fetch block height: ${response.status}`);
      }

      const height = await response.json();
      return typeof height === "number" ? height : parseInt(height, 10);
    } catch (error) {
      console.error("Error fetching block height:", error);
      return null;
    }
  }

  return {
    getMappingValue,
    getMappingValues,
    getProgram,
    getTransaction,
    getBlockHeight,
  };
}

// Poll-specific queries
export interface PollInfo {
  poll_id: bigint;
  creator: string;
  title: string;
  description: string;
  options: string[];
  privacyMode: number;
  showResultsLive: boolean;
  rewardPerVote: bigint;
  maxVoters: bigint;
  endBlock: number;
  totalVoters: bigint;
  status: number;
  tokenId: string;
  totalFunded: bigint;
}

export interface StakePosition {
  positionId: string;
  staker: string;
  amount: bigint;
  stakedAt: number;
  lockDuration: number;
  unlockAt: number;
  isActive: boolean;
}

export interface PoolState {
  pulseReserve: bigint;
  stableReserve: bigint;
  totalLpShares: bigint;
  pulseTokenId: string;
  stableTokenId: string;
  feeBps: number;
  admin: string;
  isInitialized: boolean;
}

/**
 * Parse a PollInfo struct from Aleo mapping value
 */
export function parsePollInfo(value: string): PollInfo | null {
  if (!value) return null;

  try {
    // Aleo struct format: { field1: value1, field2: value2, ... }
    // This is a simplified parser - may need adjustment based on actual format
    const match = value.match(/\{([^}]+)\}/);
    if (!match) return null;

    const content = match[1];
    const fields: Record<string, string> = {};

    // Parse field: value pairs
    const pairs = content.split(",").map((p) => p.trim());
    for (const pair of pairs) {
      const [key, val] = pair.split(":").map((s) => s.trim());
      if (key && val) {
        fields[key] = val;
      }
    }

    return {
      poll_id: BigInt(fields.poll_id?.replace("u64", "") || "0"),
      creator: fields.creator || "",
      title: fields.title || "",
      description: fields.description || "",
      options: [], // Options are stored separately
      privacyMode: parseInt(fields.privacy_mode?.replace("u8", "") || "0", 10),
      showResultsLive: fields.show_results_live === "true",
      rewardPerVote: BigInt(fields.reward_per_vote?.replace("u64", "") || "0"),
      maxVoters: BigInt(fields.max_voters?.replace("u64", "") || "0"),
      endBlock: parseInt(fields.end_block?.replace("u32", "") || "0", 10),
      totalVoters: BigInt(fields.total_voters?.replace("u64", "") || "0"),
      status: parseInt(fields.status?.replace("u8", "") || "0", 10),
      tokenId: fields.token_id || "",
      totalFunded: BigInt(fields.total_funded?.replace("u128", "") || "0"),
    };
  } catch (error) {
    console.error("Error parsing poll info:", error);
    return null;
  }
}

/**
 * Parse a StakePosition struct from Aleo mapping value
 */
export function parseStakePosition(value: string): StakePosition | null {
  if (!value) return null;

  try {
    const match = value.match(/\{([^}]+)\}/);
    if (!match) return null;

    const content = match[1];
    const fields: Record<string, string> = {};

    const pairs = content.split(",").map((p) => p.trim());
    for (const pair of pairs) {
      const [key, val] = pair.split(":").map((s) => s.trim());
      if (key && val) {
        fields[key] = val;
      }
    }

    return {
      positionId: fields.position_id || "",
      staker: fields.staker || "",
      amount: BigInt(fields.amount?.replace("u64", "") || "0"),
      stakedAt: parseInt(fields.staked_at?.replace("u32", "") || "0", 10),
      lockDuration: parseInt(fields.lock_duration?.replace("u32", "") || "0", 10),
      unlockAt: parseInt(fields.unlock_at?.replace("u32", "") || "0", 10),
      isActive: fields.is_active === "true",
    };
  } catch (error) {
    console.error("Error parsing stake position:", error);
    return null;
  }
}

/**
 * Parse a PoolState struct from Aleo mapping value
 */
export function parsePoolState(value: string): PoolState | null {
  if (!value) return null;

  try {
    const match = value.match(/\{([^}]+)\}/);
    if (!match) return null;

    const content = match[1];
    const fields: Record<string, string> = {};

    const pairs = content.split(",").map((p) => p.trim());
    for (const pair of pairs) {
      const [key, val] = pair.split(":").map((s) => s.trim());
      if (key && val) {
        fields[key] = val;
      }
    }

    return {
      pulseReserve: BigInt(fields.pulse_reserve?.replace("u128", "") || "0"),
      stableReserve: BigInt(fields.stable_reserve?.replace("u128", "") || "0"),
      totalLpShares: BigInt(fields.total_lp_shares?.replace("u128", "") || "0"),
      pulseTokenId: fields.pulse_token_id || "",
      stableTokenId: fields.stable_token_id || "",
      feeBps: parseInt(fields.fee_bps?.replace("u64", "") || "0", 10),
      admin: fields.admin || "",
      isInitialized: fields.is_initialized === "true",
    };
  } catch (error) {
    console.error("Error parsing pool state:", error);
    return null;
  }
}
