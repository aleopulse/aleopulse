import { createContext, useContext, useState, ReactNode } from "react";

export type NetworkType = "testnet" | "mainnet";

// Aleo wallet network identifiers (Leo Wallet uses these)
export const ALEO_NETWORK_IDS = {
  testnet: "testnetbeta",  // Current active testnet is testnetbeta
  mainnet: "mainnet",
} as const;

interface NetworkConfig {
  name: string;
  // Program IDs for Aleo contracts
  pollProgramId: string;
  pulseProgramId: string;
  stakingProgramId: string;
  swapProgramId: string;
  // Token IDs
  pulseTokenId: string;
  stableTokenId: string;
  // API endpoints
  explorerApiUrl: string;
  provableApiUrl: string;
  explorerUrl: string;
  // Backward compatibility aliases (for code still referencing old Movement names)
  contractAddress: string;      // Alias for pollProgramId
  stakingContractAddress: string; // Alias for stakingProgramId
  indexerUrl: string;           // Alias for explorerApiUrl
  rpcUrl: string;               // Alias for provableApiUrl
  fullnodeUrl: string;          // Alias for provableApiUrl
}

interface NetworkContextType {
  network: NetworkType;
  setNetwork: (network: NetworkType) => void;
  config: NetworkConfig;
}

// Helper to create config with backward compatibility aliases
function createNetworkConfig(base: {
  name: string;
  pollProgramId: string;
  pulseProgramId: string;
  stakingProgramId: string;
  swapProgramId: string;
  pulseTokenId: string;
  stableTokenId: string;
  explorerApiUrl: string;
  provableApiUrl: string;
  explorerUrl: string;
}): NetworkConfig {
  return {
    ...base,
    // Backward compatibility aliases
    contractAddress: base.pollProgramId,
    stakingContractAddress: base.stakingProgramId,
    indexerUrl: base.explorerApiUrl,
    rpcUrl: base.provableApiUrl,
    fullnodeUrl: base.provableApiUrl,
  };
}

const NETWORK_CONFIGS: Record<NetworkType, NetworkConfig> = {
  testnet: createNetworkConfig({
    name: "Testnet",
    pollProgramId: import.meta.env.VITE_POLL_PROGRAM_ID || "leopulse_poll.aleo",
    pulseProgramId: import.meta.env.VITE_PULSE_PROGRAM_ID || "leopulse_token.aleo",
    stakingProgramId: import.meta.env.VITE_STAKING_PROGRAM_ID || "leopulse_staking.aleo",
    swapProgramId: import.meta.env.VITE_SWAP_PROGRAM_ID || "leopulse_swap.aleo",
    pulseTokenId: import.meta.env.VITE_PULSE_TOKEN_ID || "1field",
    stableTokenId: import.meta.env.VITE_STABLE_TOKEN_ID || "2field",
    explorerApiUrl: import.meta.env.VITE_ALEOSCAN_API || "https://api.testnet.aleoscan.io/v2",
    provableApiUrl: import.meta.env.VITE_PROVABLE_API || "https://api.explorer.provable.com/v1",
    explorerUrl: "https://testnet.aleoscan.io",
  }),
  mainnet: createNetworkConfig({
    name: "Mainnet",
    pollProgramId: import.meta.env.VITE_POLL_PROGRAM_ID || "leopulse_poll.aleo",
    pulseProgramId: import.meta.env.VITE_PULSE_PROGRAM_ID || "leopulse_token.aleo",
    stakingProgramId: import.meta.env.VITE_STAKING_PROGRAM_ID || "leopulse_staking.aleo",
    swapProgramId: import.meta.env.VITE_SWAP_PROGRAM_ID || "leopulse_swap.aleo",
    pulseTokenId: import.meta.env.VITE_PULSE_TOKEN_ID || "1field",
    stableTokenId: import.meta.env.VITE_STABLE_TOKEN_ID || "2field",
    explorerApiUrl: import.meta.env.VITE_ALEOSCAN_API || "https://api.aleoscan.io/v2",
    provableApiUrl: import.meta.env.VITE_PROVABLE_API || "https://api.explorer.provable.com/v1",
    explorerUrl: "https://aleoscan.io",
  }),
};

const STORAGE_KEY = "leopulse_network";

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [network, setNetworkState] = useState<NetworkType>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "mainnet" || stored === "testnet") {
        return stored;
      }
    }
    return "testnet"; // Default to testnet
  });

  const setNetwork = (newNetwork: NetworkType) => {
    setNetworkState(newNetwork);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newNetwork);
    }
  };

  const config = NETWORK_CONFIGS[network];

  return (
    <NetworkContext.Provider value={{ network, setNetwork, config }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
}

export { NETWORK_CONFIGS };
export type { NetworkConfig };
