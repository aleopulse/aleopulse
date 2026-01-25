import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import type { WalletName } from "@demox-labs/aleo-wallet-adapter-base";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ExternalLink, Loader2 } from "lucide-react";
import { useNetwork } from "@/contexts/NetworkContext";
import { useEffect } from "react";

interface WalletConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Supported Aleo wallets
const ALEO_WALLETS = [
  {
    name: "Leo Wallet",
    icon: "https://www.leo.app/favicon.ico",
    url: "https://www.leo.app/",
    description: "Official Leo wallet for Aleo",
  },
  {
    name: "Puzzle Wallet",
    icon: "https://puzzle.online/favicon.ico",
    url: "https://puzzle.online/",
    description: "Puzzle wallet for Aleo ecosystem",
  },
];

export function WalletConnectModal({ open, onOpenChange }: WalletConnectModalProps) {
  const { wallets, select, connecting, connected } = useWallet();
  const { network } = useNetwork();

  const isMainnet = network === "mainnet";

  // Close modal when connected
  useEffect(() => {
    if (connected && open) {
      onOpenChange(false);
    }
  }, [connected, open, onOpenChange]);

  const handleWalletSelect = async (walletName: WalletName) => {
    try {
      select(walletName);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Connect to AleoPulse
          </DialogTitle>
          <DialogDescription>
            Choose an Aleo wallet to connect
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Mainnet Notice */}
          {isMainnet && (
            <Alert variant="default" className="border-yellow-500/50 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-600 dark:text-yellow-400 text-sm">
                <strong>Mainnet:</strong> Make sure you have Aleo credits in your wallet for transaction fees.
              </AlertDescription>
            </Alert>
          )}

          {/* Connecting state */}
          {connecting && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Connecting...</span>
            </div>
          )}

          {/* Available wallets from adapter */}
          {!connecting && wallets.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center mb-3">
                Select a wallet to connect:
              </p>
              {wallets.map((w) => (
                <Button
                  key={w.adapter.name}
                  variant="outline"
                  className="w-full justify-start h-14 hover:bg-accent hover:border-primary/50 transition-all"
                  onClick={() => handleWalletSelect(w.adapter.name as WalletName)}
                  disabled={connecting}
                >
                  <div className="flex items-center space-x-3">
                    {w.adapter.icon && (
                      <img
                        src={w.adapter.icon}
                        alt={w.adapter.name}
                        className="w-8 h-8 rounded-lg"
                      />
                    )}
                    <div className="text-left">
                      <span className="font-medium block">{w.adapter.name}</span>
                      <span className="text-xs text-muted-foreground">Click to connect</span>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}

          {/* No wallets detected */}
          {!connecting && wallets.length === 0 && (
            <div className="space-y-3">
              <div className="text-center py-4 border border-dashed rounded-lg">
                <p className="text-sm text-muted-foreground mb-3">
                  No Aleo wallets detected. Install one of these wallets:
                </p>
                <div className="space-y-2">
                  {ALEO_WALLETS.map((wallet) => (
                    <a
                      key={wallet.name}
                      href={wallet.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={wallet.icon}
                          alt={wallet.name}
                          className="w-6 h-6 rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                        <div className="text-left">
                          <p className="font-medium text-sm">{wallet.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {wallet.description}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Testnet faucet info */}
          {!isMainnet && (
            <div className="text-center text-xs text-muted-foreground p-2 bg-muted/50 rounded-lg">
              <p>
                Need testnet credits?{" "}
                <a
                  href="https://faucet.aleo.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Get them from the Aleo Faucet
                </a>
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
