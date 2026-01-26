import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  UserPreferences,
  OnboardingStatus,
  OnboardingData,
  ProfileType,
} from "@/types/user-preferences";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Fetch onboarding status
export function useOnboardingStatus(address: string | undefined) {
  return useQuery<OnboardingStatus>({
    queryKey: ["onboarding-status", address],
    queryFn: async () => {
      if (!address) throw new Error("No address provided");
      const response = await fetch(`/api/user/onboarding/status/${address}`);
      const data: ApiResponse<OnboardingStatus> = await response.json();
      if (!data.success) throw new Error(data.error || "Failed to fetch status");
      return data.data;
    },
    enabled: !!address,
    staleTime: 30000, // 30 seconds
  });
}

// Fetch user preferences
export function usePreferences(address: string | undefined) {
  return useQuery<UserPreferences>({
    queryKey: ["user-preferences", address],
    queryFn: async () => {
      if (!address) throw new Error("No address provided");
      const response = await fetch(`/api/user/preferences/${address}`);
      const data: ApiResponse<UserPreferences> = await response.json();
      if (!data.success) throw new Error(data.error || "Failed to fetch preferences");
      return data.data;
    },
    enabled: !!address,
    staleTime: 60000, // 1 minute
  });
}

// Update user preferences
export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      address,
      updates,
    }: {
      address: string;
      updates: Partial<UserPreferences>;
    }) => {
      const response = await fetch(`/api/user/preferences/${address}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data: ApiResponse<UserPreferences> = await response.json();
      if (!data.success) throw new Error(data.error || "Failed to update preferences");
      return data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["user-preferences", variables.address], data);
    },
  });
}

// Complete onboarding
export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OnboardingData) => {
      const response = await fetch("/api/user/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result: ApiResponse<UserPreferences> = await response.json();
      if (!result.success) throw new Error(result.error || "Failed to complete onboarding");
      return result.data;
    },
    onSuccess: (data, variables) => {
      // Update preferences cache
      queryClient.setQueryData(["user-preferences", variables.walletAddress], data);
      // Invalidate onboarding status
      queryClient.invalidateQueries({
        queryKey: ["onboarding-status", variables.walletAddress],
      });
    },
  });
}

// Switch active profile
export function useSwitchProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      walletAddress,
      profile,
    }: {
      walletAddress: string;
      profile: ProfileType;
    }) => {
      const response = await fetch("/api/user/switch-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, profile }),
      });
      const data: ApiResponse<UserPreferences> = await response.json();
      if (!data.success) throw new Error(data.error || "Failed to switch profile");
      return data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["user-preferences", variables.walletAddress], data);
    },
  });
}
