import { ReactNode, useMemo, createContext, useContext, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AleoWalletProvider } from "@provablehq/aleo-wallet-adaptor-react";
import { LeoWalletAdapter } from "@provablehq/aleo-wallet-adaptor-leo";
import { ShieldWalletAdapter } from "@provablehq/aleo-wallet-adaptor-shield";
import { DecryptPermission } from "@provablehq/aleo-wallet-adaptor-core";
import { Network } from "@provablehq/aleo-types";
import { NetworkProvider, useNetwork } from "@/contexts/NetworkContext";
import { queryClient } from "@/lib/queryClient";

interface WalletProviderProps {
  children: ReactNode;
}

// Custom wallet modal context to replace the library's modal (React 19 compatibility)
interface WalletModalContextType {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const WalletModalContext = createContext<WalletModalContextType>({
  visible: false,
  setVisible: () => {},
});

export function useWalletModal() {
  return useContext(WalletModalContext);
}

// Custom wallet modal provider
function CustomWalletModalProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);

  const value = useMemo(() => ({
    visible,
    setVisible,
  }), [visible]);

  return (
    <WalletModalContext.Provider value={value}>
      {children}
    </WalletModalContext.Provider>
  );
}

// Inner component that wraps the Aleo wallet adapter
function AleoWalletWrapper({ children }: { children: ReactNode }) {
  const { network } = useNetwork();

  // Configure wallets based on network
  const wallets = useMemo(() => {
    return [
      new LeoWalletAdapter({
        appName: "AleoPulse",
      }),
      new ShieldWalletAdapter(),
    ];
  }, [network]);

  // Get the appropriate network from environment
  const aleoNetwork = useMemo(() => {
    return network === "mainnet"
      ? Network.MAINNET
      : Network.TESTNET;
  }, [network]);

  return (
    <AleoWalletProvider
      wallets={wallets}
      decryptPermission={DecryptPermission.UponRequest}
      network={aleoNetwork}
      autoConnect={false}
    >
      <CustomWalletModalProvider>
        {children}
      </CustomWalletModalProvider>
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
