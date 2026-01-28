import { useEffect } from "react";
import { useLocation } from "wouter";
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { UserPreferencesProvider, useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Loader2 } from "lucide-react";

function OnboardingContent() {
  const { connected } = useWallet();
  const { isOnboardingComplete, isLoading } = useUserPreferences();
  const [, setLocation] = useLocation();

  // Redirect if not connected
  useEffect(() => {
    if (!connected) {
      setLocation("/");
    }
  }, [connected, setLocation]);

  // Redirect if already completed onboarding
  useEffect(() => {
    if (!isLoading && isOnboardingComplete) {
      setLocation("/");
    }
  }, [isLoading, isOnboardingComplete, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <OnboardingWizard />;
}

export default function Onboarding() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px] animate-pulse delay-1000" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Logo in top left */}
      <div className="fixed top-6 left-6 z-50">
        <a href="/" className="flex items-center gap-2 font-display font-bold text-xl tracking-tighter hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            AleoPulse
          </span>
        </a>
      </div>

      {/* Main content */}
      <main className="min-h-screen flex items-center justify-center py-16 px-4">
        <UserPreferencesProvider>
          <OnboardingContent />
        </UserPreferencesProvider>
      </main>
    </div>
  );
}
