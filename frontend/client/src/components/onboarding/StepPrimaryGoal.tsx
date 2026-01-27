import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { getAllProfiles, type ProfileType } from "@/types/user-preferences";

interface StepPrimaryGoalProps {
  selectedProfile: ProfileType | null;
  onSelect: (profile: ProfileType) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepPrimaryGoal({
  selectedProfile,
  onSelect,
  onNext,
  onBack,
}: StepPrimaryGoalProps) {
  const profiles = getAllProfiles();

  const colorClasses: Record<string, string> = {
    blue: "border-blue-500/50 bg-blue-500/5 hover:border-blue-500",
    purple: "border-purple-500/50 bg-purple-500/5 hover:border-purple-500",
    green: "border-green-500/50 bg-green-500/5 hover:border-green-500",
    orange: "border-orange-500/50 bg-orange-500/5 hover:border-orange-500",
    yellow: "border-yellow-500/50 bg-yellow-500/5 hover:border-yellow-500",
    cyan: "border-cyan-500/50 bg-cyan-500/5 hover:border-cyan-500",
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
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-display font-bold tracking-tight">
          What brings you to AleoPulse?
        </h2>
        <p className="text-muted-foreground">
          Select your primary role to personalize your experience
        </p>
      </div>

      {/* Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {profiles.map(({ type, config }) => {
          const isSelected = selectedProfile === type;
          const Icon = config.icon;

          return (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className={cn(
                "relative p-6 rounded-xl border-2 text-left transition-all duration-200",
                isSelected
                  ? selectedColorClasses[config.color]
                  : cn(colorClasses[config.color], "hover:scale-[1.02]")
              )}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
              )}

              {/* Icon */}
              <div className={cn("mb-4", iconColorClasses[config.color])}>
                <Icon className="w-8 h-8" />
              </div>

              {/* Content */}
              <h3 className="font-semibold mb-1">{config.label}</h3>
              <p className="text-sm text-muted-foreground">{config.description}</p>

              {/* Features preview */}
              <ul className="mt-4 space-y-1">
                {config.features.slice(0, 2).map((feature, i) => (
                  <li
                    key={i}
                    className="text-xs text-muted-foreground flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                    {feature}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!selectedProfile} className="gap-2">
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
