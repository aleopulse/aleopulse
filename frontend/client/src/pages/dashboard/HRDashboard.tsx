import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";
import { getSidebarSections } from "@/lib/sidebar-config";
import {
  PlusCircle,
  Users,
  Building,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  MessageSquare,
  Lock,
  AlertCircle,
} from "lucide-react";

// Mock data for demonstration
const mockSurveys = [
  {
    id: 1,
    title: "Q1 Employee Satisfaction",
    status: "active",
    responses: 89,
    total: 120,
    department: "All Departments",
    anonymous: true,
    dueIn: "3 days",
  },
  {
    id: 2,
    title: "Remote Work Policy Feedback",
    status: "active",
    responses: 45,
    total: 80,
    department: "Engineering",
    anonymous: true,
    dueIn: "1 week",
  },
  {
    id: 3,
    title: "Annual Performance Review",
    status: "completed",
    responses: 115,
    total: 115,
    department: "All Departments",
    anonymous: false,
    dueIn: "Completed",
  },
];

const mockStats = {
  totalFeedback: 847,
  participationRate: "74%",
  departments: 8,
  anonymousRate: "92%",
};

const mockDepartments = [
  { name: "Engineering", participation: 82, sentiment: "positive" },
  { name: "Marketing", participation: 78, sentiment: "positive" },
  { name: "Sales", participation: 65, sentiment: "neutral" },
  { name: "HR", participation: 95, sentiment: "positive" },
  { name: "Finance", participation: 71, sentiment: "neutral" },
];

function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: number;
  changeLabel?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change !== undefined && (
              <p className={cn(
                "text-xs mt-1",
                change >= 0 ? "text-green-500" : "text-red-500"
              )}>
                {change >= 0 ? "+" : ""}{change}% {changeLabel}
              </p>
            )}
          </div>
          <div className="p-2 rounded-lg bg-green-500/10">
            <Icon className="w-5 h-5 text-green-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SurveyCard({
  survey,
}: {
  survey: typeof mockSurveys[0];
}) {
  const progress = (survey.responses / survey.total) * 100;

  return (
    <Card className="hover:border-green-500/50 transition-colors">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{survey.title}</h3>
              {survey.anonymous && (
                <Lock className="w-3 h-3 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {survey.department}
            </p>
          </div>
          <Badge
            variant={survey.status === "active" ? "default" : "secondary"}
            className={survey.status === "active" ? "bg-green-500" : ""}
          >
            {survey.status === "active" ? (
              <><Clock className="w-3 h-3 mr-1" /> {survey.dueIn}</>
            ) : (
              <><CheckCircle className="w-3 h-3 mr-1" /> Completed</>
            )}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Participation</span>
            <span>{survey.responses} / {survey.total} employees</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {progress.toFixed(0)}% completion rate
          </p>
        </div>

        <div className="mt-4 flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">View Results</Button>
          {survey.status === "active" && (
            <Button size="sm" variant="outline" className="flex-1">Send Reminder</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function HRDashboard() {
  const { isCollapsed } = useSidebar();
  const sidebarSections = getSidebarSections("hr_professional");

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <DashboardSidebar sections={sidebarSections} />

      <div className={cn(
        "transition-all duration-300",
        isCollapsed ? "md:ml-[72px]" : "md:ml-64"
      )}>
        <div className="container max-w-6xl mx-auto px-4 py-6 md:py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold tracking-tight">
                HR Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage employee feedback, surveys, and engagement
              </p>
            </div>
            <Button className="gap-2 bg-green-500 hover:bg-green-600">
              <PlusCircle className="w-4 h-4" />
              New Survey
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Feedback"
              value={mockStats.totalFeedback}
              icon={MessageSquare}
              change={15}
              changeLabel="this quarter"
            />
            <StatCard
              title="Participation Rate"
              value={mockStats.participationRate}
              icon={TrendingUp}
              change={8}
              changeLabel="vs last quarter"
            />
            <StatCard
              title="Departments"
              value={mockStats.departments}
              icon={Building}
            />
            <StatCard
              title="Anonymous Responses"
              value={mockStats.anonymousRate}
              icon={Shield}
            />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Active Surveys */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Active Surveys</h2>
                <Link href="/dashboard/hr/feedback">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View All <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {mockSurveys.map((survey) => (
                  <SurveyCard key={survey.id} survey={survey} />
                ))}
              </div>
            </div>

            {/* Department Participation */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Department Participation</h2>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  {mockDepartments.map((dept) => (
                    <div key={dept.name} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{dept.name}</span>
                        <span className={cn(
                          "text-sm",
                          dept.sentiment === "positive" ? "text-green-500" :
                          dept.sentiment === "neutral" ? "text-yellow-500" : "text-red-500"
                        )}>
                          {dept.participation}%
                        </span>
                      </div>
                      <Progress value={dept.participation} className="h-1.5" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Anonymity Notice */}
              <Card className="mt-4 border-green-500/30 bg-green-500/5">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-green-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Privacy Protected</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        All responses are anonymized using zero-knowledge proofs
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common HR tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <PlusCircle className="w-5 h-5 text-green-500" />
                  <span>Create Survey</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span>View Trends</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <AlertCircle className="w-5 h-5 text-green-500" />
                  <span>Compliance Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
