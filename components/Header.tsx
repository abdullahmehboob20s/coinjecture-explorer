import React from "react";
import { Activity, Blocks, Wallet } from "lucide-react";
import NavLink from "./NavLink";
import Image from "next/image";

export const Header: React.FC = () => {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4 mx-auto">
                <NavLink href="/" className="flex items-center space-x-4" end>
                    <Image src="/brand-logo.png" width={40} height={40} className="size-10" alt="brand-logo" />
                    <div className="flex flex-col">
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            COINjecture
                        </span>

                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">Explorer</span>
                            <span className="text-xs text-muted-foreground">-</span>
                            <span className="flex items-center space-x-1.5">
                                <span className="text-xs font-medium text-success">Live</span>
                                <span className="block size-1.5 rounded-full bg-success" />
                            </span>
                        </div>
                    </div>
                </NavLink>

                <nav className="hidden md:flex items-center space-x-1">
                    <NavLink
                        href="/"
                        end
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted flex items-center space-x-2"
                        activeClassName="bg-muted text-primary"
                    >
                        <Activity className="size-4" />
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink
                        href="/blocks"
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted flex items-center space-x-2"
                        activeClassName="bg-muted text-primary"
                    >
                        <Blocks className="size-4" />
                        <span>Blocks</span>
                    </NavLink>

                    <NavLink
                        href="/rewards"
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted flex items-center space-x-2"
                        activeClassName="bg-muted text-primary"
                    >
                        <Wallet className="size-4" />
                        <span>Rewards</span>
                    </NavLink>
                </nav>
            </div>

            {/* Mobile nav */}
            <nav className="md:hidden flex items-center justify-around border-t border-border/40 bg-card">
                <NavLink
                    href="/"
                    end
                    className="flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors"
                    activeClassName="text-primary"
                >
                    <Activity className="h-5 w-5 mb-1" />
                    Dashboard
                </NavLink>

                <NavLink
                    href="/blocks"
                    className="flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors"
                    activeClassName="text-primary"
                >
                    <Blocks className="h-5 w-5 mb-1" />
                    Blocks
                </NavLink>

                <NavLink
                    href="/rewards"
                    className="flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors"
                    activeClassName="text-primary"
                >
                    <Wallet className="h-5 w-5 mb-1" />
                    Rewards
                </NavLink>
            </nav>
        </header>
    );
};

export default Header;
