import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { useOnboardingStatus } from "@/hooks/useUserPreferences";
import { SimplifiedOnboardingModal } from "@/components/onboarding/SimplifiedOnboardingModal";
import { Loader2 } from "lucide-react";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { publicKey, connected } = useWallet();
  const { data: status, isLoading } = useOnboardingStatus(publicKey || undefined);
  const [, setLocation] = useLocation();
  const [showSimplifiedModal, setShowSimplifiedModal] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Only check once per wallet connection
    if (!connected || isLoading || hasChecked) {
      return;
    }

    setHasChecked(true);

    if (status && !status.onboardingCompleted) {
      // User has existing activity - show simplified modal
      if (status.hasExistingActivity) {
        setShowSimplifiedModal(true);
      } else {
        // New user - redirect to full onboarding
        setLocation("/onboarding");
      }
    }
  }, [connected, isLoading, status, hasChecked, setLocation]);

  // Reset check when wallet changes
  useEffect(() => {
    setHasChecked(false);
    setShowSimplifiedModal(false);
  }, [publicKey]);

  const handleCustomize = () => {
    setShowSimplifiedModal(false);
    setLocation("/onboarding");
  };

  // Show loading state briefly while checking
  if (connected && isLoading && !hasChecked) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {children}
      <SimplifiedOnboardingModal
        open={showSimplifiedModal}
        onOpenChange={setShowSimplifiedModal}
        suggestedProfile={status?.suggestedProfile || null}
        onCustomize={handleCustomize}
      />
    </>
  );
}
