import { useState } from "react";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { useWalletModal } from "@demox-labs/aleo-wallet-adapter-reactui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { useNetwork } from "@/contexts/NetworkContext";

interface WalletSelectionModalProps {
  children: React.ReactNode;
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

export function WalletSelectionModal({ children }: WalletSelectionModalProps) {
  const [open, setOpen] = useState(false);
  const { wallets, select, connected, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  const { network } = useNetwork();

  const isMainnet = network === "mainnet";

  const handleOpenWalletModal = () => {
    setOpen(false);
    setVisible(true);
  };

  const handleWalletSelect = async (walletName: string) => {
    try {
      const selectedWallet = wallets.find((w) => w.adapter.name === walletName);
      if (selectedWallet) {
        select(selectedWallet.adapter.name);
        setOpen(false);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
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

          {/* Primary action - use wallet adapter modal */}
          <Button
            variant="default"
            className="w-full justify-center h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
            onClick={handleOpenWalletModal}
          >
            Connect with Aleo Wallet
          </Button>

          {/* Available wallets from adapter */}
          {wallets.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                Detected wallets:
              </p>
              {wallets.map((w) => (
                <Button
                  key={w.adapter.name}
                  variant="outline"
                  className="w-full justify-start h-12 hover:bg-accent"
                  onClick={() => handleWalletSelect(w.adapter.name)}
                >
                  <div className="flex items-center space-x-3">
                    {w.adapter.icon && (
                      <img
                        src={w.adapter.icon}
                        alt={w.adapter.name}
                        className="w-6 h-6 rounded"
                      />
                    )}
                    <span className="font-medium">{w.adapter.name}</span>
                  </div>
                </Button>
              ))}
            </div>
          )}

          {/* No wallets detected */}
          {wallets.length === 0 && (
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
