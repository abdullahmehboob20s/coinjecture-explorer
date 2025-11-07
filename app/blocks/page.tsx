"use client"

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Box,
    Clock,
    Database,
    Hash,
    Zap,
    Shield,
    Activity,
} from "lucide-react";

const fetchLatestBlock = async () => {
    const response = await fetch("https://api.coinjecture.com/v1/data/block/latest");
    if (!response.ok) throw new Error("Failed to fetch block data");
    return response.json();
};

export default function Blocks() {
    const { data: blockData, isLoading } = useQuery({
        queryKey: ["latestBlock"],
        queryFn: fetchLatestBlock,
        refetchInterval: 10000,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center space-y-4">
                    <Box className="h-12 w-12 animate-pulse text-primary" />
                    <p className="text-muted-foreground">Loading block data...</p>
                </div>
            </div>
        );
    }

    const block = blockData?.data;

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-background border border-primary/20 p-8">
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold mb-2">Block Explorer</h1>
                    <p className="text-lg text-muted-foreground">
                        Detailed information about the latest block
                    </p>
                </div>
            </div>

            {/* Block Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 backdrop-blur-sm border-border/40 hover:border-primary/40 transition-all">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Block Height</p>
                            <p className="text-3xl font-bold text-primary">#{block?.height}</p>
                        </div>
                        <div className="rounded-full p-3 bg-primary/10">
                            <Box className="h-5 w-5 text-primary" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 backdrop-blur-sm border-border/40 hover:border-success/40 transition-all">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Work Score</p>
                            <p className="text-3xl font-bold text-success">
                                {block?.work_score?.toFixed(1)}
                            </p>
                        </div>
                        <div className="rounded-full p-3 bg-success/10">
                            <Zap className="h-5 w-5 text-success" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 backdrop-blur-sm border-border/40 hover:border-warning/40 transition-all">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Block Reward</p>
                            <p className="text-3xl font-bold text-warning">
                                {block?.reward?.toFixed(4)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">BEANS</p>
                        </div>
                        <div className="rounded-full p-3 bg-warning/10">
                            <Activity className="h-5 w-5 text-warning" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 backdrop-blur-sm border-border/40 hover:border-accent/40 transition-all">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Gas Used</p>
                            <p className="text-3xl font-bold text-accent">
                                {block?.gas_used?.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                / {block?.gas_limit?.toLocaleString()}
                            </p>
                        </div>
                        <div className="rounded-full p-3 bg-accent/10">
                            <Database className="h-5 w-5 text-accent" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Block Details */}
            <Card className="p-6 backdrop-blur-sm border-border/40">
                <h3 className="text-xl font-semibold  flex items-center">
                    <Hash className="mr-2 h-5 w-5 text-primary" />
                    Block Information
                </h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground mb-2">Block Hash</p>
                            <p className="font-mono text-sm break-all">{block?.block_hash}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground mb-2">Previous Hash</p>
                            <p className="font-mono text-sm break-all">{block?.previous_hash}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground mb-2">Merkle Root</p>
                            <p className="font-mono text-sm break-all">{block?.merkle_root}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground mb-2">Content ID (CID)</p>
                            <p className="font-mono text-sm break-all">{block?.cid}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground mb-2">Miner Address</p>
                            <p className="font-mono text-sm break-all">{block?.miner_address}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground mb-2">Public Key</p>
                            <p className="font-mono text-sm break-all">{block?.public_key}</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-2">Signature</p>
                        <p className="font-mono text-sm break-all">{block?.signature}</p>
                    </div>
                </div>
            </Card>

            {/* Consensus & Stability */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 backdrop-blur-sm border-border/40">
                    <h3 className="text-xl font-semibold  flex items-center">
                        <Shield className="mr-2 h-5 w-5 text-success" />
                        Consensus Metrics
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                            <span className="text-sm text-muted-foreground">Stability Metric</span>
                            <Badge variant="outline" className="bg-success/10 border-success/20 text-success">
                                {block?.stability_metric}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                            <span className="text-sm text-muted-foreground">Damping Ratio</span>
                            <span className="font-semibold">{block?.damping_ratio?.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                            <span className="text-sm text-muted-foreground">Cumulative Work</span>
                            <span className="font-semibold">{block?.cumulative_work?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                            <span className="text-sm text-muted-foreground">Capacity</span>
                            <Badge variant="outline">{block?.capacity}</Badge>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 backdrop-blur-sm border-border/40">
                    <h3 className="text-xl font-semibold  flex items-center">
                        <Clock className="mr-2 h-5 w-5 text-warning" />
                        Timestamp & Gas
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                            <span className="text-sm text-muted-foreground">Timestamp</span>
                            <span className="font-mono text-sm">
                                {new Date(block?.timestamp * 1000).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                            <span className="text-sm text-muted-foreground">Gas Limit</span>
                            <span className="font-semibold">{block?.gas_limit?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                            <span className="text-sm text-muted-foreground">Gas Used</span>
                            <span className="font-semibold">{block?.gas_used?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                            <span className="text-sm text-muted-foreground">Gas Price</span>
                            <span className="font-semibold">{block?.gas_price}</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Dimensional Allocation */}
            <Card className="p-6 backdrop-blur-sm border-border/40">
                <h3 className="text-xl font-semibold  flex items-center">
                    <Database className="mr-2 h-5 w-5 text-accent" />
                    Dimensional Reward Allocation
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {Object.entries(block?.dimensional_allocation?.allocations || {}).map(
                        ([dimension, allocation]: [string, any]) => (
                            <div
                                key={dimension}
                                className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 text-center"
                            >
                                <p className="text-xs text-muted-foreground mb-2">{dimension}</p>
                                <p className="text-lg font-bold text-primary">
                                    {allocation?.toFixed(4)}
                                </p>
                            </div>
                        )
                    )}
                </div>
                <div className="mt-6 p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-2">Total Allocated Reward</p>
                    <p className="text-2xl font-bold text-success">
                        {block?.dimensional_allocation?.total_reward?.toFixed(8)} BEANS
                    </p>
                </div>
            </Card>
        </div>
    );
}
