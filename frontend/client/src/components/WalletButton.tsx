import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { useWalletModal } from "@demox-labs/aleo-wallet-adapter-reactui";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, LogOut, Copy, ExternalLink, Coins, Settings, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { useNetwork } from "@/contexts/NetworkContext";

export function WalletButton() {
  const { publicKey, wallet, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { config } = useNetwork();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey);
      toast.success("Address copied to clipboard");
    }
  };

  const viewOnExplorer = () => {
    if (publicKey) {
      window.open(
        `${config.explorerUrl}/address/${publicKey}`,
        "_blank"
      );
    }
  };

  const handleDisconnect = async () => {
    disconnect();
    toast.success("Wallet disconnected");
  };

  const handleConnect = () => {
    setVisible(true);
  };

  if (!connected) {
    return (
      <Button variant="outline" size="sm" className="gap-2" onClick={handleConnect}>
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {wallet?.adapter.icon && (
            <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-4 h-4" />
          )}
          {publicKey ? truncateAddress(publicKey) : "Connected"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Connected via {wallet?.adapter.name}</span>
          </div>
          <Link href="/staking">
            <Button size="sm" variant="outline" className="w-full text-xs h-7 border-purple-500/50 text-purple-600 hover:bg-purple-500/10">
              <TrendingUp className="w-3 h-3 mr-1" />
              Stake PULSE
            </Button>
          </Link>
        </div>
        <DropdownMenuSeparator />
        <Link href="/wallet">
          <DropdownMenuItem className="cursor-pointer">
            <Coins className="w-4 h-4 mr-2" />
            Wallet
          </DropdownMenuItem>
        </Link>
        <Link href="/settings">
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
          <Copy className="w-4 h-4 mr-2" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem onClick={viewOnExplorer} className="cursor-pointer">
          <ExternalLink className="w-4 h-4 mr-2" />
          View on Explorer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDisconnect}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
