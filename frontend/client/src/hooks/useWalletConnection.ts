/**
 * Hook for Aleo wallet connection state
 * Use this instead of checking `connected` from useWallet directly
 */

import { useWallet } from "@provablehq/aleo-wallet-adaptor-react";

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
  const { connected, connecting, address } = useWallet();

  return {
    isConnected: connected,
    address: address || null,
    isConnecting: connecting,
    // Backward compatibility - Aleo uses native wallets only
    isPrivyWallet: false,
    isNativeWallet: connected,
  };
}
