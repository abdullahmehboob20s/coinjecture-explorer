"use client"

import { Footer } from "@/components/Footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

function BookCallHero() {
    return (
        <section className="relative overflow-hidden">
            {/* Soft blur color glows */}
            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 blur-3xl bg-primary"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20 blur-3xl bg-secondary"></div>

            {/* Subtle noise texture overlay */}
            <div className="absolute inset-0 bg-[url('https://previews.123rf.com/images/robisklp/robisklp1510/robisklp151000009/45873394-seamless-noise-texture.jpg')] opacity-[0.3] mix-blend-overlay pointer-events-none"></div>


            <div className="container mx-auto relative z-10 max-sm:pt-12 py-16 px-4">
                <Badge variant='outline' className="mb-6 py-1 px-4">
                    <span>Schedule Your Demo</span>
                </Badge>

                <h1 className="text-balance text-3xl font-black sm:text-5xl mb-6 text-foreground">
                    Computational-Grade Datasets
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary mt-2">
                        Enterprise Solutions for Real Work
                    </span>
                </h1>

                <p className="text-balance text-muted-foreground mb-8 max-w-2xl leading-relaxed">
                    Discover how COINjecture&apos;s utility-based blockchain transforms computational work into verifiable value.
                    Connect with our team to explore enterprise partnerships, research collaborations, and onboarding options.
                </p>

                <Button className="max-w-[12rem] w-full">
                    Schedule a Call
                </Button>
            </div>
        </section>
    )
}

export function ContactSection() {
    const CONTACT_INFO = [
        {
            label: "Email",
            value: "hello@coinjecture.io",
            icon: "✉️",
        },
        {
            label: "Phone",
            value: "+1 (555) 123-4567",
            icon: "📞",
        },
        {
            label: "Enterprise",
            value: "enterprise@coinjecture.io",
            icon: "🏢",
        },
    ]

    return (
        <section className="space-y-10 py-14 sm:py-20 bg-card/30">
            <div className="mx-auto container px-4">
                <div className="mb-12">
                    <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-4 flex items-center gap-2">
                        Get Started Today
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        Ready to access computational-grade datasets? Reach out for onboarding, enterprise pricing, or research
                        partnerships.
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3">
                    {CONTACT_INFO.map((item) => (
                        <a
                            key={item.label}
                            href={
                                item.label === "Email"
                                    ? `mailto:${item.value}`
                                    : item.label === "Phone"
                                        ? `tel:${item.value}`
                                        : `mailto:${item.value}`
                            }
                            className="group rounded-2xl border border-border bg-card/60 backdrop-blur p-6 shadow-lg transition-all duration-300 hover:bg-card/80 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
                        >
                            <dt className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">
                                {item.label}
                            </dt>
                            <dd className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                {item.value}
                            </dd>
                            <div className="mt-4 text-3xl opacity-60 group-hover:opacity-100 transition-opacity">{item.icon}</div>
                        </a>
                    ))}
                </div>

                {/* Additional info */}
                <div className="mt-12 rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 to-accent/5 p-8">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Why COINjecture?</h3>
                    <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-3">
                            <span className="text-accent text-xl mt-1">✓</span>
                            <span>Verifiable computational work through NP-Complete problem solving</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-accent text-xl mt-1">✓</span>
                            <span>Emergent tokenomics adapting to real-world network behavior</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-accent text-xl mt-1">✓</span>
                            <span>Distributed participation with hardware-class-relative competition</span>
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    )
}

const BookCallPage = () => {
    return (
        <main className="min-h-screen bg-background">
            <BookCallHero />
            <ContactSection />
            <Footer />
        </main>
    )
}

export default BookCallPage;