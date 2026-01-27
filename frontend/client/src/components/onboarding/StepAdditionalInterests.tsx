import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getAllProfiles, type ProfileType } from "@/types/user-preferences";

interface StepAdditionalInterestsProps {
  primaryProfile: ProfileType;
  selectedProfiles: ProfileType[];
  onToggle: (profile: ProfileType) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepAdditionalInterests({
  primaryProfile,
  selectedProfiles,
  onToggle,
  onNext,
  onBack,
}: StepAdditionalInterestsProps) {
  const profiles = getAllProfiles().filter(({ type }) => type !== primaryProfile);

  const colorClasses: Record<string, string> = {
    blue: "border-blue-500/30 hover:border-blue-500/50",
    purple: "border-purple-500/30 hover:border-purple-500/50",
    green: "border-green-500/30 hover:border-green-500/50",
    orange: "border-orange-500/30 hover:border-orange-500/50",
    yellow: "border-yellow-500/30 hover:border-yellow-500/50",
    cyan: "border-cyan-500/30 hover:border-cyan-500/50",
  };

  const selectedColorClasses: Record<string, string> = {
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
        <h2 className="text-3xl font-display font-bold tracking-tight">
          Any other interests?
        </h2>
        <p className="text-muted-foreground">
          Select additional profiles to unlock more features (optional)
        </p>
      </div>

      {/* Profile Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {profiles.map(({ type, config }) => {
          const isSelected = selectedProfiles.includes(type);
          const Icon = config.icon;

          return (
            <button
              key={type}
              onClick={() => onToggle(type)}
              className={cn(
                "relative p-4 rounded-xl border-2 text-left transition-all duration-200",
                isSelected ? selectedColorClasses[config.color] : colorClasses[config.color]
              )}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <Checkbox
                  checked={isSelected}
                  className="mt-1"
                  onCheckedChange={() => onToggle(type)}
                />

                {/* Icon */}
                <div className={cn("shrink-0", iconColorClasses[config.color])}>
                  <Icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{config.label}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {config.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected count */}
      {selectedProfiles.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          {selectedProfiles.length} additional profile
          {selectedProfiles.length === 1 ? "" : "s"} selected
        </p>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onNext}>
            Skip
          </Button>
          <Button onClick={onNext} className="gap-2">
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
