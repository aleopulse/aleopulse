import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  PieChart,
  UserCheck,
  BarChart3,
  Shield,
  Building,
  ClipboardList,
  TrendingUp,
  Megaphone,
  Send,
  ListChecks,
  Calendar,
  FolderKanban,
  PlusCircle,
  Vote,
  Gift,
  Flame,
  Trophy,
  Share2,
  Code,
  Key,
  Webhook,
  BookOpen,
  TestTube,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import type { ProfileType } from "@/types/user-preferences";
import type { SidebarSection } from "@/components/DashboardSidebar";

export function getSidebarSections(profile: ProfileType): SidebarSection[] {
  switch (profile) {
    case "dao_governance":
      return [
        {
          title: "Governance",
          items: [
            { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/governance" },
            { label: "Proposals", icon: FileText, href: "/dashboard/governance/proposals" },
            { label: "Delegation", icon: Users, href: "/dashboard/governance/delegation" },
            { label: "Voting Power", icon: Shield, href: "/dashboard/governance/voting-power" },
          ],
        },
        {
          title: "Create",
          items: [
            { label: "New Proposal", icon: PlusCircle, href: "/create" },
            { label: "Projects", icon: FolderKanban, href: "/creator/projects" },
          ],
        },
        {
          title: "Analytics",
          items: [
            { label: "Participation", icon: TrendingUp, href: "/dashboard/governance/analytics" },
          ],
        },
        {
          title: "Settings",
          items: [
            { label: "Governance Settings", icon: Settings, href: "/settings/profile" },
          ],
        },
      ];

    case "market_researcher":
      return [
        {
          title: "Research",
          items: [
            { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/research" },
            { label: "Studies", icon: ClipboardList, href: "/dashboard/research/studies" },
            { label: "Panels", icon: Users, href: "/dashboard/research/panels" },
            { label: "Responses", icon: UserCheck, href: "/dashboard/research/responses" },
          ],
        },
        {
          title: "Create",
          items: [
            { label: "New Survey", icon: PlusCircle, href: "/create" },
            { label: "Questionnaires", icon: ClipboardList, href: "/creator/questionnaires" },
            { label: "Projects", icon: FolderKanban, href: "/creator/projects" },
          ],
        },
        {
          title: "Analytics",
          items: [
            { label: "Insights", icon: PieChart, href: "/dashboard/research/insights" },
            { label: "Data Export", icon: BarChart3, href: "/dashboard/research/export" },
          ],
        },
        {
          title: "Settings",
          items: [
            { label: "Research Settings", icon: Settings, href: "/settings/profile" },
          ],
        },
      ];

    case "hr_professional":
      return [
        {
          title: "HR",
          items: [
            { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/hr" },
            { label: "Feedback", icon: Megaphone, href: "/dashboard/hr/feedback" },
            { label: "Departments", icon: Building, href: "/dashboard/hr/departments" },
            { label: "Anonymity", icon: Shield, href: "/dashboard/hr/anonymity" },
          ],
        },
        {
          title: "Create",
          items: [
            { label: "New Survey", icon: PlusCircle, href: "/create" },
            { label: "Templates", icon: ClipboardList, href: "/dashboard/hr/templates" },
          ],
        },
        {
          title: "Reports",
          items: [
            { label: "Trends", icon: TrendingUp, href: "/dashboard/hr/trends" },
            { label: "Compliance", icon: FileText, href: "/dashboard/hr/compliance" },
          ],
        },
        {
          title: "Settings",
          items: [
            { label: "HR Settings", icon: Settings, href: "/settings/profile" },
          ],
        },
      ];

    case "community_builder":
      return [
        {
          title: "Creator",
          items: [
            { label: "Dashboard", icon: LayoutDashboard, href: "/creator" },
            { label: "Projects", icon: FolderKanban, href: "/creator/projects" },
            { label: "Manage Polls", icon: ClipboardList, href: "/creator/manage" },
            { label: "Questionnaires", icon: ClipboardList, href: "/creator/questionnaires" },
            { label: "Distributions", icon: Send, href: "/creator/distributions" },
          ],
        },
        {
          title: "Engagement",
          items: [
            { label: "Quest Manager", icon: ListChecks, href: "/creator/quests" },
            { label: "Season Manager", icon: Calendar, href: "/creator/seasons" },
          ],
        },
        {
          title: "Quick Actions",
          items: [
            { label: "Create Poll", icon: PlusCircle, href: "/create" },
            { label: "Analytics", icon: TrendingUp, href: "/creator/analytics" },
          ],
        },
        {
          title: "Settings",
          items: [
            { label: "Profile Settings", icon: Settings, href: "/settings/profile" },
          ],
        },
      ];

    case "survey_earner":
      return [
        {
          title: "Participant",
          items: [
            { label: "Dashboard", icon: LayoutDashboard, href: "/participant" },
            { label: "Available Polls", icon: Vote, href: "/questionnaires" },
            { label: "Quests", icon: Flame, href: "/participant/quests" },
            { label: "History", icon: FileText, href: "/participant/history" },
          ],
        },
        {
          title: "Rewards",
          items: [
            { label: "My Rewards", icon: Gift, href: "/participant/rewards" },
            { label: "Leaderboard", icon: Trophy, href: "/leaderboard" },
            { label: "Referrals", icon: Share2, href: "/participant/referrals" },
          ],
        },
        {
          title: "Wallet",
          items: [
            { label: "Balance", icon: LayoutDashboard, href: "/wallet" },
            { label: "Swap PULSE", icon: TrendingUp, href: "/swap" },
          ],
        },
        {
          title: "Settings",
          items: [
            { label: "Preferences", icon: Settings, href: "/settings/profile" },
          ],
        },
      ];

    case "developer":
      return [
        {
          title: "Developer",
          items: [
            { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/developer" },
            { label: "API Keys", icon: Key, href: "/dashboard/developer/api-keys" },
            { label: "Webhooks", icon: Webhook, href: "/dashboard/developer/webhooks" },
            { label: "SDK Docs", icon: BookOpen, href: "/dashboard/developer/docs" },
          ],
        },
        {
          title: "Testing",
          items: [
            { label: "Sandbox", icon: TestTube, href: "/dashboard/developer/sandbox" },
            { label: "Logs", icon: FileText, href: "/dashboard/developer/logs" },
          ],
        },
        {
          title: "Resources",
          items: [
            { label: "Examples", icon: Code, href: "/dashboard/developer/examples" },
            { label: "Help", icon: HelpCircle, href: "/dashboard/developer/help" },
          ],
        },
        {
          title: "Settings",
          items: [
            { label: "Developer Settings", icon: Settings, href: "/settings/profile" },
          ],
        },
      ];

    default:
      // Default fallback to participant
      return getSidebarSections("survey_earner");
  }
}

// Get the dashboard path for a given profile
export function getProfileDashboardPath(profile: ProfileType): string {
  switch (profile) {
    case "dao_governance":
      return "/dashboard/governance";
    case "market_researcher":
      return "/dashboard/research";
    case "hr_professional":
      return "/dashboard/hr";
    case "community_builder":
      return "/creator";
    case "survey_earner":
      return "/participant";
    case "developer":
      return "/dashboard/developer";
    default:
      return "/";
  }
}
