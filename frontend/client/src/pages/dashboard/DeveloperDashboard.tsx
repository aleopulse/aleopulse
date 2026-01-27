import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";
import { getSidebarSections } from "@/lib/sidebar-config";
import {
  PlusCircle,
  Key,
  Webhook,
  BookOpen,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Code,
  Terminal,
  Activity,
  Clock,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

// Mock data for demonstration
const mockApiKeys = [
  {
    id: 1,
    name: "Production Key",
    prefix: "lp_live_",
    lastUsed: "2 hours ago",
    status: "active",
    calls: 12847,
  },
  {
    id: 2,
    name: "Development Key",
    prefix: "lp_test_",
    lastUsed: "5 minutes ago",
    status: "active",
    calls: 3421,
  },
];

const mockWebhooks = [
  {
    id: 1,
    url: "https://api.myapp.com/webhooks/aleopulse",
    events: ["poll.created", "vote.submitted", "poll.ended"],
    status: "active",
    lastTriggered: "1 hour ago",
  },
  {
    id: 2,
    url: "https://staging.myapp.com/webhooks",
    events: ["poll.ended"],
    status: "paused",
    lastTriggered: "3 days ago",
  },
];

const mockStats = {
  totalCalls: "16,268",
  successRate: "99.2%",
  avgLatency: "124ms",
  activeWebhooks: 2,
};

const codeExample = `import { AleoPulse } from '@aleopulse/sdk';

const client = new AleoPulse({
  apiKey: process.env.ALEOPULSE_API_KEY,
  network: 'testnet',
});

// Create a poll
const poll = await client.polls.create({
  title: 'Best Framework for 2025',
  options: ['React', 'Vue', 'Svelte', 'Angular'],
  duration: 7 * 24 * 60 * 60, // 7 days
  privacyMode: 'anonymous',
});

console.log('Poll created:', poll.id);`;

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="p-2 rounded-lg bg-cyan-500/10">
            <Icon className="w-5 h-5 text-cyan-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ApiKeyCard({ apiKey }: { apiKey: typeof mockApiKeys[0] }) {
  const [showKey, setShowKey] = useState(false);
  const fullKey = `${apiKey.prefix}${"x".repeat(32)}`;
  const maskedKey = `${apiKey.prefix}${"•".repeat(32)}`;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold">{apiKey.name}</h3>
            <p className="text-xs text-muted-foreground">
              Last used: {apiKey.lastUsed} • {apiKey.calls.toLocaleString()} calls
            </p>
          </div>
          <Badge className="bg-cyan-500">Active</Badge>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Input
            type={showKey ? "text" : "password"}
            value={showKey ? fullKey : maskedKey}
            readOnly
            className="font-mono text-xs"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon">
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function WebhookCard({ webhook }: { webhook: typeof mockWebhooks[0] }) {
  return (
    <Card className={cn(
      webhook.status === "paused" && "opacity-60"
    )}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-mono truncate">{webhook.url}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Last triggered: {webhook.lastTriggered}
            </p>
          </div>
          <Badge variant={webhook.status === "active" ? "default" : "secondary"}>
            {webhook.status}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-1 mt-3">
          {webhook.events.map((event) => (
            <Badge key={event} variant="outline" className="text-xs">
              {event}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DeveloperDashboard() {
  const { isCollapsed } = useSidebar();
  const sidebarSections = getSidebarSections("developer");

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
                Developer Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                API keys, webhooks, and integration tools
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard/developer/docs">
                <Button variant="outline" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  Documentation
                </Button>
              </Link>
              <Button className="gap-2 bg-cyan-500 hover:bg-cyan-600">
                <PlusCircle className="w-4 h-4" />
                New API Key
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total API Calls"
              value={mockStats.totalCalls}
              icon={Activity}
            />
            <StatCard
              title="Success Rate"
              value={mockStats.successRate}
              icon={CheckCircle}
            />
            <StatCard
              title="Avg Latency"
              value={mockStats.avgLatency}
              icon={Clock}
            />
            <StatCard
              title="Active Webhooks"
              value={mockStats.activeWebhooks.toString()}
              icon={Webhook}
            />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* API Keys */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">API Keys</h2>
                <Button variant="ghost" size="sm" className="gap-1">
                  Manage <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                {mockApiKeys.map((key) => (
                  <ApiKeyCard key={key.id} apiKey={key} />
                ))}
              </div>
            </div>

            {/* Webhooks */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Webhooks</h2>
                <Button variant="ghost" size="sm" className="gap-1">
                  Manage <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                {mockWebhooks.map((webhook) => (
                  <WebhookCard key={webhook.id} webhook={webhook} />
                ))}
              </div>
            </div>
          </div>

          {/* Quick Start Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Quick Start
              </CardTitle>
              <CardDescription>
                Get started with the AleoPulse SDK
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="p-4 rounded-lg bg-muted/50 overflow-x-auto text-sm font-mono">
                  <code>{codeExample}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-4 flex gap-2">
                <Link href="/dashboard/developer/docs">
                  <Button variant="outline" className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    Read Docs
                  </Button>
                </Link>
                <Link href="/dashboard/developer/examples">
                  <Button variant="outline" className="gap-2">
                    <Code className="w-4 h-4" />
                    More Examples
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
