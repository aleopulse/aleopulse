import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wallet as WalletIcon,
  Copy,
  ExternalLink,
  RefreshCcw,
  AlertTriangle,
  Loader2,
  Droplets,
  ArrowDownUp,
  Vote,
  Eye,
  EyeOff,
  Send,
  Download,
  Gift,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { useNetwork } from "@/contexts/NetworkContext";
import { getAllBalances, type AllBalances, parseToSmallestUnit } from "@/lib/balance";
import { COIN_TYPES, getCoinDecimals, type CoinTypeId } from "@/lib/tokens";
import { WalletSelectionModal } from "@/components/WalletSelectionModal";
import { useAleoWallet } from "@/hooks/useAleoWallet";
import { claimPulseFaucet, getAleoFaucetUrl } from "@/lib/faucet";
import { formatRelativeTime } from "@/lib/events";
import { useStaking } from "@/hooks/useStaking";
import { Progress } from "@/components/ui/progress";
import { TIER_NAMES, TIER_PULSE_THRESHOLDS, TIERS } from "@shared/schema";
import { Lock, Unlock, TrendingUp, ChevronRight, Settings } from "lucide-react";

export default function WalletPage() {
  const { isConnected, address, isPrivyWallet } = useWalletConnection();
  const { executeTransaction } = useAleoWallet();
  const { network, config } = useNetwork();

  const [balances, setBalances] = useState<AllBalances | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [hideBalances, setHideBalances] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Transfer state
  const [selectedToken, setSelectedToken] = useState<CoinTypeId>(COIN_TYPES.PULSE);
  const [transferAmount, setTransferAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [isClaimingPulse, setIsClaimingPulse] = useState(false);

  // Faucet rate limiting state
  const [faucetCanClaim, setFaucetCanClaim] = useState<boolean | null>(null);
  const [faucetNextClaimTime, setFaucetNextClaimTime] = useState<string | null>(null);
  const [isCheckingFaucet, setIsCheckingFaucet] = useState(false);

  const isTestnet = network === "testnet";

  // Activity events (placeholder - would need Aleo indexer)
  const activityEvents: Array<{ type: string; pollId: number; timestamp: number; amount?: number }> = [];
  const isLoadingActivity = false;

  // Privy-specific variables (not applicable on Aleo - browser wallets only)
  const isFunding = false;
  const isAccountFunded = false;
  const displayName: string | null = null;

  // Staking info
  const {
    isConfigured: isStakingConfigured,
    totalStaked,
    unlockableAmount,
    isLoading: isLoadingStaking,
  } = useStaking();

  // Fetch all balances
  const fetchBalance = useCallback(async () => {
    if (!address) return;

    setIsLoadingBalance(true);
    try {
      const balanceData = await getAllBalances(address, config.explorerApiUrl, config.provableApiUrl);
      setBalances(balanceData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch balances:", error);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [address, config.explorerApiUrl, config.provableApiUrl]);

  // Fetch balances on mount and when address changes
  useEffect(() => {
    if (address) {
      fetchBalance();
    } else {
      setBalances(null);
    }
  }, [address, fetchBalance]);

  // Check faucet eligibility
  const checkFaucetEligibility = useCallback(async () => {
    if (!address || !isTestnet) {
      setFaucetCanClaim(null);
      return;
    }

    setIsCheckingFaucet(true);
    try {
      const res = await fetch(`/api/faucet/check?network=${network}&wallet=${address}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setFaucetCanClaim(data.data.canClaim);
        setFaucetNextClaimTime(data.data.nextClaimTime);
      }
    } catch (error) {
      console.error("Failed to check faucet eligibility:", error);
      // Default to allowing claim if check fails
      setFaucetCanClaim(true);
    } finally {
      setIsCheckingFaucet(false);
    }
  }, [address, network, isTestnet]);

  // Check faucet eligibility on mount
  useEffect(() => {
    if (address && isTestnet) {
      checkFaucetEligibility();
    }
  }, [address, isTestnet, checkFaucetEligibility]);

  // Copy address to clipboard
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Address copied to clipboard");
    }
  };

  // Open explorer
  const openExplorer = () => {
    if (address) {
      window.open(
        `${config.explorerUrl}/account/${address}?network=${network}`,
        "_blank"
      );
    }
  };

  // Handle fund wallet - on Aleo, direct users to faucet
  const handleFundWallet = async () => {
    window.open(getAleoFaucetUrl(), "_blank");
  };

  // Handle PULSE faucet with rate limiting
  const handlePulseFaucet = async () => {
    if (!address) return;

    // Check rate limit first
    if (faucetCanClaim === false) {
      const timeRemaining = faucetNextClaimTime
        ? formatTimeUntil(new Date(faucetNextClaimTime))
        : "24 hours";
      toast.error("Faucet rate limited", {
        description: `You can claim again in ${timeRemaining}`,
      });
      return;
    }

    setIsClaimingPulse(true);
    try {
      const result = await claimPulseFaucet(executeTransaction, config.pulseProgramId);

      if (!result.success) {
        throw new Error(result.error || "Faucet claim failed");
      }

      // Record the claim in the backend
      try {
        await fetch("/api/faucet/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ network, wallet: address, txHash: result.txId }),
        });
        // Update local state
        setFaucetCanClaim(false);
        setFaucetNextClaimTime(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());
      } catch (recordError) {
        console.error("Failed to record faucet claim:", recordError);
        // Don't fail the whole operation if recording fails
      }

      toast.success("PULSE claimed successfully!", {
        description: "You received PULSE from the faucet",
        action: {
          label: "View",
          onClick: () => window.open(`${config.explorerUrl}/transaction/${result.txId}`, "_blank"),
        },
      });

      // Refresh balance after claiming
      setTimeout(fetchBalance, 2000);
    } catch (error) {
      console.error("PULSE faucet failed:", error);
      toast.error("Failed to claim PULSE", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsClaimingPulse(false);
    }
  };

  // Helper function to format time until next claim
  const formatTimeUntil = (date: Date): string => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    if (diffMs <= 0) return "now";

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Get selected token balance (as number for arithmetic)
  const getSelectedBalance = () => {
    if (!balances) return 0;
    return Number(balances[selectedToken]?.balance ?? 0n);
  };

  // Get formatted selected balance
  const getFormattedSelectedBalance = () => {
    if (!balances) return "0.0000";
    return balances[selectedToken]?.balanceFormatted ?? "0.0000";
  };

  // Set max amount
  const handleMaxAmount = () => {
    const balance = getSelectedBalance();
    const decimals = getCoinDecimals(selectedToken);
    const amount = balance / Math.pow(10, decimals);
    setTransferAmount(amount.toString());
  };

  // Handle transfer
  const handleTransfer = async () => {
    if (!address || !recipientAddress || !transferAmount) {
      toast.error("Please fill in all fields");
      return;
    }

    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Validate recipient address (Aleo addresses start with aleo1)
    if (!recipientAddress.startsWith("aleo1") || recipientAddress.length !== 63) {
      toast.error("Please enter a valid Aleo address (starts with aleo1)");
      return;
    }

    const balance = getSelectedBalance();
    const decimals = getCoinDecimals(selectedToken);
    const amountInSmallestUnit = parseToSmallestUnit(amount, decimals);

    if (amountInSmallestUnit > balance) {
      toast.error("Insufficient balance");
      return;
    }

    setIsTransferring(true);

    try {
      let txId: string | null = null;

      if (selectedToken === COIN_TYPES.PULSE) {
        // PULSE transfer via token_registry
        txId = await executeTransaction({
          programId: config.pulseProgramId,
          functionName: "transfer_public",
          inputs: [recipientAddress, `${amountInSmallestUnit}u128`],
        }) ?? null;
      } else if (selectedToken === COIN_TYPES.CREDITS) {
        // Credits transfer via credits.aleo
        txId = await executeTransaction({
          programId: "credits.aleo",
          functionName: "transfer_public",
          inputs: [recipientAddress, `${amountInSmallestUnit}u64`],
        }) ?? null;
      } else {
        // Stablecoin transfer not fully implemented
        toast.error("Stablecoin transfers are not yet supported");
        return;
      }

      if (!txId) {
        throw new Error("Transaction failed - no transaction ID returned");
      }

      toast.success("Transfer successful!", {
        description: `Transaction: ${txId.slice(0, 10)}...`,
        action: {
          label: "View",
          onClick: () => window.open(`${config.explorerUrl}/transaction/${txId}`, "_blank"),
        },
      });

      // Clear form and refresh balance
      setTransferAmount("");
      setRecipientAddress("");
      setTimeout(fetchBalance, 2000);
    } catch (error) {
      console.error("Transfer failed:", error);
      toast.error("Transfer failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsTransferring(false);
    }
  };

  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return "";
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  // Truncate address for display
  const truncateAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Token display config
  const tokenConfig = [
    { id: COIN_TYPES.PULSE, symbol: "PULSE", color: "purple", bgClass: "bg-purple-500/10 border-purple-500/20" },
    { id: COIN_TYPES.CREDITS, symbol: "CREDITS", color: "blue", bgClass: "bg-blue-500/10 border-blue-500/20" },
    { id: COIN_TYPES.STABLE, symbol: "USDC", color: "green", bgClass: "bg-green-500/10 border-green-500/20" },
  ];

  // Not connected state
  if (!isConnected) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Card className="border-dashed max-w-lg mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <WalletIcon className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6 text-center">
              Connect a wallet to view your balance and manage your account.
            </p>
            <WalletSelectionModal>
              <Button size="lg">
                <WalletIcon className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            </WalletSelectionModal>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
          <WalletIcon className="w-8 h-8" />
          My Wallet
        </h1>
        <p className="text-muted-foreground">Manage your tokens and view transaction history</p>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Wallet Balance Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Wallet Balance
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setHideBalances(!hideBalances)}
                    >
                      {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Last updated: {formatLastUpdated() || "Never"}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchBalance}
                  disabled={isLoadingBalance}
                >
                  <RefreshCcw className={`w-4 h-4 mr-1 ${isLoadingBalance ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Total Portfolio Box */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-400 rounded-lg p-6 text-white">
                <p className="text-purple-100 text-sm mb-1">Total PULSE Balance</p>
                <p className="text-3xl font-bold font-mono">
                  {hideBalances ? "••••••" : (balances?.[COIN_TYPES.PULSE]?.balanceFormatted ?? "0.0000")}
                  <span className="text-lg ml-2 text-purple-100">PULSE</span>
                </p>
              </div>

              {/* Token List */}
              <div className="space-y-3">
                {tokenConfig.map((token) => (
                  <div
                    key={token.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${token.bgClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-${token.color}-500/20 flex items-center justify-center`}>
                        <span className={`text-${token.color}-500 font-bold text-sm`}>
                          {token.symbol.slice(0, 2)}
                        </span>
                      </div>
                      <span className="font-medium">{token.symbol}</span>
                    </div>
                    <div className="text-right">
                      {isLoadingBalance ? (
                        <Skeleton className="h-6 w-24" />
                      ) : (
                        <p className="font-mono font-bold">
                          {hideBalances ? "••••••" : (balances?.[token.id]?.balanceFormatted ?? "0.0000")}
                          <span className="text-muted-foreground text-sm ml-1">{token.symbol}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Wallet Address */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Wallet Address:</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                    {truncateAddress(address || "")}
                  </code>
                </div>
                <Button variant="ghost" size="sm" onClick={copyAddress}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              {/* Account Status */}
              {balances && !balances[COIN_TYPES.CREDITS]?.exists && (
                <Alert variant="default" className="border-yellow-500/50 bg-yellow-500/10">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-yellow-600 dark:text-yellow-400">
                    This account hasn't been initialized on-chain yet. Fund it with some Aleo credits to activate it.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your on-chain transaction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isLoadingActivity ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : activityEvents && activityEvents.length > 0 ? (
                  activityEvents.map((event, index) => (
                    <div
                      key={`${event.type}-${event.pollId}-${index}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          event.type === 'vote'
                            ? 'bg-purple-500/20'
                            : event.type === 'reward_claimed'
                            ? 'bg-green-500/20'
                            : 'bg-blue-500/20'
                        }`}>
                          {event.type === 'vote' ? (
                            <Vote className="w-5 h-5 text-purple-500" />
                          ) : event.type === 'reward_claimed' ? (
                            <Gift className="w-5 h-5 text-green-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {event.type === 'vote'
                              ? `Voted on Poll #${event.pollId}`
                              : event.type === 'reward_claimed'
                              ? `Claimed reward from Poll #${event.pollId}`
                              : `Created Poll #${event.pollId}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatRelativeTime(event.timestamp)}
                          </p>
                        </div>
                      </div>
                      {event.type === 'reward_claimed' && event.amount && (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                          +{(event.amount / 1e8).toFixed(2)} PULSE
                        </Badge>
                      )}
                      {event.type === 'vote' && (
                        <Badge variant="secondary" className="bg-purple-500/10 text-purple-600">
                          Voted
                        </Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mb-2 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                    <p className="text-xs">Your votes and rewards will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - 1/3 width */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/swap">
                <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700">
                  <ArrowDownUp className="w-4 h-4 mr-2" />
                  Swap Tokens
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={copyAddress}
              >
                <Download className="w-4 h-4 mr-2" />
                Receive PULSE
              </Button>
              <Link href="/polls">
                <Button variant="outline" className="w-full justify-start">
                  <Vote className="w-4 h-4 mr-2" />
                  Participate in Polls
                </Button>
              </Link>
              {/* Get PULSE - Testnet only with rate limiting */}
              {isTestnet && (
                <div className="space-y-1">
                  <Button
                    variant="outline"
                    className={`w-full justify-start ${
                      faucetCanClaim === false
                        ? "border-muted text-muted-foreground"
                        : "border-purple-500/50 text-purple-600 hover:bg-purple-500/10"
                    }`}
                    onClick={handlePulseFaucet}
                    disabled={isClaimingPulse || isCheckingFaucet || faucetCanClaim === false}
                  >
                    {isClaimingPulse ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Claiming...
                      </>
                    ) : isCheckingFaucet ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : faucetCanClaim === false ? (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        Faucet (Rate Limited)
                      </>
                    ) : (
                      <>
                        <Droplets className="w-4 h-4 mr-2" />
                        Get PULSE (Faucet)
                      </>
                    )}
                  </Button>
                  {faucetCanClaim === false && faucetNextClaimTime && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 pl-1">
                      <Clock className="w-3 h-3" />
                      Available in {formatTimeUntil(new Date(faucetNextClaimTime))}
                    </p>
                  )}
                </div>
              )}
              {/* Get MOVE - Testnet only for Privy wallets */}
              {isPrivyWallet && isTestnet && (
                <Button
                  variant="outline"
                  className="w-full justify-start border-blue-500/50 text-blue-600 hover:bg-blue-500/10"
                  onClick={handleFundWallet}
                  disabled={isFunding}
                >
                  {isFunding ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Funding...
                    </>
                  ) : (
                    <>
                      <Droplets className="w-4 h-4 mr-2" />
                      Get MOVE (Faucet)
                    </>
                  )}
                </Button>
              )}
              {isAccountFunded && isPrivyWallet && isTestnet && (
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Gift className="w-3 h-3" />
                  Account has been funded
                </p>
              )}
              {/* Settings link - especially important on mobile where header controls are hidden */}
              <Link href="/settings">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Staking Summary Card */}
          {isStakingConfigured && (
            <Card className="border-purple-500/30 bg-purple-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lock className="w-4 h-4 text-purple-500" />
                  PULSE Staking
                </CardTitle>
                <CardDescription>
                  Stake PULSE to boost your tier
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoadingStaking ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Staked</p>
                        <p className="font-mono font-bold">
                          {(totalStaked / 1e8).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Unlockable</p>
                        <p className="font-mono font-bold text-green-600">
                          {(unlockableAmount / 1e8).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    <Link href="/staking">
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        <Lock className="w-4 h-4 mr-2" />
                        Manage Staking
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Transfer Tokens Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Transfer Tokens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Token Select */}
              <div className="space-y-2">
                <Label>Token</Label>
                <Select
                  value={selectedToken.toString()}
                  onValueChange={(val) => setSelectedToken(parseInt(val) as CoinTypeId)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={COIN_TYPES.PULSE.toString()}>PULSE</SelectItem>
                    <SelectItem value={COIN_TYPES.CREDITS.toString()}>CREDITS</SelectItem>
                    <SelectItem value={COIN_TYPES.STABLE.toString()} disabled>
                      Stablecoin (coming soon)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Balance: {getFormattedSelectedBalance()} {tokenConfig.find(t => t.id === selectedToken)?.symbol}
                </p>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <Label>Amount</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm" onClick={handleMaxAmount}>
                    Max
                  </Button>
                </div>
              </div>

              {/* Recipient Address */}
              <div className="space-y-2">
                <Label>Recipient Address</Label>
                <Input
                  placeholder="0x..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                />
              </div>

              {/* Transfer Button */}
              <Button
                className="w-full"
                onClick={handleTransfer}
                disabled={isTransferring || !transferAmount || !recipientAddress}
              >
                {isTransferring ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Transferring...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Transfer {tokenConfig.find(t => t.id === selectedToken)?.symbol}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Wallet Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Wallet Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Address</span>
                <div className="flex items-center gap-1">
                  <code className="text-xs font-mono">{truncateAddress(address || "")}</code>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyAddress}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Network</span>
                <Badge variant={isTestnet ? "secondary" : "default"}>
                  {config.name}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Wallet Type</span>
                <span className="text-sm">{isPrivyWallet ? "Privy Wallet" : "Native Wallet"}</span>
              </div>
              {isPrivyWallet && displayName && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Account</span>
                  <span className="text-sm">{displayName}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Explore Card */}
          <Card>
            <CardHeader>
              <CardTitle>Explore</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={openExplorer}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Explorer
              </Button>
              {isTestnet && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open("https://faucet.aleo.org/", "_blank")}
                >
                  <Droplets className="w-4 h-4 mr-2" />
                  Aleo Faucet
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Mainnet Notice for Privy */}
          {isPrivyWallet && !isTestnet && (
            <Alert variant="default" className="border-yellow-500/50 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-600 dark:text-yellow-400 text-sm">
                <strong>Mainnet:</strong> To fund your wallet, send Aleo credits from an exchange or another wallet.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
