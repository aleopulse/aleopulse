import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DashboardSidebar, type SidebarSection } from "@/components/DashboardSidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";
import { getSidebarSections } from "@/lib/sidebar-config";
import {
  LayoutDashboard,
  FileText,
  Users,
  Shield,
  PlusCircle,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  TrendingUp,
  Vote,
} from "lucide-react";

// Mock data for demonstration
const mockProposals = [
  {
    id: 1,
    title: "Increase Staking Rewards by 5%",
    status: "active",
    votesFor: 1250000,
    votesAgainst: 450000,
    quorum: 70,
    endsIn: "2 days",
  },
  {
    id: 2,
    title: "Add New Token to Treasury",
    status: "active",
    votesFor: 890000,
    votesAgainst: 320000,
    quorum: 55,
    endsIn: "5 days",
  },
  {
    id: 3,
    title: "Protocol Fee Adjustment",
    status: "passed",
    votesFor: 2100000,
    votesAgainst: 800000,
    quorum: 100,
    endsIn: "Completed",
  },
];

const mockStats = {
  totalVotingPower: "1,250,000",
  delegatedTo: 3,
  activeDelegators: 12,
  participationRate: 78,
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
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProposalCard({
  proposal,
}: {
  proposal: typeof mockProposals[0];
}) {
  const totalVotes = proposal.votesFor + proposal.votesAgainst;
  const forPercentage = (proposal.votesFor / totalVotes) * 100;

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold">{proposal.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Proposal #{proposal.id}
            </p>
          </div>
          <Badge
            variant={proposal.status === "active" ? "default" : "secondary"}
          >
            {proposal.status === "active" ? (
              <><Clock className="w-3 h-3 mr-1" /> {proposal.endsIn}</>
            ) : proposal.status === "passed" ? (
              <><CheckCircle className="w-3 h-3 mr-1" /> Passed</>
            ) : (
              <><XCircle className="w-3 h-3 mr-1" /> Failed</>
            )}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-green-500">For: {(proposal.votesFor / 1000000).toFixed(2)}M</span>
            <span className="text-red-500">Against: {(proposal.votesAgainst / 1000000).toFixed(2)}M</span>
          </div>
          <Progress value={forPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{forPercentage.toFixed(1)}% in favor</span>
            <span>Quorum: {proposal.quorum}%</span>
          </div>
        </div>

        {proposal.status === "active" && (
          <div className="mt-4 flex gap-2">
            <Button size="sm" className="flex-1">Vote For</Button>
            <Button size="sm" variant="outline" className="flex-1">Vote Against</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function GovernanceDashboard() {
  const { isCollapsed } = useSidebar();
  const sidebarSections = getSidebarSections("dao_governance");

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
                Governance Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage proposals, vote, and track your governance participation
              </p>
            </div>
            <Button className="gap-2">
              <PlusCircle className="w-4 h-4" />
              Create Proposal
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Voting Power"
              value={mockStats.totalVotingPower}
              icon={Shield}
              change={12}
              changeLabel="this month"
            />
            <StatCard
              title="Delegated To"
              value={`${mockStats.delegatedTo} addresses`}
              icon={Users}
            />
            <StatCard
              title="Active Delegators"
              value={mockStats.activeDelegators.toString()}
              icon={TrendingUp}
              change={25}
              changeLabel="this week"
            />
            <StatCard
              title="Participation Rate"
              value={`${mockStats.participationRate}%`}
              icon={Vote}
              change={5}
              changeLabel="vs last month"
            />
          </div>

          {/* Active Proposals */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Active Proposals</h2>
              <Link href="/dashboard/governance/proposals">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockProposals.map((proposal) => (
                <ProposalCard key={proposal.id} proposal={proposal} />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common governance tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <FileText className="w-5 h-5" />
                  <span>View All Proposals</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Users className="w-5 h-5" />
                  <span>Manage Delegation</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>View Analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
