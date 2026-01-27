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
  FileText,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  PieChart,
  Download,
} from "lucide-react";

// Mock data for demonstration
const mockStudies = [
  {
    id: 1,
    title: "Consumer Preferences Q1 2025",
    status: "active",
    responses: 127,
    target: 200,
    quality: 92,
    createdAt: "2 days ago",
  },
  {
    id: 2,
    title: "Product Feature Prioritization",
    status: "active",
    responses: 89,
    target: 150,
    quality: 88,
    createdAt: "1 week ago",
  },
  {
    id: 3,
    title: "Brand Awareness Survey",
    status: "completed",
    responses: 500,
    target: 500,
    quality: 95,
    createdAt: "2 weeks ago",
  },
];

const mockStats = {
  totalResponses: "2,847",
  averageQuality: "91%",
  activePanels: 5,
  responseRate: "73%",
};

function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel,
}: {
  title: string;
  value: string;
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
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Icon className="w-5 h-5 text-purple-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StudyCard({
  study,
}: {
  study: typeof mockStudies[0];
}) {
  const progress = (study.responses / study.target) * 100;

  return (
    <Card className="hover:border-purple-500/50 transition-colors">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold">{study.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Created {study.createdAt}
            </p>
          </div>
          <Badge
            variant={study.status === "active" ? "default" : "secondary"}
            className={study.status === "active" ? "bg-purple-500" : ""}
          >
            {study.status === "active" ? (
              <><Clock className="w-3 h-3 mr-1" /> Active</>
            ) : (
              <><CheckCircle className="w-3 h-3 mr-1" /> Completed</>
            )}
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Responses</span>
              <span>{study.responses} / {study.target}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Quality Score</span>
            <span className={cn(
              "font-medium",
              study.quality >= 90 ? "text-green-500" : study.quality >= 70 ? "text-yellow-500" : "text-red-500"
            )}>
              {study.quality}%
            </span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">View Results</Button>
          <Button size="sm" variant="outline" className="flex-1 gap-1">
            <Download className="w-3 h-3" /> Export
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ResearchDashboard() {
  const { isCollapsed } = useSidebar();
  const sidebarSections = getSidebarSections("market_researcher");

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
                Research Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage surveys, track responses, and analyze insights
              </p>
            </div>
            <Button className="gap-2 bg-purple-500 hover:bg-purple-600">
              <PlusCircle className="w-4 h-4" />
              New Study
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Responses"
              value={mockStats.totalResponses}
              icon={BarChart3}
              change={18}
              changeLabel="this month"
            />
            <StatCard
              title="Average Quality"
              value={mockStats.averageQuality}
              icon={TrendingUp}
              change={3}
              changeLabel="vs last month"
            />
            <StatCard
              title="Active Panels"
              value={mockStats.activePanels.toString()}
              icon={Users}
            />
            <StatCard
              title="Response Rate"
              value={mockStats.responseRate}
              icon={PieChart}
              change={5}
              changeLabel="improvement"
            />
          </div>

          {/* Active Studies */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Studies</h2>
              <Link href="/dashboard/research/studies">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockStudies.map((study) => (
                <StudyCard key={study.id} study={study} />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common research tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <PlusCircle className="w-5 h-5 text-purple-500" />
                  <span>Create Survey</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  <span>Manage Panels</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Download className="w-5 h-5 text-purple-500" />
                  <span>Export Data</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
