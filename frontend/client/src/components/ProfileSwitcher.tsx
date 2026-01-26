import { useState } from "react";
import { Link } from "wouter";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDown, Check, Settings, Loader2 } from "lucide-react";
import { getProfileConfig, type ProfileType } from "@/types/user-preferences";

export function ProfileSwitcher() {
  const { connected } = useWallet();
  const {
    activeProfile,
    activeProfileConfig,
    isOnboardingComplete,
    getEnabledProfiles,
    switchProfile,
    isLoading,
  } = useUserPreferences();

  const [isSwitching, setIsSwitching] = useState(false);

  // Don't show if not connected or onboarding not complete
  if (!connected || !isOnboardingComplete || isLoading) {
    return null;
  }

  // Don't render if no active profile
  if (!activeProfile || !activeProfileConfig) {
    return null;
  }

  const enabledProfiles = getEnabledProfiles();
  const Icon = activeProfileConfig.icon;

  const handleSwitch = async (profile: ProfileType) => {
    if (profile === activeProfile) return;

    setIsSwitching(true);
    try {
      await switchProfile(profile);
      // Navigate to the new dashboard
      const config = getProfileConfig(profile);
      if (config) {
        window.location.href = config.dashboardPath;
      }
    } catch (error) {
      console.error("Failed to switch profile:", error);
    } finally {
      setIsSwitching(false);
    }
  };

  const colorClasses: Record<string, string> = {
    blue: "text-blue-500",
    purple: "text-purple-500",
    green: "text-green-500",
    orange: "text-orange-500",
    yellow: "text-yellow-500",
    cyan: "text-cyan-500",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 h-9"
          disabled={isSwitching}
        >
          {isSwitching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Icon className={cn("w-4 h-4", colorClasses[activeProfileConfig.color])} />
          )}
          <span className="hidden sm:inline">{activeProfileConfig.label}</span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch Profile</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {enabledProfiles.map((profile) => {
          const config = getProfileConfig(profile);
          const ProfileIcon = config.icon;
          const isActive = profile === activeProfile;

          return (
            <DropdownMenuItem
              key={profile}
              onClick={() => handleSwitch(profile)}
              className="gap-2 cursor-pointer"
            >
              <ProfileIcon className={cn("w-4 h-4", colorClasses[config.color])} />
              <span className="flex-1">{config.label}</span>
              {isActive && <Check className="w-4 h-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings/profile" className="gap-2 cursor-pointer">
            <Settings className="w-4 h-4" />
            Profile Settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
