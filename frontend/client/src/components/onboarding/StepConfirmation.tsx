import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check, Loader2, Sparkles } from "lucide-react";
import { getProfileConfig, type ProfileType } from "@/types/user-preferences";

interface StepConfirmationProps {
  primaryProfile: ProfileType;
  additionalProfiles: ProfileType[];
  isSubmitting: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

export function StepConfirmation({
  primaryProfile,
  additionalProfiles,
  isSubmitting,
  onConfirm,
  onBack,
}: StepConfirmationProps) {
  const primaryConfig = getProfileConfig(primaryProfile);
  const PrimaryIcon = primaryConfig.icon;

  const colorClasses: Record<string, string> = {
    blue: "border-blue-500 bg-blue-500/10",
    purple: "border-purple-500 bg-purple-500/10",
    green: "border-green-500 bg-green-500/10",
    orange: "border-orange-500 bg-orange-500/10",
    yellow: "border-yellow-500 bg-yellow-500/10",
    cyan: "border-cyan-500 bg-cyan-500/10",
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
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl font-display font-bold tracking-tight">
          You're all set!
        </h2>
        <p className="text-muted-foreground">
          Review your selections and get started
        </p>
      </div>

      {/* Summary */}
      <div className="max-w-md mx-auto space-y-6">
        {/* Primary Profile */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Primary Profile
          </h3>
          <div
            className={cn(
              "p-4 rounded-xl border-2",
              colorClasses[primaryConfig.color]
            )}
          >
            <div className="flex items-center gap-4">
              <div className={iconColorClasses[primaryConfig.color]}>
                <PrimaryIcon className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-semibold">{primaryConfig.label}</h4>
                <p className="text-sm text-muted-foreground">
                  {primaryConfig.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Profiles */}
        {additionalProfiles.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Additional Profiles
            </h3>
            <div className="space-y-2">
              {additionalProfiles.map((profile) => {
                const config = getProfileConfig(profile);
                const Icon = config.icon;
                return (
                  <div
                    key={profile}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className={iconColorClasses[config.color]}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{config.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* What's next */}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Check className="w-5 h-5 text-primary" />
            What's next?
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <span>Access your personalized {primaryConfig.label} dashboard</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <span>Switch between profiles anytime using the profile menu</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <span>
                Start {primaryProfile === "survey_earner" ? "earning" : "creating"} with AleoPulse
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack} disabled={isSubmitting} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button onClick={onConfirm} disabled={isSubmitting} size="lg" className="gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Setting up...
            </>
          ) : (
            <>
              Get Started
              <Sparkles className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
