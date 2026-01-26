import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { useLocation } from "wouter";
import {
  usePreferences,
  useOnboardingStatus,
  useSwitchProfile,
  useCompleteOnboarding,
  useUpdatePreferences,
} from "@/hooks/useUserPreferences";
import type {
  UserPreferences,
  ProfileType,
  OnboardingData,
  ProfileConfig,
} from "@/types/user-preferences";
import { PROFILE_CONFIG, getProfileConfig } from "@/types/user-preferences";

interface UserPreferencesContextType {
  // State
  preferences: UserPreferences | null;
  activeProfile: ProfileType | null;
  activeProfileConfig: ProfileConfig | null;
  isLoading: boolean;
  isOnboardingComplete: boolean;
  hasExistingActivity: boolean;
  suggestedProfile: ProfileType | null;

  // Actions
  switchProfile: (profile: ProfileType) => Promise<void>;
  completeOnboarding: (data: Omit<OnboardingData, "walletAddress">) => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;

  // Helpers
  isProfileEnabled: (profile: ProfileType) => boolean;
  getEnabledProfiles: () => ProfileType[];
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(
  undefined
);

interface UserPreferencesProviderProps {
  children: ReactNode;
}

export function UserPreferencesProvider({ children }: UserPreferencesProviderProps) {
  const { publicKey, connected } = useWallet();
  const [, setLocation] = useLocation();

  // Queries
  const {
    data: preferences,
    isLoading: isLoadingPreferences,
  } = usePreferences(publicKey || undefined);

  const {
    data: onboardingStatus,
    isLoading: isLoadingStatus,
  } = useOnboardingStatus(publicKey || undefined);

  // Mutations
  const switchProfileMutation = useSwitchProfile();
  const completeOnboardingMutation = useCompleteOnboarding();
  const updatePreferencesMutation = useUpdatePreferences();

  // Derived state
  const isLoading = isLoadingPreferences || isLoadingStatus;
  const isOnboardingComplete = preferences?.onboardingCompleted ?? false;
  const activeProfile = (preferences?.activeProfile as ProfileType) || null;
  const activeProfileConfig = activeProfile ? getProfileConfig(activeProfile) : null;
  const hasExistingActivity = onboardingStatus?.hasExistingActivity ?? false;
  const suggestedProfile = onboardingStatus?.suggestedProfile ?? null;

  // Actions
  const switchProfile = async (profile: ProfileType) => {
    if (!publicKey) return;
    await switchProfileMutation.mutateAsync({
      walletAddress: publicKey,
      profile,
    });
  };

  const completeOnboarding = async (data: Omit<OnboardingData, "walletAddress">) => {
    if (!publicKey) return;
    const result = await completeOnboardingMutation.mutateAsync({
      ...data,
      walletAddress: publicKey,
    });
    // Navigate to the appropriate dashboard after completion
    if (result.activeProfile) {
      const config = PROFILE_CONFIG[result.activeProfile as ProfileType];
      if (config) {
        setLocation(config.dashboardPath);
      }
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!publicKey) return;
    await updatePreferencesMutation.mutateAsync({
      address: publicKey,
      updates,
    });
  };

  // Helpers
  const isProfileEnabled = (profile: ProfileType): boolean => {
    return preferences?.enabledProfiles?.includes(profile) ?? false;
  };

  const getEnabledProfiles = (): ProfileType[] => {
    return preferences?.enabledProfiles ?? [];
  };

  const value = useMemo(
    () => ({
      preferences: preferences ?? null,
      activeProfile,
      activeProfileConfig,
      isLoading,
      isOnboardingComplete,
      hasExistingActivity,
      suggestedProfile,
      switchProfile,
      completeOnboarding,
      updatePreferences,
      isProfileEnabled,
      getEnabledProfiles,
    }),
    [
      preferences,
      activeProfile,
      activeProfileConfig,
      isLoading,
      isOnboardingComplete,
      hasExistingActivity,
      suggestedProfile,
      publicKey,
    ]
  );

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences(): UserPreferencesContextType {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error(
      "useUserPreferences must be used within UserPreferencesProvider"
    );
  }
  return context;
}

// Convenience hooks
export function useActiveProfile() {
  const { activeProfile, activeProfileConfig } = useUserPreferences();
  return { profile: activeProfile, config: activeProfileConfig };
}

export function useOnboarding() {
  const {
    isOnboardingComplete,
    hasExistingActivity,
    suggestedProfile,
    completeOnboarding,
    isLoading,
  } = useUserPreferences();
  return {
    isComplete: isOnboardingComplete,
    hasActivity: hasExistingActivity,
    suggested: suggestedProfile,
    complete: completeOnboarding,
    isLoading,
  };
}
