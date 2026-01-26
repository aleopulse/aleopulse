import { Switch, Route } from "wouter";
import { Layout } from "@/components/Layout";
import { AIChatAssistant } from "@/components/AIChatAssistant";
import { GuidedTour } from "@/components/GuidedTour";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { TourProvider } from "@/contexts/TourContext";
import { GasSponsorshipProvider } from "@/contexts/GasSponsorshipContext";
import { UserPreferencesProvider } from "@/contexts/UserPreferencesContext";
import { OnboardingGuard } from "@/components/OnboardingGuard";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import CreatePoll from "@/pages/CreatePoll";
import PollDetails from "@/pages/PollDetails";
import Admin from "@/pages/Admin";
import Wallet from "@/pages/Wallet";
import Swap from "@/pages/Swap";
import Staking from "@/pages/Staking";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

// Onboarding
import Onboarding from "@/pages/Onboarding";

// Profile settings
import ProfileSettings from "@/pages/ProfileSettings";

// Creator pages
import CreatorDashboard from "@/pages/creator/CreatorDashboard";
import ManagePolls from "@/pages/creator/ManagePolls";
import ManagePoll from "@/pages/creator/ManagePoll";
import Distributions from "@/pages/creator/Distributions";
import QuestManager from "@/pages/creator/QuestManager";
import ManageQuestionnaires from "@/pages/creator/ManageQuestionnaires";
import EditQuestionnaire from "@/pages/creator/EditQuestionnaire";
import SeasonManager from "@/pages/creator/SeasonManager";
import ManageProjects from "@/pages/creator/ManageProjects";

// Project pages
import ProjectDetail from "@/pages/project/ProjectDetail";
import ManageProjectContent from "@/pages/project/ManageProjectContent";

// Participant pages
import ParticipantDashboard from "@/pages/participant/ParticipantDashboard";
import VotingHistory from "@/pages/participant/VotingHistory";
import Rewards from "@/pages/participant/Rewards";
import Quests from "@/pages/participant/Quests";
import Referrals from "@/pages/participant/Referrals";
import Leaderboard from "@/pages/Leaderboard";

// Donor pages
import DonorDashboard from "@/pages/donor/DonorDashboard";
import DonorExplore from "@/pages/donor/Explore";
import DonorFunded from "@/pages/donor/Funded";
import DonorHistory from "@/pages/donor/History";

// Questionnaire pages
import Questionnaires from "@/pages/questionnaire/Questionnaires";
import QuestionnaireDetail from "@/pages/questionnaire/QuestionnaireDetail";
import CreateQuestionnaire from "@/pages/questionnaire/CreateQuestionnaire";

// Profile dashboards
import GovernanceDashboard from "@/pages/dashboard/GovernanceDashboard";
import ResearchDashboard from "@/pages/dashboard/ResearchDashboard";
import HRDashboard from "@/pages/dashboard/HRDashboard";
import DeveloperDashboard from "@/pages/dashboard/DeveloperDashboard";

function App() {
  return (
    <Switch>
      {/* Onboarding route - outside of main layout */}
      <Route path="/onboarding" component={Onboarding} />

      {/* All other routes wrapped in Layout */}
      <Route>
        <SidebarProvider>
          <TourProvider>
            <UserPreferencesProvider>
              <GasSponsorshipProvider>
                <OnboardingGuard>
                  <Layout>
                    <Switch>
                      <Route path="/" component={Home} />
                      <Route path="/dashboard" component={Dashboard} />
                      <Route path="/create" component={CreatePoll} />
                      <Route path="/poll/:id" component={PollDetails} />
                      <Route path="/wallet" component={Wallet} />
                      <Route path="/swap" component={Swap} />
                      <Route path="/staking" component={Staking} />
                      <Route path="/settings" component={Settings} />
                      <Route path="/settings/profile" component={ProfileSettings} />
                      <Route path="/admin" component={Admin} />

                      {/* Profile-specific dashboards */}
                      <Route path="/dashboard/governance" component={GovernanceDashboard} />
                      <Route path="/dashboard/research" component={ResearchDashboard} />
                      <Route path="/dashboard/hr" component={HRDashboard} />
                      <Route path="/dashboard/developer" component={DeveloperDashboard} />

                      {/* Creator routes */}
                      <Route path="/creator" component={CreatorDashboard} />
                      <Route path="/creator/manage/:pollId" component={ManagePoll} />
                      <Route path="/creator/manage" component={ManagePolls} />
                      <Route path="/creator/questionnaires" component={ManageQuestionnaires} />
                      <Route path="/creator/questionnaires/:id" component={EditQuestionnaire} />
                      <Route path="/creator/distributions" component={Distributions} />
                      <Route path="/creator/quests" component={QuestManager} />
                      <Route path="/creator/seasons" component={SeasonManager} />
                      <Route path="/creator/projects" component={ManageProjects} />

                      {/* Project routes */}
                      <Route path="/creator/projects/:id" component={ProjectDetail} />
                      <Route path="/creator/projects/:id/manage" component={ManageProjectContent} />

                      {/* Participant routes */}
                      <Route path="/participant" component={ParticipantDashboard} />
                      <Route path="/participant/quests" component={Quests} />
                      <Route path="/participant/history" component={VotingHistory} />
                      <Route path="/participant/rewards" component={Rewards} />
                      <Route path="/participant/referrals" component={Referrals} />
                      <Route path="/leaderboard" component={Leaderboard} />

                      {/* Donor routes */}
                      <Route path="/donor" component={DonorDashboard} />
                      <Route path="/donor/explore" component={DonorExplore} />
                      <Route path="/donor/funded" component={DonorFunded} />
                      <Route path="/donor/history" component={DonorHistory} />

                      {/* Questionnaire routes */}
                      <Route path="/questionnaires" component={Questionnaires} />
                      <Route path="/questionnaire/create" component={CreateQuestionnaire} />
                      <Route path="/questionnaire/:id" component={QuestionnaireDetail} />

                      <Route component={NotFound} />
                    </Switch>
                    <AIChatAssistant />
                    <GuidedTour />
                  </Layout>
                </OnboardingGuard>
              </GasSponsorshipProvider>
            </UserPreferencesProvider>
          </TourProvider>
        </SidebarProvider>
      </Route>
    </Switch>
  );
}

export default App;
