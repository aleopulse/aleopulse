import { useState } from "react";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { cn } from "@/lib/utils";
import { getSidebarSections } from "@/lib/sidebar-config";
import {
  getAllProfiles,
  getProfileConfig,
  type ProfileType,
} from "@/types/user-preferences";
import {
  Check,
  Loader2,
  Star,
  RefreshCw,
  Settings,
} from "lucide-react";

export default function ProfileSettings() {
  const { connected } = useWallet();
  const { isCollapsed } = useSidebar();
  const {
    preferences,
    activeProfile,
    isLoading,
    updatePreferences,
    switchProfile,
  } = useUserPreferences();

  const [isSaving, setIsSaving] = useState(false);
  const [localEnabledProfiles, setLocalEnabledProfiles] = useState<ProfileType[]>(
    preferences?.enabledProfiles || []
  );
  const [localPrimaryProfile, setLocalPrimaryProfile] = useState<ProfileType | null>(
    (preferences?.primaryProfile as ProfileType) || null
  );

  const profiles = getAllProfiles();
  const sidebarSections = activeProfile
    ? getSidebarSections(activeProfile)
    : getSidebarSections("community_builder");

  const colorClasses: Record<string, string> = {
    blue: "border-blue-500/50 bg-blue-500/5",
    purple: "border-purple-500/50 bg-purple-500/5",
    green: "border-green-500/50 bg-green-500/5",
    orange: "border-orange-500/50 bg-orange-500/5",
    yellow: "border-yellow-500/50 bg-yellow-500/5",
    cyan: "border-cyan-500/50 bg-cyan-500/5",
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

  const handleToggleProfile = (profile: ProfileType) => {
    if (profile === localPrimaryProfile) {
      return; // Can't disable primary profile
    }
    setLocalEnabledProfiles((prev) =>
      prev.includes(profile)
        ? prev.filter((p) => p !== profile)
        : [...prev, profile]
    );
  };

  const handleSetPrimary = (profile: ProfileType) => {
    setLocalPrimaryProfile(profile);
    if (!localEnabledProfiles.includes(profile)) {
      setLocalEnabledProfiles([...localEnabledProfiles, profile]);
    }
  };

  const handleSave = async () => {
    if (!localPrimaryProfile) return;

    setIsSaving(true);
    try {
      await updatePreferences({
        primaryProfile: localPrimaryProfile,
        enabledProfiles: localEnabledProfiles,
      });
    } catch (error) {
      console.error("Failed to save profile settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    localPrimaryProfile !== preferences?.primaryProfile ||
    JSON.stringify([...localEnabledProfiles].sort()) !==
      JSON.stringify([...(preferences?.enabledProfiles || [])].sort());

  if (!connected) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground">
              Please connect your wallet to access profile settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <DashboardSidebar sections={sidebarSections} />

      <div
        className={cn(
          "transition-all duration-300",
          isCollapsed ? "md:ml-[72px]" : "md:ml-64"
        )}
      >
        <div className="container max-w-4xl mx-auto px-4 py-6 md:py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold tracking-tight">
              Profile Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your profiles and switch between different roles
            </p>
          </div>

          {/* Active Profile */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Active Profile</CardTitle>
              <CardDescription>
                Your currently active profile determines your dashboard and sidebar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeProfile && (
                <div className="flex items-center gap-4">
                  {(() => {
                    const config = getProfileConfig(activeProfile);
                    const Icon = config.icon;
                    return (
                      <>
                        <div
                          className={cn(
                            "p-3 rounded-xl",
                            selectedColorClasses[config.color]
                          )}
                        >
                          <Icon
                            className={cn("w-8 h-8", iconColorClasses[config.color])}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{config.label}</h3>
                          <p className="text-sm text-muted-foreground">
                            {config.description}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Primary Profile Selection */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Primary Profile</CardTitle>
              <CardDescription>
                Your primary profile is your default dashboard when you log in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profiles.map(({ type, config }) => {
                  const isPrimary = localPrimaryProfile === type;
                  const Icon = config.icon;

                  return (
                    <button
                      key={type}
                      onClick={() => handleSetPrimary(type)}
                      className={cn(
                        "relative p-4 rounded-xl border-2 text-left transition-all duration-200",
                        isPrimary
                          ? selectedColorClasses[config.color]
                          : cn(colorClasses[config.color], "hover:scale-[1.02]")
                      )}
                    >
                      {isPrimary && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-primary gap-1">
                            <Star className="w-3 h-3" /> Primary
                          </Badge>
                        </div>
                      )}

                      <div className={cn("mb-3", iconColorClasses[config.color])}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold text-sm">{config.label}</h3>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Enabled Profiles */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Enabled Profiles</CardTitle>
              <CardDescription>
                Select which profiles you want to have access to. You can switch
                between enabled profiles using the profile switcher.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profiles.map(({ type, config }) => {
                  const isEnabled = localEnabledProfiles.includes(type);
                  const isPrimary = localPrimaryProfile === type;
                  const Icon = config.icon;

                  return (
                    <div
                      key={type}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border",
                        isEnabled ? "bg-muted/50" : "opacity-60"
                      )}
                    >
                      <Checkbox
                        id={type}
                        checked={isEnabled}
                        disabled={isPrimary}
                        onCheckedChange={() => handleToggleProfile(type)}
                      />
                      <div className={iconColorClasses[config.color]}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={type} className="font-medium cursor-pointer">
                          {config.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {config.description}
                        </p>
                      </div>
                      {isPrimary && (
                        <Badge variant="outline">Primary</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Save / Reset Actions */}
          <div className="flex items-center justify-between">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Re-run Onboarding
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Re-run Onboarding?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will take you through the full onboarding process again.
                    Your current profile settings will be replaced with your new
                    selections.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      window.location.href = "/onboarding";
                    }}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
