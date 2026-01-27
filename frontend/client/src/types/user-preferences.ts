import type { LucideIcon } from "lucide-react";
import {
  Building2,
  PieChart,
  Users,
  Megaphone,
  Coins,
  Code,
} from "lucide-react";

export type ProfileType =
  | "dao_governance"
  | "market_researcher"
  | "hr_professional"
  | "community_builder"
  | "survey_earner"
  | "developer";

export interface ProfileConfig {
  label: string;
  icon: LucideIcon;
  description: string;
  dashboardPath: string;
  color: string;
  features: string[];
}

export const PROFILE_CONFIG: Record<ProfileType, ProfileConfig> = {
  dao_governance: {
    label: "DAO Governance",
    icon: Building2,
    description: "Run governance votes for DAOs and protocols",
    dashboardPath: "/dashboard/governance",
    color: "blue",
    features: [
      "Create governance proposals",
      "Token-weighted voting",
      "Delegation management",
      "Quorum tracking",
    ],
  },
  market_researcher: {
    label: "Market Researcher",
    icon: PieChart,
    description: "Conduct surveys and gather market insights",
    dashboardPath: "/dashboard/research",
    color: "purple",
    features: [
      "Create research panels",
      "Quality response filters",
      "Data export tools",
      "Response analytics",
    ],
  },
  hr_professional: {
    label: "HR Professional",
    icon: Users,
    description: "Run employee feedback and HR surveys",
    dashboardPath: "/dashboard/hr",
    color: "green",
    features: [
      "Anonymous feedback",
      "Department segmentation",
      "Compliance mode",
      "Trend analysis",
    ],
  },
  community_builder: {
    label: "Community Builder",
    icon: Megaphone,
    description: "Create polls, quests, and engage your community",
    dashboardPath: "/creator",
    color: "orange",
    features: [
      "Create engaging polls",
      "Quest campaigns",
      "Reward distribution",
      "Community analytics",
    ],
  },
  survey_earner: {
    label: "Survey Earner",
    icon: Coins,
    description: "Earn rewards by participating in surveys",
    dashboardPath: "/participant",
    color: "yellow",
    features: [
      "Browse available surveys",
      "Earn PULSE tokens",
      "Track your earnings",
      "Complete quests",
    ],
  },
  developer: {
    label: "Developer",
    icon: Code,
    description: "Integrate AleoPulse into your applications",
    dashboardPath: "/dashboard/developer",
    color: "cyan",
    features: [
      "API key management",
      "Webhook configuration",
      "SDK documentation",
      "Usage analytics",
    ],
  },
};

export interface DaoSettings {
  defaultVotingPeriod?: number;
  requireQuorum?: boolean;
  delegationEnabled?: boolean;
}

export interface ResearchSettings {
  preferredPanelSize?: number;
  qualityThreshold?: number;
  autoRewardEnabled?: boolean;
}

export interface HrSettings {
  anonymityLevel?: "full" | "partial" | "none";
  departmentTracking?: boolean;
  complianceMode?: boolean;
}

export interface CommunitySettings {
  questsEnabled?: boolean;
  rewardsEnabled?: boolean;
  autoDistribute?: boolean;
}

export interface EarnerSettings {
  preferredCategories?: string[];
  notificationsEnabled?: boolean;
  minimumReward?: number;
}

export interface DeveloperSettings {
  apiKeyEnabled?: boolean;
  webhooksEnabled?: boolean;
  sandboxMode?: boolean;
}

export interface UserPreferences {
  id?: string;
  walletAddress: string;
  onboardingCompleted: boolean;
  onboardingCompletedAt?: string | null;
  primaryProfile: ProfileType | null;
  activeProfile: ProfileType | null;
  enabledProfiles: ProfileType[];
  daoSettings?: DaoSettings | null;
  researchSettings?: ResearchSettings | null;
  hrSettings?: HrSettings | null;
  communitySettings?: CommunitySettings | null;
  earnerSettings?: EarnerSettings | null;
  developerSettings?: DeveloperSettings | null;
  theme?: string;
  compactMode?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OnboardingStatus {
  onboardingCompleted: boolean;
  onboardingCompletedAt: string | null;
  hasExistingActivity: boolean;
  suggestedProfile: ProfileType | null;
}

export interface OnboardingData {
  walletAddress: string;
  primaryProfile: ProfileType;
  enabledProfiles: ProfileType[];
  daoSettings?: DaoSettings;
  researchSettings?: ResearchSettings;
  hrSettings?: HrSettings;
  communitySettings?: CommunitySettings;
  earnerSettings?: EarnerSettings;
  developerSettings?: DeveloperSettings;
}

// Helper to get profile config
export function getProfileConfig(profile: ProfileType): ProfileConfig {
  return PROFILE_CONFIG[profile];
}

// Helper to get all profiles as array
export function getAllProfiles(): Array<{ type: ProfileType; config: ProfileConfig }> {
  return Object.entries(PROFILE_CONFIG).map(([type, config]) => ({
    type: type as ProfileType,
    config,
  }));
}
