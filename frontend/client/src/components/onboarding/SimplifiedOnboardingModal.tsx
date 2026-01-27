import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Loader2, Sparkles } from "lucide-react";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import {
  getAllProfiles,
  type ProfileType,
  type ProfileConfig,
} from "@/types/user-preferences";

interface SimplifiedOnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestedProfile: ProfileType | null;
  onCustomize: () => void;
}

export function SimplifiedOnboardingModal({
  open,
  onOpenChange,
  suggestedProfile,
  onCustomize,
}: SimplifiedOnboardingModalProps) {
  const { completeOnboarding } = useUserPreferences();
  const [selectedProfile, setSelectedProfile] = useState<ProfileType | null>(
    suggestedProfile
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profiles = getAllProfiles();

  const handleConfirm = async () => {
    if (!selectedProfile) return;

    setIsSubmitting(true);
    try {
      await completeOnboarding({
        primaryProfile: selectedProfile,
        enabledProfiles: [selectedProfile],
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      setIsSubmitting(false);
    }
  };

  const colorClasses: Record<string, string> = {
    blue: "border-blue-500/30 hover:border-blue-500",
    purple: "border-purple-500/30 hover:border-purple-500",
    green: "border-green-500/30 hover:border-green-500",
    orange: "border-orange-500/30 hover:border-orange-500",
    yellow: "border-yellow-500/30 hover:border-yellow-500",
    cyan: "border-cyan-500/30 hover:border-cyan-500",
  };

  const selectedColorClasses: Record<string, string> = {
    blue: "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20",
    purple: "border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/20",
    green: "border-green-500 bg-green-500/10 ring-2 ring-green-500/20",
    orange: "border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/20",
    yellow: "border-yellow-500 bg-yellow-500/10 ring-2 ring-yellow-500/20",
    cyan: "border-cyan-500 bg-cyan-500/10 ring-2 ring-cyan-500/20",
  };

  const iconColorClasses: Record<string, string> = {
    blue: "text-blue-500",
    purple: "text-purple-500",
    green: "text-green-500",
    orange: "text-orange-500",
    yellow: "text-yellow-500",
    cyan: "text-cyan-500",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Welcome back to AleoPulse!
          </DialogTitle>
          <DialogDescription>
            We detected some activity on your wallet. Select your primary role to
            personalize your experience.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 my-4">
          {profiles.map(({ type, config }) => {
            const isSelected = selectedProfile === type;
            const isSuggested = type === suggestedProfile;
            const Icon = config.icon;

            return (
              <button
                key={type}
                onClick={() => setSelectedProfile(type)}
                className={cn(
                  "relative p-4 rounded-xl border-2 text-left transition-all duration-200",
                  isSelected
                    ? selectedColorClasses[config.color]
                    : colorClasses[config.color]
                )}
              >
                {/* Suggested badge */}
                {isSuggested && (
                  <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    Suggested
                  </div>
                )}

                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  </div>
                )}

                <div className={cn("mb-2", iconColorClasses[config.color])}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-sm">{config.label}</h3>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-end">
          <Button variant="outline" onClick={onCustomize}>
            Customize Further
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedProfile || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Setting up...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
