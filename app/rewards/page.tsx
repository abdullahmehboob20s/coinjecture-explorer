"use client"

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Search, TrendingUp, Award, Activity, Hash } from "lucide-react";

const fetchRewards = async (address: string) => {
    const response = await fetch(`https://api.coinjecture.com/v1/rewards/${address}`);
    if (!response.ok) throw new Error("Failed to fetch rewards data");
    return response.json();
};

const DEFAULT_ADDRESS = "BEANS13c5b833b5c164f73313202e7de6feff6b05023c";

export default function Rewards() {
    const [address, setAddress] = useState(DEFAULT_ADDRESS);
    const [searchAddress, setSearchAddress] = useState(DEFAULT_ADDRESS);

    const { data: rewardsData, isLoading, error } = useQuery({
        queryKey: ["rewards", searchAddress],
        queryFn: () => fetchRewards(searchAddress),
        enabled: !!searchAddress,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (address.trim()) {
            setSearchAddress(address.trim());
        }
    };

    const rewards = rewardsData?.data;

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-background border border-primary/20 p-8">
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold mb-2">Rewards Tracker</h1>
                    <p className="text-lg text-muted-foreground">
                        Track mining rewards and wallet statistics
                    </p>
                </div>
            </div>

            {/* Search */}
            <Card className="p-6 backdrop-blur-sm border-border/40">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Enter wallet address (e.g., BEANS13c5b833b5c164f73313202e7de6feff6b05023c)"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="bg-muted/50 border-border/40"
                        />
                    </div>
                    <Button type="submit" className="bg-primary hover:bg-primary/90">
                        <Search className="mr-2 h-4 w-4" />
                        Search
                    </Button>
                </form>
            </Card>

            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center space-y-4">
                        <Wallet className="h-12 w-12 animate-pulse text-primary" />
                        <p className="text-muted-foreground">Loading rewards data...</p>
                    </div>
                </div>
            )}

            {error && (
                <Card className="p-8 backdrop-blur-sm border-destructive/40 bg-destructive/5">
                    <div className="text-center">
                        <p className="text-destructive font-semibold mb-2">Error loading rewards</p>
                        <p className="text-sm text-muted-foreground">
                            Please check the address and try again
                        </p>
                    </div>
                </Card>
            )}

            {rewards && (
                <>
                    {/* Address Info */}
                    <Card className="p-6 backdrop-blur-sm border-border/40">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="rounded-full p-3 bg-primary/10">
                                <Hash className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Wallet Address</p>
                                <p className="font-mono text-sm break-all">{rewards.address}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="p-6 backdrop-blur-sm border-border/40 hover:border-success/40 transition-all">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Wallet Balance</p>
                                    <p className="text-3xl font-bold text-success">
                                        {rewards.wallet_balance?.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">BEANS</p>
                                </div>
                                <div className="rounded-full p-3 bg-success/10">
                                    <Wallet className="h-5 w-5 text-success" />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 backdrop-blur-sm border-border/40 hover:border-primary/40 transition-all">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Total Rewards</p>
                                    <p className="text-3xl font-bold text-primary">
                                        {rewards.total_rewards?.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">BEANS earned</p>
                                </div>
                                <div className="rounded-full p-3 bg-primary/10">
                                    <Award className="h-5 w-5 text-primary" />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 backdrop-blur-sm border-border/40 hover:border-warning/40 transition-all">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Blocks Mined</p>
                                    <p className="text-3xl font-bold text-warning">
                                        {rewards.blocks_mined?.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        of {rewards.total_blocks?.toLocaleString()} total
                                    </p>
                                </div>
                                <div className="rounded-full p-3 bg-warning/10">
                                    <Activity className="h-5 w-5 text-warning" />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 backdrop-blur-sm border-border/40 hover:border-accent/40 transition-all">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Avg Work Score</p>
                                    <p className="text-3xl font-bold text-accent">
                                        {rewards.average_work_score?.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">per block</p>
                                </div>
                                <div className="rounded-full p-3 bg-accent/10">
                                    <TrendingUp className="h-5 w-5 text-accent" />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Detailed Statistics */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="p-6 backdrop-blur-sm border-border/40">
                            <h3 className="text-xl font-semibold  flex items-center">
                                <Award className="mr-2 h-5 w-5 text-primary" />
                                Reward Statistics
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                                    <span className="text-sm text-muted-foreground">Average Reward</span>
                                    <span className="font-semibold text-primary">
                                        {rewards.avg_reward?.toFixed(6)} BEANS
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                                    <span className="text-sm text-muted-foreground">Total Rewards Earned</span>
                                    <span className="font-semibold text-success">
                                        {rewards.total_rewards?.toFixed(4)} BEANS
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                                    <span className="text-sm text-muted-foreground">Current Balance</span>
                                    <span className="font-semibold text-warning">
                                        {rewards.wallet_balance?.toFixed(4)} BEANS
                                    </span>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 backdrop-blur-sm border-border/40">
                            <h3 className="text-xl font-semibold  flex items-center">
                                <Activity className="mr-2 h-5 w-5 text-accent" />
                                Mining Performance
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                                    <span className="text-sm text-muted-foreground">Blocks Mined</span>
                                    <Badge variant="outline" className="bg-primary/10">
                                        {rewards.blocks_mined?.toLocaleString()}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                                    <span className="text-sm text-muted-foreground">Total Work Score</span>
                                    <span className="font-semibold">{rewards.total_work_score?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                                    <span className="text-sm text-muted-foreground">Average Work Score</span>
                                    <Badge variant="outline" className="bg-accent/10">
                                        {rewards.average_work_score?.toFixed(4)}
                                    </Badge>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Efficiency Chart */}
                    <Card className="p-6 backdrop-blur-sm border-border/40">
                        <h3 className="text-xl font-semibold  flex items-center">
                            <TrendingUp className="mr-2 h-5 w-5 text-success" />
                            Mining Efficiency
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 text-center">
                                <p className="text-sm text-muted-foreground mb-2">Reward Per Block</p>
                                <p className="text-3xl font-bold text-primary">
                                    {rewards.avg_reward?.toFixed(4)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">BEANS average</p>
                            </div>
                            <div className="p-6 rounded-lg bg-gradient-to-br from-success/10 to-warning/10 border border-success/20 text-center">
                                <p className="text-sm text-muted-foreground mb-2">Work Score Per Block</p>
                                <p className="text-3xl font-bold text-success">
                                    {rewards.average_work_score?.toFixed(2)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">average difficulty</p>
                            </div>
                            <div className="p-6 rounded-lg bg-gradient-to-br from-warning/10 to-destructive/10 border border-warning/20 text-center">
                                <p className="text-sm text-muted-foreground mb-2">Total Contribution</p>
                                <p className="text-3xl font-bold text-warning">
                                    {((rewards.blocks_mined / rewards.total_blocks) * 100).toFixed(2)}%
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">of network blocks</p>
                            </div>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}
