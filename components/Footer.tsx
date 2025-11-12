export function Footer() {
    return (
        <footer className="border-t border-border bg-background/50 backdrop-blur">
            <div className="px-4 container mx-auto sm:flex justify-between gap-8 py-12">
                <div className="w-full sm:max-w-xs max-sm:pb-10">
                    <h3 className="text-xl font-bold text-foreground mb-2">🧮 COINjecture</h3>
                    <p className="text-sm text-muted-foreground text-balance">
                        Utility-based blockchain solving real computational problems.
                    </p>
                </div>

                <main className="grid grid-cols-2 sm:grid-cols-4 flex-1 gap-12 justify-end">
                    <div className="max-lg:hidden"></div>

                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Overview
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Features
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Architecture
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    API Reference
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Documentation
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Manifesto
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Quick Start
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Community
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    About
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Blog
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Careers
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>
                </main>
            </div>

            <div className="border-t border-border py-8">
                <div className="px-4 container mx-auto flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-sm text-muted-foreground">
                    <p>&copy; 2025 COINjecture. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-primary transition-colors">
                            Privacy
                        </a>
                        <a href="#" className="hover:text-primary transition-colors">
                            Terms
                        </a>
                        <a href="#" className="hover:text-primary transition-colors">
                            Status
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
