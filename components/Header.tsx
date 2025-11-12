"use client"

import React, { useState } from "react";
import NavLink from "./NavLink";
import Image from "next/image";
import useDelayUnmount from "@/hooks/useDelayUnmount";
import OutsideClickDetector from "@/hooks/OutsideClickDetector";
import { TextAlignJustify, X } from "lucide-react";

export const Header: React.FC = () => {
    const [isSidebarVisible, setSidebarVisibility] = useState(false);
    const shouldRender = useDelayUnmount(isSidebarVisible, 300);

    const sidebarRef = OutsideClickDetector(() => {
        setSidebarVisibility(false);
    }, isSidebarVisible === true);

    const Links = () => {
        return <>
            <NavLink
                href="/"
                end
                activeClassName="text-primary hidden max-lg:block"
                onClick={() => setSidebarVisibility(false)}
            >
                <span>Home</span>
            </NavLink>

            <NavLink
                href="/dashboard"
                end
                activeClassName="text-primary"
                onClick={() => setSidebarVisibility(false)}
            >
                <span>Dashboard</span>
            </NavLink>

            <NavLink
                href="/blocks"
                activeClassName="text-primary"
                onClick={() => setSidebarVisibility(false)}
            >
                <span>Blocks</span>
            </NavLink>

            <NavLink
                href="/rewards"
                activeClassName="text-primary"
                onClick={() => setSidebarVisibility(false)}
            >
                <span>Rewards</span>
            </NavLink>

            <NavLink
                href="/marketplace"
                activeClassName="text-primary"
                onClick={() => setSidebarVisibility(false)}
            >
                <span>Data Marketplace</span>
            </NavLink>

            <NavLink
                href="/pricing"
                activeClassName="text-primary"
                onClick={() => setSidebarVisibility(false)}
            >
                <span>Pricing</span>
            </NavLink>

            <NavLink
                href="/book-call"
                activeClassName="text-primary"
                onClick={() => setSidebarVisibility(false)}
            >
                <span>Book a call</span>
            </NavLink>
        </>
    }

    return (
        <>
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

                    <nav className="hidden lg:flex items-center space-x-9">
                        <Links />
                    </nav>

                    <button className="hidden max-lg:flex" onClick={() => setSidebarVisibility(true)}>
                        <TextAlignJustify className="size-5" />
                    </button>
                </div>
            </header>

            <div
                ref={sidebarRef}
                className={`flex-1 flex lg:justify-between fixed top-0 right-0 w-[260px] lg:w-auto h-full lg:h-auto flex-col lg:flex-row bg-background lg:bg-transparent lg:static py-8 px-9 lg:px-0 lg:py-0 border-l-2 border-main-green lg:hidden lg:border-0 transition-all duration-300 z-[210] ${isSidebarVisible
                    ? "translate-x-0"
                    : "translate-x-[260px] lg:translate-x-0"
                    }`}
            >
                <div className="flex items-center justify-between">
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        COINjecture
                    </span>

                    <button className="" onClick={() => setSidebarVisibility(false)}>
                        <X className="size-4" />
                    </button>
                </div>

                <div className="flex flex-col space-y-4 mt-8">
                    <Links />
                </div>
            </div>

            {shouldRender && (
                <div
                    className={`black-screen-animated z-[200] ${isSidebarVisible ? "show" : "hide"
                        }`}
                ></div>
            )}
        </>
    );
};

export default Header;
