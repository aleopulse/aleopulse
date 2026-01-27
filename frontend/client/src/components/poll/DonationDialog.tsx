/**
 * DonationDialog Component
 * Privacy-preserving donation dialog with public, anonymous, and semi-anonymous options
 */

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Heart,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  Info,
} from "lucide-react";
import { DONATION_PRIVACY, DONATION_PRIVACY_NAMES, type DonationPrivacyMode } from "@/types/poll";
import { PLATFORM_FEE_BPS, calculatePlatformFee, calculateNetAmount } from "@/types/poll";
import { getCoinSymbol, type CoinTypeId } from "@/lib/tokens";

interface DonationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pollId: number;
  pollTitle: string;
  currentRewardPool: number;  // In octas
  totalVoters: number;
  coinTypeId: CoinTypeId;
  onDonate: (amount: number, privacyMode: DonationPrivacyMode) => Promise<void>;
  isLoading?: boolean;
}

const PRIVACY_DESCRIPTIONS: Record<DonationPrivacyMode, { title: string; description: string; icon: React.ReactNode }> = {
  [DONATION_PRIVACY.PUBLIC]: {
    title: "Public",
    description: "Your wallet address and donation amount are publicly visible. Great for building reputation and recognition.",
    icon: <Eye className="w-4 h-4" />,
  },
  [DONATION_PRIVACY.ANONYMOUS]: {
    title: "Anonymous",
    description: "Your identity is completely hidden. Only the aggregate donation total is visible. You'll receive a private proof of donation.",
    icon: <EyeOff className="w-4 h-4" />,
  },
  [DONATION_PRIVACY.SEMI_ANONYMOUS]: {
    title: "Semi-Anonymous",
    description: "Initially anonymous, but you can choose to reveal your identity later. Useful for surprise donations or delayed recognition.",
    icon: <ShieldCheck className="w-4 h-4" />,
  },
};

export function DonationDialog({
  open,
  onOpenChange,
  pollId,
  pollTitle,
  currentRewardPool,
  totalVoters,
  coinTypeId,
  onDonate,
  isLoading = false,
}: DonationDialogProps) {
  const [amount, setAmount] = useState("");
  const [privacyMode, setPrivacyMode] = useState<DonationPrivacyMode>(DONATION_PRIVACY.PUBLIC);

  const coinSymbol = getCoinSymbol(coinTypeId);

  // Calculate fees
  const { grossAmount, fee, netAmount } = useMemo(() => {
    const gross = parseFloat(amount) * 1e8 || 0;
    return {
      grossAmount: gross,
      fee: calculatePlatformFee(gross),
      netAmount: calculateNetAmount(gross),
    };
  }, [amount]);

  const handleSubmit = async () => {
    if (!amount || grossAmount <= 0) return;
    await onDonate(grossAmount, privacyMode);
    setAmount("");
    setPrivacyMode(DONATION_PRIVACY.PUBLIC);
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
      setAmount("");
      setPrivacyMode(DONATION_PRIVACY.PUBLIC);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Fund Poll
          </DialogTitle>
          <DialogDescription>
            Contribute to "{pollTitle}" reward pool. Your contribution will be distributed to voters.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Stats */}
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Current Reward Pool</span>
              <span className="font-mono font-semibold">
                {(currentRewardPool / 1e8).toFixed(4)} {coinSymbol}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current Voters</span>
              <span className="font-mono">{totalVoters}</span>
            </div>
          </div>

          {/* Privacy Mode Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Privacy Mode</Label>
            <RadioGroup
              value={String(privacyMode)}
              onValueChange={(value) => setPrivacyMode(Number(value) as DonationPrivacyMode)}
              className="space-y-3"
            >
              {Object.entries(PRIVACY_DESCRIPTIONS).map(([mode, info]) => (
                <label
                  key={mode}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    privacyMode === Number(mode)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  <RadioGroupItem value={mode} className="mt-1" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 font-medium">
                      {info.icon}
                      {info.title}
                    </div>
                    <p className="text-sm text-muted-foreground">{info.description}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="donationAmount">Amount ({coinSymbol})</Label>
            <Input
              id="donationAmount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              disabled={isLoading}
            />

            {/* Fee Breakdown */}
            {grossAmount > 0 && (
              <div className="mt-3 p-3 rounded-lg bg-muted/30 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Donation Amount</span>
                  <span className="font-mono">{(grossAmount / 1e8).toFixed(4)} {coinSymbol}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Platform Fee ({PLATFORM_FEE_BPS / 100}%)</span>
                  <span className="font-mono">-{(fee / 1e8).toFixed(4)} {coinSymbol}</span>
                </div>
                <div className="border-t border-border pt-1.5 flex justify-between font-medium">
                  <span>Net Contribution</span>
                  <span className="font-mono text-primary">{(netAmount / 1e8).toFixed(4)} {coinSymbol}</span>
                </div>
              </div>
            )}
          </div>

          {/* Privacy Mode Warnings */}
          {privacyMode !== DONATION_PRIVACY.PUBLIC && (
            <Alert variant="default" className="border-yellow-500/50 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-600 dark:text-yellow-400 ml-2">
                {privacyMode === DONATION_PRIVACY.ANONYMOUS ? (
                  <>
                    <strong>Important:</strong> Your donation proof will be stored locally in your browser.
                    Keep this device or export your proof if you need to verify your donation later for tax or other purposes.
                  </>
                ) : (
                  <>
                    <strong>Important:</strong> A private receipt will be created in your wallet.
                    You'll need this receipt to reveal your identity later. Do not spend or transfer this record.
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          {privacyMode === DONATION_PRIVACY.PUBLIC && (
            <Alert variant="default" className="border-blue-500/30 bg-blue-500/5">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-muted-foreground ml-2">
                Your wallet address will be publicly listed as a donor for this poll.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !amount || grossAmount <= 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Donating...
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 mr-2" />
                Donate {privacyMode === DONATION_PRIVACY.PUBLIC ? "Publicly" : "Anonymously"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
