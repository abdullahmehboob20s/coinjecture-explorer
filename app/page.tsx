"use client"

import { useQuery } from "@tanstack/react-query";
import MetricCard from "@/components/MetricCard";
import {
  Activity,
  Box,
  Clock,
  Cpu,
  Database,
  DollarSign,
  Network,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const fetchDashboard = async () => {
  const response = await fetch("https://api.coinjecture.com/v1/metrics/dashboard");
  if (!response.ok) throw new Error("Failed to fetch dashboard data");
  return response.json();
};

const fetchHealth = async () => {
  const response = await fetch("https://api.coinjecture.com/health");
  if (!response.ok) throw new Error("Failed to fetch health data");
  return response.json();
};

export default function Dashboard() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    refetchInterval: 10000,
  });

  const { data: healthData } = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Cpu className="h-12 w-12 animate-pulse text-primary" />
          <p className="text-muted-foreground">Loading blockchain data...</p>
        </div>
      </div>
    );
  }

  const data = dashboardData?.data;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-background border border-primary/20 p-8">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">COINjecture Network</h1>
          <p className="text-lg text-muted-foreground">
            Real-time blockchain metrics and analytics
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-success/10 border-success/20 text-success">
                <div className="h-2 w-2 rounded-full bg-success mr-2 animate-pulse" />
                Network Online
              </Badge>
              <Badge variant="outline" className="bg-primary/10 border-primary/20">
                {healthData?.peers_connected || 0} Peers
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Latest Block"
          value={`#${data?.blockchain?.latest_block_height?.toLocaleString() || 0}`}
          icon={Box}
          description="Current height"
          variant="primary"
        />
        <MetricCard
          title="Avg Block Time"
          value={`${data?.block_time?.avg_seconds?.toFixed(2) || 0}s`}
          icon={Clock}
          description="Last 100 blocks"
          variant="default"
        />
        <MetricCard
          title="Total Rewards"
          value={`${data?.rewards?.total_distributed?.toFixed(2) || 0}`}
          icon={DollarSign}
          description="BEANS distributed"
          variant="success"
        />
        <MetricCard
          title="Network Hash Rate"
          value={`${data?.hash_rate?.current_hs?.toFixed(2) || 0}`}
          icon={Zap}
          description={data?.hash_rate?.trend || "→"}
          trend={
            data?.hash_rate?.trend === "↑"
              ? "up"
              : data?.hash_rate?.trend === "↓"
                ? "down"
                : "neutral"
          }
          variant="warning"
        />
      </div>

      {/* Blockchain Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 backdrop-blur-sm border-border/40">
          <h3 className="text-xl font-semibold flex items-center">
            <Database className="mr-2 h-5 w-5 text-primary" />
            Blockchain Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Total Blocks</span>
              <span className="font-semibold">
                {data?.blockchain?.total_blocks?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Validated Blocks</span>
              <span className="font-semibold">
                {data?.blockchain?.validated_blocks?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Cumulative Work Score</span>
              <span className="font-semibold">
                {data?.blockchain?.cumulative_work_score?.toFixed(2) || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Success Rate</span>
              <span className="font-semibold text-success">
                {((data?.blockchain?.success_rate || 0) * 100).toFixed(4)}%
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6 backdrop-blur-sm border-border/40">
          <h3 className="text-xl font-semibold flex items-center">
            <Network className="mr-2 h-5 w-5 text-accent" />
            Network Status
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Active Miners</span>
              <span className="font-semibold">
                {data?.network?.active_miners || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Connected Peers</span>
              <span className="font-semibold">
                {data?.network?.peers_connected || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Avg Difficulty</span>
              <span className="font-semibold">
                {data?.network?.avg_difficulty || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Network ID</span>
              <span className="font-mono text-xs">
                {data?.network?.network_id || "N/A"}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Transaction Stats */}
      <Card className="p-6 backdrop-blur-sm border-border/40">
        <h3 className="text-xl font-semibold mb-0 flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-warning" />
          Transaction Throughput
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-2xl font-bold text-primary">
              {data?.transactions?.tps_current?.toFixed(2) || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Current TPS</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-2xl font-bold">
              {data?.transactions?.tps_1min?.toFixed(2) || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">1 Min Avg</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-2xl font-bold">
              {data?.transactions?.tps_5min?.toFixed(2) || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">5 Min Avg</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-2xl font-bold">
              {data?.transactions?.tps_1hour?.toFixed(2) || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">1 Hour Avg</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-2xl font-bold">
              {data?.transactions?.tps_24hour?.toFixed(2) || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">24 Hour Avg</p>
          </div>
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card className="p-6 backdrop-blur-sm border-border/40">
        <h3 className="text-xl font-semibold flex items-center">
          <Activity className="mr-2 h-5 w-5 text-accent" />
          Recent Transactions
        </h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Block</TableHead>
                <TableHead>Hash</TableHead>
                <TableHead>Miner</TableHead>
                <TableHead>Work Score</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead>Gas Used</TableHead>
                <TableHead>Age</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.recent_transactions?.slice(0, 10).map((tx: any) => (
                <TableRow key={tx.block_hash}>
                  <TableCell className="font-mono">
                    <Badge variant="outline" className="bg-primary/10">
                      #{tx.block_index}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {tx.block_hash_short}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {tx.miner_short}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-warning/10">
                      {tx.work_score?.toFixed(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-success font-medium">
                    {tx.reward?.toFixed(4)} BEANS
                  </TableCell>
                  <TableCell>{tx.gas_used_formatted}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {tx.age_display}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
