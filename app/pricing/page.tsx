const PRICING_TIERS = [
    {
        name: 'Basic',
        beans: '5,000 $BEANS',
        usd: '$99 USD',
        features: [
            '✅ 1,000 computational records',
            '✅ CSV & JSON formats',
            '✅ Basic complexity metrics',
            '✅ 30-day access',
            '✅ Email support',
        ],
    },
    {
        name: 'Professional',
        beans: '25,000 $BEANS',
        usd: '$299 USD',
        features: [
            '✅ 10,000 computational records',
            '✅ All formats (CSV, JSON, Parquet)',
            '✅ Complete IPFS proofs',
            '✅ Real-time API access',
            '✅ 90-day access',
            '✅ Priority support',
        ],
        featured: true,
    },
    {
        name: 'Enterprise',
        beans: '100,000 $BEANS',
        usd: '$999 USD',
        features: [
            '✅ Unlimited records',
            '✅ All formats + custom exports',
            '✅ Complete IPFS archive',
            '✅ Live data streaming',
            '✅ 1-year access',
            '✅ Dedicated support',
            '✅ Custom data processing',
        ],
    },
];

const PricingPage = () => {
    return <div className="container mx-auto px-4 pt-8 pb-28">
        <section className="space-y-12">
            <header className="text-center space-y-4">
                <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary text-balance">
                    🔥 Limited Time: Save 95% with $BEANS tokens!
                </p>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
                    Flexible Pricing for Every Data Need
                </h1>
                <p className="text-slate-400 max-w-3xl mx-auto">
                    Access verified compute datasets, IPFS proofs, mining telemetry, and benchmark intelligence powered by the COINjecture network.
                    Built for researchers, quantitative analysts, and enterprise data teams.
                </p>
            </header>

            <div className="grid gap-6 md:grid-cols-3">
                {PRICING_TIERS.map((tier) => (
                    <article
                        key={tier.name}
                        className={`flex flex-col rounded-lg border p-6 transition-transform hover:-translate-y-1 ${tier.featured
                            ? 'border-primary/80 bg-primary/15'
                            : 'border-secondary bg-secondary/60'
                            }`}
                    >
                        <main className="flex-1">
                            {tier.featured && (
                                <p className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                                    Most Popular
                                </p>
                            )}
                            <h3 className="mt-4 text-xl font-semibold text-white">{tier.name}</h3>
                            <div className="mt-3 text-sm text-primary space-y-1">
                                <p className="text-2xl font-bold text-white">{tier.beans}</p>
                                <p>{tier.usd}</p>
                            </div>
                            <ul className="mt-5 space-y-2 text-sm text-slate-200">
                                {tier.features.map((feature) => (
                                    <li key={feature}>{feature}</li>
                                ))}
                            </ul>
                        </main>

                        <button
                            type="button"
                            className={`mt-6 w-full rounded-full px-4 py-2 text-sm font-semibold transition-colors ${tier.featured
                                ? 'bg-white text-black hover:bg-slate-100'
                                : 'bg-secondary hover:bg-secondary/80'
                                }`}
                        >
                            Choose {tier.name}
                        </button>
                    </article>
                ))}
            </div>
        </section>

    </div>
}

export default PricingPage