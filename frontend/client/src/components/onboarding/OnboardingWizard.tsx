import { useState } from "react";
import { OnboardingProgress } from "./OnboardingProgress";
import { StepWelcome } from "./StepWelcome";
import { StepPrimaryGoal } from "./StepPrimaryGoal";
import { StepProfileSetup } from "./StepProfileSetup";
import { StepAdditionalInterests } from "./StepAdditionalInterests";
import { StepConfirmation } from "./StepConfirmation";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import type {
  ProfileType,
  DaoSettings,
  ResearchSettings,
  HrSettings,
  CommunitySettings,
  EarnerSettings,
  DeveloperSettings,
} from "@/types/user-preferences";

interface ProfileSettings {
  daoSettings?: DaoSettings;
  researchSettings?: ResearchSettings;
  hrSettings?: HrSettings;
  communitySettings?: CommunitySettings;
  earnerSettings?: EarnerSettings;
  developerSettings?: DeveloperSettings;
}

const STEPS = [
  { label: "Welcome" },
  { label: "Primary Goal" },
  { label: "Setup" },
  { label: "Interests" },
  { label: "Confirm" },
];

export function OnboardingWizard() {
  const { completeOnboarding } = useUserPreferences();
  const [currentStep, setCurrentStep] = useState(1);
  const [primaryProfile, setPrimaryProfile] = useState<ProfileType | null>(null);
  const [additionalProfiles, setAdditionalProfiles] = useState<ProfileType[]>([]);
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleToggleAdditionalProfile = (profile: ProfileType) => {
    setAdditionalProfiles((prev) =>
      prev.includes(profile)
        ? prev.filter((p) => p !== profile)
        : [...prev, profile]
    );
  };

  const handleConfirm = async () => {
    if (!primaryProfile) return;

    setIsSubmitting(true);
    try {
      await completeOnboarding({
        primaryProfile,
        enabledProfiles: [primaryProfile, ...additionalProfiles],
        ...profileSettings,
      });
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepWelcome onNext={handleNext} />;
      case 2:
        return (
          <StepPrimaryGoal
            selectedProfile={primaryProfile}
            onSelect={setPrimaryProfile}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        if (!primaryProfile) {
          handleBack();
          return null;
        }
        return (
          <StepProfileSetup
            profile={primaryProfile}
            settings={profileSettings}
            onSettingsChange={setProfileSettings}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        if (!primaryProfile) {
          handleBack();
          return null;
        }
        return (
          <StepAdditionalInterests
            primaryProfile={primaryProfile}
            selectedProfiles={additionalProfiles}
            onToggle={handleToggleAdditionalProfile}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
        if (!primaryProfile) {
          handleBack();
          return null;
        }
        return (
          <StepConfirmation
            primaryProfile={primaryProfile}
            additionalProfiles={additionalProfiles}
            isSubmitting={isSubmitting}
            onConfirm={handleConfirm}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress indicator - show for steps 2-5 */}
      {currentStep > 1 && (
        <div className="mb-12">
          <OnboardingProgress
            currentStep={currentStep}
            totalSteps={STEPS.length}
            steps={STEPS}
          />
        </div>
      )}

      {/* Step content */}
      <div className="px-4">{renderStep()}</div>
    </div>
  );
}
