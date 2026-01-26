import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  type ProfileType,
  type DaoSettings,
  type ResearchSettings,
  type HrSettings,
  type CommunitySettings,
  type EarnerSettings,
  type DeveloperSettings,
  getProfileConfig,
} from "@/types/user-preferences";

interface ProfileSettings {
  daoSettings?: DaoSettings;
  researchSettings?: ResearchSettings;
  hrSettings?: HrSettings;
  communitySettings?: CommunitySettings;
  earnerSettings?: EarnerSettings;
  developerSettings?: DeveloperSettings;
}

interface StepProfileSetupProps {
  profile: ProfileType;
  settings: ProfileSettings;
  onSettingsChange: (settings: ProfileSettings) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepProfileSetup({
  profile,
  settings,
  onSettingsChange,
  onNext,
  onBack,
}: StepProfileSetupProps) {
  const config = getProfileConfig(profile);
  const Icon = config.icon;

  const renderDaoSettings = () => {
    const daoSettings = settings.daoSettings || {};
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="delegation">Enable Delegation</Label>
            <p className="text-sm text-muted-foreground">
              Allow token holders to delegate their voting power
            </p>
          </div>
          <Switch
            id="delegation"
            checked={daoSettings.delegationEnabled ?? true}
            onCheckedChange={(checked) =>
              onSettingsChange({
                ...settings,
                daoSettings: { ...daoSettings, delegationEnabled: checked },
              })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="quorum">Require Quorum</Label>
            <p className="text-sm text-muted-foreground">
              Proposals need minimum participation to pass
            </p>
          </div>
          <Switch
            id="quorum"
            checked={daoSettings.requireQuorum ?? true}
            onCheckedChange={(checked) =>
              onSettingsChange({
                ...settings,
                daoSettings: { ...daoSettings, requireQuorum: checked },
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Default Voting Period (hours)</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[daoSettings.defaultVotingPeriod ?? 72]}
              onValueChange={([value]) =>
                onSettingsChange({
                  ...settings,
                  daoSettings: { ...daoSettings, defaultVotingPeriod: value },
                })
              }
              min={24}
              max={168}
              step={24}
              className="flex-1"
            />
            <span className="text-sm font-medium w-16 text-right">
              {daoSettings.defaultVotingPeriod ?? 72}h
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderResearchSettings = () => {
    const researchSettings = settings.researchSettings || {};
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Preferred Panel Size</Label>
          <Select
            value={String(researchSettings.preferredPanelSize ?? 100)}
            onValueChange={(value) =>
              onSettingsChange({
                ...settings,
                researchSettings: {
                  ...researchSettings,
                  preferredPanelSize: parseInt(value),
                },
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select panel size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">Small (50 respondents)</SelectItem>
              <SelectItem value="100">Medium (100 respondents)</SelectItem>
              <SelectItem value="500">Large (500 respondents)</SelectItem>
              <SelectItem value="1000">Enterprise (1000+ respondents)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="autoReward">Auto-Reward Participants</Label>
            <p className="text-sm text-muted-foreground">
              Automatically distribute rewards on survey completion
            </p>
          </div>
          <Switch
            id="autoReward"
            checked={researchSettings.autoRewardEnabled ?? true}
            onCheckedChange={(checked) =>
              onSettingsChange({
                ...settings,
                researchSettings: { ...researchSettings, autoRewardEnabled: checked },
              })
            }
          />
        </div>
      </div>
    );
  };

  const renderHrSettings = () => {
    const hrSettings = settings.hrSettings || {};
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Anonymity Level</Label>
          <Select
            value={hrSettings.anonymityLevel ?? "full"}
            onValueChange={(value) =>
              onSettingsChange({
                ...settings,
                hrSettings: {
                  ...hrSettings,
                  anonymityLevel: value as "full" | "partial" | "none",
                },
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select anonymity level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full Anonymity</SelectItem>
              <SelectItem value="partial">Department Only</SelectItem>
              <SelectItem value="none">Identified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="compliance">Compliance Mode</Label>
            <p className="text-sm text-muted-foreground">
              Enable audit trails and compliance reporting
            </p>
          </div>
          <Switch
            id="compliance"
            checked={hrSettings.complianceMode ?? false}
            onCheckedChange={(checked) =>
              onSettingsChange({
                ...settings,
                hrSettings: { ...hrSettings, complianceMode: checked },
              })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="deptTracking">Department Tracking</Label>
            <p className="text-sm text-muted-foreground">
              Track responses by department for trend analysis
            </p>
          </div>
          <Switch
            id="deptTracking"
            checked={hrSettings.departmentTracking ?? true}
            onCheckedChange={(checked) =>
              onSettingsChange({
                ...settings,
                hrSettings: { ...hrSettings, departmentTracking: checked },
              })
            }
          />
        </div>
      </div>
    );
  };

  const renderCommunitySettings = () => {
    const communitySettings = settings.communitySettings || {};
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="quests">Enable Quests</Label>
            <p className="text-sm text-muted-foreground">
              Create quest campaigns to boost engagement
            </p>
          </div>
          <Switch
            id="quests"
            checked={communitySettings.questsEnabled ?? true}
            onCheckedChange={(checked) =>
              onSettingsChange({
                ...settings,
                communitySettings: { ...communitySettings, questsEnabled: checked },
              })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="rewards">Enable Rewards</Label>
            <p className="text-sm text-muted-foreground">
              Reward participants with PULSE tokens
            </p>
          </div>
          <Switch
            id="rewards"
            checked={communitySettings.rewardsEnabled ?? true}
            onCheckedChange={(checked) =>
              onSettingsChange({
                ...settings,
                communitySettings: { ...communitySettings, rewardsEnabled: checked },
              })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="autoDistribute">Auto-Distribute</Label>
            <p className="text-sm text-muted-foreground">
              Automatically distribute rewards when polls end
            </p>
          </div>
          <Switch
            id="autoDistribute"
            checked={communitySettings.autoDistribute ?? false}
            onCheckedChange={(checked) =>
              onSettingsChange({
                ...settings,
                communitySettings: { ...communitySettings, autoDistribute: checked },
              })
            }
          />
        </div>
      </div>
    );
  };

  const renderEarnerSettings = () => {
    const earnerSettings = settings.earnerSettings || {};
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications">Survey Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when new surveys match your interests
            </p>
          </div>
          <Switch
            id="notifications"
            checked={earnerSettings.notificationsEnabled ?? true}
            onCheckedChange={(checked) =>
              onSettingsChange({
                ...settings,
                earnerSettings: { ...earnerSettings, notificationsEnabled: checked },
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Minimum Reward Filter (PULSE)</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[earnerSettings.minimumReward ?? 0]}
              onValueChange={([value]) =>
                onSettingsChange({
                  ...settings,
                  earnerSettings: { ...earnerSettings, minimumReward: value },
                })
              }
              min={0}
              max={100}
              step={10}
              className="flex-1"
            />
            <span className="text-sm font-medium w-16 text-right">
              {earnerSettings.minimumReward ?? 0}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Only show surveys with at least this reward amount
          </p>
        </div>
      </div>
    );
  };

  const renderDeveloperSettings = () => {
    const developerSettings = settings.developerSettings || {};
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sandbox">Sandbox Mode</Label>
            <p className="text-sm text-muted-foreground">
              Start with testnet integration for development
            </p>
          </div>
          <Switch
            id="sandbox"
            checked={developerSettings.sandboxMode ?? true}
            onCheckedChange={(checked) =>
              onSettingsChange({
                ...settings,
                developerSettings: { ...developerSettings, sandboxMode: checked },
              })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="webhooks">Enable Webhooks</Label>
            <p className="text-sm text-muted-foreground">
              Receive real-time updates via webhook callbacks
            </p>
          </div>
          <Switch
            id="webhooks"
            checked={developerSettings.webhooksEnabled ?? false}
            onCheckedChange={(checked) =>
              onSettingsChange({
                ...settings,
                developerSettings: { ...developerSettings, webhooksEnabled: checked },
              })
            }
          />
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    switch (profile) {
      case "dao_governance":
        return renderDaoSettings();
      case "market_researcher":
        return renderResearchSettings();
      case "hr_professional":
        return renderHrSettings();
      case "community_builder":
        return renderCommunitySettings();
      case "survey_earner":
        return renderEarnerSettings();
      case "developer":
        return renderDeveloperSettings();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl font-display font-bold tracking-tight">
          Configure Your {config.label} Profile
        </h2>
        <p className="text-muted-foreground">
          Customize your settings to get the most out of AleoPulse
        </p>
      </div>

      {/* Settings Form */}
      <div className="max-w-lg mx-auto p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
        {renderSettings()}
      </div>

      {/* Skip hint */}
      <p className="text-center text-sm text-muted-foreground">
        You can always change these settings later in your profile
      </p>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button onClick={onNext} className="gap-2">
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
