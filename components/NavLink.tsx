"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = {
    href: string;
    end?: boolean; // exact match (like react-router's end)
    className?: string;
    activeClassName?: string;
    children?: React.ReactNode;
    // allow other anchor props if you want (target, rel, etc.)
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export const NavLink: React.FC<NavLinkProps> = ({
    href,
    end = false,
    className = "",
    activeClassName = "",
    children,
    ...anchorProps
}) => {
    const pathname = usePathname() || "/";
    // Normalize trailing slash differences
    const normalize = (p: string) => (p.endsWith("/") && p !== "/" ? p.slice(0, -1) : p);
    const current = normalize(pathname);
    const target = normalize(href);

    // root needs special handling: '/' should only be active for exact root unless end=false with other logic
    const isActive = end ? current === target : (target === "/" ? current === "/" : current.startsWith(target));

    const classes = [className, isActive ? activeClassName : ""].filter(Boolean).join(" ");

    // We use Link + <a> to keep anchor props available
    return (
        <Link href={href} className={classes} {...anchorProps}>
            {children}
        </Link>
    );
};

export default NavLink;
