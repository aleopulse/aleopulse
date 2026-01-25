/**
 * Hook for Aleo wallet connection state
 * Use this instead of checking `connected` from useWallet directly
 */

import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";

export interface UseWalletConnectionResult {
  // Whether wallet is connected
  isConnected: boolean;
  // The active wallet address
  address: string | null;
  // Whether the wallet is currently connecting
  isConnecting: boolean;
  // Backward compatibility (always false on Aleo - no Privy support)
  isPrivyWallet: boolean;
  isNativeWallet: boolean;
}

export function useWalletConnection(): UseWalletConnectionResult {
  const { connected, connecting, publicKey } = useWallet();

  return {
    isConnected: connected,
    address: publicKey || null,
    isConnecting: connecting,
    // Backward compatibility - Aleo uses native wallets only
    isPrivyWallet: false,
    isNativeWallet: connected,
  };
}
