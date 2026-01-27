/**
 * Blockchain configuration for your demo video.
 * Choose a preset or create a custom configuration.
 */

export interface ChainConfig {
  name: string;
  displayName: string;
  primaryColor: string;
  secondaryColor: string;
  networkName: string;
  privacyFeature?: string;
  explorerUrl?: string;
  tokenSymbol?: string;
}

/**
 * Built-in chain presets
 */
export const chainPresets: Record<string, ChainConfig> = {
  aleo: {
    name: "aleo",
    displayName: "Aleo",
    primaryColor: "#00D1FF",
    secondaryColor: "#6366f1",
    networkName: "Testnet",
    privacyFeature: "Zero-Knowledge Proofs",
    explorerUrl: "https://explorer.aleo.org",
    tokenSymbol: "ALEO",
  },
  ethereum: {
    name: "ethereum",
    displayName: "Ethereum",
    primaryColor: "#627eea",
    secondaryColor: "#8b93b3",
    networkName: "Mainnet",
    explorerUrl: "https://etherscan.io",
    tokenSymbol: "ETH",
  },
  solana: {
    name: "solana",
    displayName: "Solana",
    primaryColor: "#9945FF",
    secondaryColor: "#14F195",
    networkName: "Mainnet",
    explorerUrl: "https://explorer.solana.com",
    tokenSymbol: "SOL",
  },
  polygon: {
    name: "polygon",
    displayName: "Polygon",
    primaryColor: "#8247E5",
    secondaryColor: "#a982ed",
    networkName: "Mainnet",
    explorerUrl: "https://polygonscan.com",
    tokenSymbol: "MATIC",
  },
  base: {
    name: "base",
    displayName: "Base",
    primaryColor: "#0052FF",
    secondaryColor: "#3373ff",
    networkName: "Mainnet",
    explorerUrl: "https://basescan.org",
    tokenSymbol: "ETH",
  },
  arbitrum: {
    name: "arbitrum",
    displayName: "Arbitrum",
    primaryColor: "#28A0F0",
    secondaryColor: "#1b6cb0",
    networkName: "One",
    explorerUrl: "https://arbiscan.io",
    tokenSymbol: "ETH",
  },
};

/**
 * Active chain configuration
 * Change this to use a different chain preset or create a custom config
 */
export const chain: ChainConfig = chainPresets.aleo;
