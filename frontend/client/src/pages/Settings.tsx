import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings as SettingsIcon,
  Fuel,
  Info,
  Wallet,
  Network,
  Zap,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { toast } from "sonner";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { useNetwork, type NetworkType } from "@/contexts/NetworkContext";
import { useGasSponsorship } from "@/contexts/GasSponsorshipContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { WalletSelectionModal } from "@/components/WalletSelectionModal";
import {
  isIndexerOptimizationEnabled,
  setIndexerOptimizationEnabled,
} from "@/lib/feature-flags";

export default function SettingsPage() {
  const { isConnected, address } = useWalletConnection();
  const { network, setNetwork } = useNetwork();
  // Gas sponsorship - Coming Soon! (context preserved for future integration)
  const _gasSponsorshipContext = useGasSponsorship();

  const [indexerOptEnabled, setIndexerOptEnabled] = useState(() => isIndexerOptimizationEnabled());
  const [theme, setTheme] = useState<"light" | "dark" | "system">("dark");

  // Initialize theme from localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "light" || storedTheme === "dark") {
      setTheme(storedTheme);
    } else {
      setTheme("system");
    }
  }, []);

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    if (newTheme === "system") {
      localStorage.removeItem("theme");
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", isDark);
    } else {
      localStorage.setItem("theme", newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");
    }
    toast.success(`Theme changed to ${newTheme}`);
  };

  const handleNetworkChange = (newNetwork: NetworkType) => {
    setNetwork(newNetwork);
    toast.success(`Switched to ${newNetwork}`);
  };

  const handleIndexerOptToggle = (enabled: boolean) => {
    setIndexerOptimizationEnabled(enabled);
    setIndexerOptEnabled(enabled);
    toast.success(
      enabled
        ? "Indexer optimization enabled - faster data loading!"
        : "Indexer optimization disabled - using standard fetching"
    );
  };

  if (!isConnected) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-display font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your preferences</p>
          </div>
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Connect Wallet</p>
            <p className="text-muted-foreground text-center mb-6">
              Connect your wallet to access settings
            </p>
            <WalletSelectionModal>
              <Button className="gap-2">
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </Button>
            </WalletSelectionModal>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 mb-8">
        <SettingsIcon className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-display font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Gas Sponsorship Card */}
        <Card className="opacity-75">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fuel className="w-5 h-5 text-muted-foreground" />
              Gas Sponsorship
              <Badge variant="outline" className="ml-2 text-xs">Coming Soon!</Badge>
            </CardTitle>
            <CardDescription>
              Free transactions powered by LeoPulse (under development)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Toggle - Disabled */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border opacity-60">
              <div className="flex-1">
                <p className="font-medium">Use sponsored gas (free transactions)</p>
                <p className="text-sm text-muted-foreground mt-1">
                  When enabled, transaction fees will be covered by LeoPulse.
                  You won't need credits for gas.
                </p>
              </div>
              <Switch
                checked={false}
                disabled={true}
              />
            </div>

            {/* Info Banner */}
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription className="text-sm">
                Gas sponsorship for Aleo is under development. Once available,
                it will leverage Aleo's native fee delegation mechanism to cover
                transaction fees, enabling free transactions for users.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Performance Optimization Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Performance Optimization
            </CardTitle>
            <CardDescription>
              Use Aleo Explorer API for faster data retrieval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
              <div className="flex-1">
                <p className="font-medium">Enable indexer optimization</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Uses cached data and parallel fetching. Disable if experiencing issues.
                </p>
              </div>
              <Switch
                checked={indexerOptEnabled}
                onCheckedChange={handleIndexerOptToggle}
              />
            </div>

            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription className="text-sm">
                When enabled, poll data is cached for 60 seconds and fetched in parallel
                for faster loading. Vote and claim status checks use the Aleo Explorer API
                instead of individual RPC calls.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Wallet Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Connected Wallet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-mono text-sm truncate max-w-[300px]">
                  {address}
                </p>
              </div>
              <Badge variant="secondary">
                Browser Wallet
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Theme Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-primary" />
              Appearance
            </CardTitle>
            <CardDescription>
              Choose your preferred theme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={theme}
              onValueChange={(value) => handleThemeChange(value as "light" | "dark" | "system")}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="light"
                  id="theme-light"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="theme-light"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Sun className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">Light</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="dark"
                  id="theme-dark"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="theme-dark"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Moon className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">Dark</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="system"
                  id="theme-system"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="theme-system"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Monitor className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">System</span>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Network Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5 text-primary" />
              Network
            </CardTitle>
            <CardDescription>
              Select which blockchain network to use
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={network}
              onValueChange={(value) => handleNetworkChange(value as NetworkType)}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="testnet"
                  id="network-testnet"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="network-testnet"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Badge variant="outline" className="mb-2">Test</Badge>
                  <span className="text-sm font-medium">Testnet</span>
                  <span className="text-xs text-muted-foreground mt-1">For testing</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="mainnet"
                  id="network-mainnet"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="network-mainnet"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Badge variant="default" className="mb-2">Live</Badge>
                  <span className="text-sm font-medium">Mainnet</span>
                  <span className="text-xs text-muted-foreground mt-1">Real assets</span>
                </Label>
              </div>
            </RadioGroup>

            <Alert className="mt-4">
              <Info className="w-4 h-4" />
              <AlertDescription className="text-sm">
                Switching networks will reload your data from the selected blockchain.
                Make sure your wallet is connected to the same network.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
