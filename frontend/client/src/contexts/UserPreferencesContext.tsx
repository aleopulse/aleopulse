import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react";
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
  const { address, connected } = useWallet();
  const [, setLocation] = useLocation();

  // Queries
  const {
    data: preferences,
    isLoading: isLoadingPreferences,
  } = usePreferences(address || undefined);

  const {
    data: onboardingStatus,
    isLoading: isLoadingStatus,
  } = useOnboardingStatus(address || undefined);

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
    if (!address) return;
    await switchProfileMutation.mutateAsync({
      walletAddress: address,
      profile,
    });
  };

  const completeOnboarding = async (data: Omit<OnboardingData, "walletAddress">) => {
    if (!address) return;
    const result = await completeOnboardingMutation.mutateAsync({
      ...data,
      walletAddress: address,
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
    if (!address) return;
    await updatePreferencesMutation.mutateAsync({
      address: address,
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
      address,
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
