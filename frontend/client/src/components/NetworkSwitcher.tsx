import { useNetwork, NetworkType, NETWORK_CONFIGS } from "@/contexts/NetworkContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import { toast } from "sonner";

export function NetworkSwitcher() {
  const { network, setNetwork } = useNetwork();

  const handleNetworkChange = async (newNetwork: NetworkType) => {
    setNetwork(newNetwork);
    toast.success(`Switched to Aleo ${NETWORK_CONFIGS[newNetwork].name}`, {
      description: `Now using ${newNetwork === "mainnet" ? "mainnet" : "testnet"}.aleoscan.io`,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={network}
        onValueChange={(value) => handleNetworkChange(value as NetworkType)}
      >
        <SelectTrigger className="w-[140px] h-9">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="testnet">
            <div className="flex items-center gap-2">
              <span>Testnet</span>
            </div>
          </SelectItem>
          <SelectItem value="mainnet" disabled>
            <div className="flex items-center gap-2">
              <span>Mainnet</span>
              <Badge variant="outline" className="text-[10px] px-1 py-0 text-muted-foreground">
                Soon
              </Badge>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
