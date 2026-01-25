import { ReactNode, useMemo } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider as AleoWalletProvider } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletModalProvider } from "@demox-labs/aleo-wallet-adapter-reactui";
import { LeoWalletAdapter } from "@demox-labs/aleo-wallet-adapter-leo";
import { DecryptPermission, WalletAdapterNetwork } from "@demox-labs/aleo-wallet-adapter-base";
import { NetworkProvider, useNetwork } from "@/contexts/NetworkContext";
import { queryClient } from "@/lib/queryClient";

// Import the wallet adapter CSS
import "@demox-labs/aleo-wallet-adapter-reactui/styles.css";

interface WalletProviderProps {
  children: ReactNode;
}

// Inner component that wraps the Aleo wallet adapter
function AleoWalletWrapper({ children }: { children: ReactNode }) {
  const { network } = useNetwork();

  // Configure wallets based on network
  const wallets = useMemo(() => {
    const adapterNetwork = network === "mainnet"
      ? WalletAdapterNetwork.MainnetBeta
      : WalletAdapterNetwork.TestnetBeta;

    return [
      new LeoWalletAdapter({
        appName: "LeoPulse",
      }),
    ];
  }, [network]);

  // Get the appropriate network from environment
  const aleoNetwork = useMemo(() => {
    return network === "mainnet"
      ? WalletAdapterNetwork.MainnetBeta
      : WalletAdapterNetwork.TestnetBeta;
  }, [network]);

  return (
    <AleoWalletProvider
      wallets={wallets}
      decryptPermission={DecryptPermission.UponRequest}
      network={aleoNetwork}
      autoConnect={true}
    >
      <WalletModalProvider>
        {children}
      </WalletModalProvider>
    </AleoWalletProvider>
  );
}

// Main provider that wraps NetworkProvider and AleoWalletAdapter
export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <NetworkProvider>
        <AleoWalletWrapper>
          {children}
        </AleoWalletWrapper>
      </NetworkProvider>
    </QueryClientProvider>
  );
}
