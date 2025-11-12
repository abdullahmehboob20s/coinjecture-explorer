"use client"


import React, { useCallback, useEffect, useMemo, useState } from 'react';

const API_BASES = ['https://api.coinjecture.com', 'http://167.172.213.70:12346'];
const API_TIMEOUT = 25000;

const addCacheBuster = (url: any) => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}cb=${Date.now()}`;
};

const fetchWithTimeout = async (url: any, options: any = {}) => {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), API_TIMEOUT) : null;

    try {
        const response = await fetch(addCacheBuster(url), {
            ...options,
            signal: controller?.signal,
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                Pragma: 'no-cache',
                Expires: '0',
                ...options.headers,
            },
        });

        if (!response.ok) {
            let message = `HTTP ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                if (errorData?.message) {
                    message = errorData.message;
                }
            } catch (_err) {
                /* ignore parse error */
            }
            throw new Error(message);
        }

        return response.json();
    } finally {
        if (controller && timeoutId) {
            clearTimeout(timeoutId);
        }
    }
};

const fetchJSON = async (path: string, options = {}) => {
    let lastError = null;
    for (const base of API_BASES) {
        const url = path.startsWith('http') ? path : `${base}${path}`;
        try {
            // eslint-disable-next-line no-await-in-loop
            const result = await fetchWithTimeout(url, options);
            return result;
        } catch (error) {
            lastError = error;
        }
    }
    throw lastError ?? new Error('All API endpoints failed');
};

const api = {
    getMetricsDashboard: () => fetchJSON('/v1/metrics/dashboard'),
    getLatestBlock: () => fetchJSON('/v1/data/block/latest'),
    healthCheck: () => fetchJSON('/health'),
    getPeers: () => fetchJSON('/v1/metrics/dashboard'),
};

const DATA_PRODUCTS = [
    {
        title: 'Computational Complexity Datasets',
        description:
            'CSV/JSON files containing problem sizes, solve times, memory usage, algorithm performance metrics, and energy consumption data from real blockchain computations.',
        specs: [
            { label: 'Format', value: 'CSV, JSON, Parquet' },
            { label: 'Records', value: '1,000+ per dataset' },
            { label: 'Example', value: 'subset_sum_20_items.csv' },
        ],
    },
    {
        title: 'IPFS Computational Proofs',
        description:
            'Raw blockchain data including problem definitions, solution paths, verification proofs, and complete computational traces stored on IPFS.',
        specs: [
            { label: 'Format', value: 'JSON with IPFS hashes' },
            { label: 'Verification', value: 'Ed25519 signatures' },
            { label: 'Example', value: 'QmXxXxXx.../proof_bundle.json' },
        ],
    },
    {
        title: 'Mining Efficiency Data',
        description:
            'Performance metrics including hash rates, energy consumption, CPU utilization, memory usage, and optimization patterns from real mining operations.',
        specs: [
            { label: 'Format', value: 'CSV with time series' },
            { label: 'Sessions', value: '500+ mining sessions' },
            { label: 'Example', value: 'mining_efficiency_2024.csv' },
        ],
    },
    {
        title: 'Algorithm Benchmark Data',
        description:
            'Comparative analysis across brute force, dynamic programming, and greedy algorithms, including performance across problem sizes and optimization strategies.',
        specs: [
            { label: 'Format', value: 'JSON with comparisons' },
            { label: 'Algorithms', value: '3+ algorithm types' },
            { label: 'Example', value: 'algorithm_benchmarks.json' },
        ],
    },
];

const QUALITY_CARDS = [
    {
        title: 'Blockchain-Verified Accuracy',
        body: 'Every data point is cryptographically verified and stored on-chain. No synthetic or simulated data.',
        detail: 'Verification: Ed25519 signatures on every computational result',
    },
    {
        title: 'Complete Metadata',
        body: 'Each record includes timestamp, problem type, size, solve time, memory usage, CPU cycles, energy consumption, and algorithm used.',
        detail: 'Fields: 15+ data points per computational record',
    },
    {
        title: 'Real-Time Updates',
        body: 'Data updates with every new block mined. Live API access provides the latest computational results.',
        detail: 'Frequency: Updates every 2-5 minutes during active mining',
    },
    {
        title: 'Research-Grade Format',
        body: 'Provided in CSV, JSON, and Parquet with complete documentation and schema definitions.',
        detail: 'Formats: CSV, JSON, Parquet with full schema documentation',
    },
    {
        title: 'IPFS Immutability',
        body: 'All computational proofs are stored on IPFS with content-addressed hashes for integrity and availability.',
        detail: 'Storage: IPFS with content-addressed integrity verification',
    },
    {
        title: 'Exclusive Dataset',
        body: 'Only source of real-world computational complexity data from a working computational consensus blockchain.',
        detail: 'Uniqueness: First-of-its-kind computational consensus data',
    },
];

const SAMPLE_DOWNLOADS = [
    {
        title: 'Computational Data Sample',
        description: 'CSV file with 100 records of subset sum problem solutions.',
        href: './data/samples/computational_data_sample.csv',
        cta: 'Download CSV',
    },
    {
        title: 'IPFS Proof Sample',
        description: 'JSON file with complete computational proof and metadata.',
        href: './data/samples/ipfs_sample_1.json',
        cta: 'Download JSON',
    },
];

const CONTACT_INFO = [
    { label: 'Email', value: 'admin@coinjecture.com' },
    { label: 'Username', value: 'COINjecture' },
    { label: 'API Endpoint', value: 'http://167.172.213.70:12346' },
];

const formatNumber = (value: number, fallback = '0') => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return fallback;
    }
    const numeric = Number(value);
    return Number.isInteger(numeric)
        ? numeric.toLocaleString()
        : numeric.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const resolveTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const millis = timestamp > 1e12 ? timestamp : timestamp * 1000;
    const date = new Date(millis);
    if (Number.isNaN(date.getTime())) return 'Unknown';
    return date.toLocaleString();
};

const MarketplaceComponent = () => {
    const [stats, setStats] = useState({
        totalBlocks: 'Loading...',
        activeCids: 'Loading...',
        avgComplexity: 'Loading...',
        lastBlockTime: 'Loading...',
    });
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [apiOutput, setApiOutput] = useState('Click a button to test the API...');

    const computeDerivedStats = useCallback((data: any) => {
        if (!data) return null;

        const blockchain = data.blockchain ?? {};
        const recentTx = Array.isArray(data.recent_transactions) ? data.recent_transactions : [];

        const totalBlocks =
            blockchain.validated_blocks ??
            blockchain.blocks ??
            data.validated_blocks ??
            data.total_blocks ??
            recentTx.length ??
            0;

        const uniqueCids = new Set();
        recentTx.forEach((tx: any) => {
            if (tx?.cid) uniqueCids.add(tx.cid);
        });
        if (Array.isArray(blockchain.cids)) {
            blockchain.cids.forEach((cid: any) => {
                if (cid) uniqueCids.add(cid);
            });
        }

        let totalComplexity = 0;
        let complexityCount = 0;
        recentTx.forEach((tx: any) => {
            if (tx?.work_score && !Number.isNaN(Number(tx.work_score))) {
                totalComplexity += Number(tx.work_score);
                complexityCount += 1;
            }
        });
        if (blockchain.avg_complexity && !Number.isNaN(Number(blockchain.avg_complexity))) {
            totalComplexity += Number(blockchain.avg_complexity);
            complexityCount += 1;
        }

        const avgComplexity =
            complexityCount > 0
                ? (totalComplexity / complexityCount).toFixed(2)
                : blockchain.avg_complexity ??
                data.avg_complexity ??
                data.average_complexity ??
                '0';

        let lastTimestamp = null;
        if (recentTx.length > 0) {
            lastTimestamp = recentTx[0]?.timestamp ?? recentTx[0]?.time;
        } else if (data.last_update) {
            lastTimestamp = data.last_update;
        } else if (data.timestamp) {
            lastTimestamp = data.timestamp;
        }

        return {
            totalBlocks,
            activeCids: uniqueCids.size || blockchain.active_cids || data.active_cids || '0',
            avgComplexity,
            lastBlockTime: resolveTimestamp(lastTimestamp),
            recentTransactions: recentTx.slice(0, 6),
        };
    }, []);

    const loadMarketplaceData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const metrics = await api.getMetricsDashboard();
            const derived = computeDerivedStats(metrics?.data ?? metrics);
            if (derived) {
                setStats({
                    totalBlocks: formatNumber(derived.totalBlocks),
                    activeCids: formatNumber(derived.activeCids),
                    avgComplexity: formatNumber(derived.avgComplexity),
                    lastBlockTime: derived.lastBlockTime,
                });
                setRecentTransactions(derived.recentTransactions);
                return;
            }
            throw new Error('Metrics response missing data');
        } catch (primaryError) {
            try {
                const latestBlock = await api.getLatestBlock();
                const blockNumber =
                    latestBlock?.block_number ??
                    latestBlock?.index ??
                    latestBlock?.height ??
                    0;
                setStats({
                    totalBlocks: formatNumber(blockNumber),
                    activeCids: 'N/A',
                    avgComplexity: 'N/A',
                    lastBlockTime: resolveTimestamp(latestBlock?.timestamp ?? latestBlock?.time),
                });
                setRecentTransactions([]);
                setError(
                    'Live metrics unavailable. Showing latest block information as a fallback.' as any,
                );
            } catch (fallbackError) {
                setStats({
                    totalBlocks: 'API Unavailable',
                    activeCids: 'API Unavailable',
                    avgComplexity: 'API Unavailable',
                    lastBlockTime: 'API Unavailable',
                });
                setRecentTransactions([]);
                setError(
                    `Unable to load marketplace data: ${(fallbackError as any)?.message ?? (primaryError as any)?.message}` as any,
                );
            }
        } finally {
            setLoading(false);
        }
    }, [computeDerivedStats]);

    useEffect(() => {
        loadMarketplaceData();
    }, [loadMarketplaceData]);

    const handleApiDemo = useCallback(async (type: string) => {
        try {
            setApiOutput('Loading...');
            if (type === 'metrics') {
                const metrics = await api.getMetricsDashboard();
                setApiOutput(JSON.stringify(metrics, null, 2));
            } else if (type === 'blocks') {
                const block = await api.getLatestBlock();
                setApiOutput(JSON.stringify(block, null, 2));
            } else if (type === 'peers') {
                const metrics = await api.getPeers();
                const peers = metrics?.data?.network ?? metrics?.network ?? {};
                setApiOutput(JSON.stringify(peers, null, 2));
            } else if (type === 'health') {
                const health = await api.healthCheck();
                setApiOutput(JSON.stringify(health, null, 2));
            } else {
                setApiOutput('Unknown demo action');
            }
        } catch (demoError) {
            setApiOutput(`Error: ${(demoError as any).message}`);
        }
    }, []);

    const transactionList = useMemo(
        () =>
            recentTransactions.map((tx: any) => ({
                block: tx?.block ?? tx?.block_number ?? tx?.height ?? 'N/A',
                hash: tx?.hash ?? tx?.block_hash ?? 'N/A',
                miner:
                    tx?.miner ??
                    tx?.miner_short ??
                    tx?.miner_address ??
                    tx?.address ??
                    'Unknown',
                workScore: tx?.work_score ?? tx?.workScore ?? '—',
                capacity: tx?.capacity ?? tx?.reward ?? '—',
            })),
        [recentTransactions],
    );

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="container mx-auto space-y-16 pt-14 pb-32">
                <header className="text-center space-y-4">
                    <p className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-1 text-sm font-semibold text-purple-300">
                        🏪 COINjecture Data Marketplace v3.16.1
                    </p>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
                        Access premium computational research data from the world&apos;s first computational consensus blockchain.
                    </h1>
                    <p className="text-slate-400 max-w-3xl mx-auto">
                        Unlock verified compute datasets, IPFS proofs, mining telemetry, and benchmark data generated by the COINjecture network. Designed for researchers, quants, and enterprise data teams.
                    </p>
                </header>

                <section className="bg-slate-900/60 border border-slate-800 rounded-3xl shadow-xl shadow-purple-900/20 p-8 space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-2xl font-semibold text-white">📊 Live Data Statistics</h2>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={loadMarketplaceData}
                                className="inline-flex items-center gap-2 rounded-full border border-purple-500/50 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-200 hover:bg-purple-500/20 transition-colors"
                            >
                                🔄 Refresh
                            </button>
                            {loading && (
                                <span className="text-xs text-slate-400 uppercase tracking-wide">
                                    Updating...
                                </span>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-200">
                            {error}
                        </div>
                    )}

                    <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
                            <dt className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                                Total Blocks
                            </dt>
                            <dd className="mt-2 text-3xl font-bold text-white">{stats.totalBlocks}</dd>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
                            <dt className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                                Active CIDs
                            </dt>
                            <dd className="mt-2 text-3xl font-bold text-white">{stats.activeCids}</dd>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
                            <dt className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                                Avg Complexity
                            </dt>
                            <dd className="mt-2 text-3xl font-bold text-white">{stats.avgComplexity}</dd>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
                            <dt className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                                Last Block
                            </dt>
                            <dd className="mt-2 text-lg font-semibold text-white">{stats.lastBlockTime}</dd>
                        </div>
                    </dl>

                    {transactionList.length > 0 && (
                        <div className="pt-6 border-t border-slate-800">
                            <h3 className="text-lg font-semibold text-white mb-4">
                                📋 Recent Transactions (Last 6 Blocks)
                            </h3>
                            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
                                <table className="min-w-full divide-y divide-slate-800 text-sm">
                                    <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wide text-xs">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 text-left font-semibold">Block</th>
                                            <th scope="col" className="px-4 py-3 text-left font-semibold">Hash</th>
                                            <th scope="col" className="px-4 py-3 text-left font-semibold">Miner</th>
                                            <th scope="col" className="px-4 py-3 text-left font-semibold">Work Score</th>
                                            <th scope="col" className="px-4 py-3 text-left font-semibold">Capacity</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800 text-slate-300">
                                        {transactionList.map((tx) => (
                                            <tr key={`${tx.block}-${tx.hash}`}>
                                                <td className="px-4 py-3 font-mono text-purple-300">{tx.block}</td>
                                                <td className="px-4 py-3 font-mono text-xs break-all">{tx.hash}</td>
                                                <td className="px-4 py-3 font-mono text-xs break-all">{tx.miner}</td>
                                                <td className="px-4 py-3">{formatNumber(tx.workScore, '0')}</td>
                                                <td className="px-4 py-3">{formatNumber(tx.capacity, 'N/A')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </section>

                <section className="space-y-6">
                    <h2 className="text-2xl font-semibold text-white">🔬 Research Data Products</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        {DATA_PRODUCTS.map((product) => (
                            <article
                                key={product.title}
                                className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg shadow-purple-900/10"
                            >
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-white">{product.title}</h3>
                                    <p className="text-sm leading-6 text-slate-300">{product.description}</p>
                                    <dl className="grid gap-4 text-sm text-slate-300">
                                        {product.specs.map((spec) => (
                                            <div key={spec.label} className="flex flex-col">
                                                <dt className="text-xs uppercase tracking-wide text-slate-500">
                                                    {spec.label}:
                                                </dt>
                                                <dd className="font-medium text-purple-200 font-mono break-all">
                                                    {spec.value}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="space-y-6">
                    <h2 className="text-2xl font-semibold text-white">
                        🔐 Data Quality &amp; Technical Specifications
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {QUALITY_CARDS.map((card) => (
                            <article
                                key={card.title}
                                className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-purple-900/10"
                            >
                                <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                                <p className="mt-3 text-sm leading-6 text-slate-300">{card.body}</p>
                                <p className="mt-4 text-xs uppercase tracking-wide text-purple-200 bg-purple-500/10 inline-flex px-3 py-1 rounded-full border border-purple-500/30">
                                    {card.detail}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="space-y-6">
                    <h2 className="text-2xl font-semibold text-white">📥 Download Sample Data</h2>
                    <p className="text-slate-400">
                        Try before you buy — download sample datasets to experience our data quality.
                    </p>
                    <div className="grid gap-6 md:grid-cols-2">
                        {SAMPLE_DOWNLOADS.map((sample) => (
                            <article
                                key={sample.title}
                                className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-purple-900/10"
                            >
                                <h3 className="text-lg font-semibold text-white">{sample.title}</h3>
                                <p className="mt-3 text-sm text-slate-300">{sample.description}</p>
                                <a
                                    href={sample.href}
                                    download
                                    className="mt-5 inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-100 hover:bg-purple-500/20 transition-colors"
                                >
                                    {sample.cta} →
                                </a>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="space-y-6">
                    <h2 className="text-2xl font-semibold text-white">🔌 Live API Demo</h2>
                    <p className="text-slate-400">
                        Test our primary API endpoints with real-time data directly from the COINjecture network.
                    </p>
                    <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
                        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 flex gap-4">
                            <button
                                type="button"
                                onClick={() => handleApiDemo('metrics')}
                                className="rounded border border-purple-500/40 bg-purple-500/20 px-4 py-2 text-sm font-semibold text-purple-100 hover:bg-purple-500/30 transition-colors"
                            >
                                Get Metrics
                            </button>
                            <button
                                type="button"
                                onClick={() => handleApiDemo('blocks')}
                                className="rounded border border-purple-500/40 bg-purple-500/20 px-4 py-2 text-sm font-semibold text-purple-100 hover:bg-purple-500/30 transition-colors"
                            >
                                Get Latest Block
                            </button>
                            <button
                                type="button"
                                onClick={() => handleApiDemo('peers')}
                                className="rounded border border-purple-500/40 bg-purple-500/20 px-4 py-2 text-sm font-semibold text-purple-100 hover:bg-purple-500/30 transition-colors"
                            >
                                Get Peers
                            </button>
                            <button
                                type="button"
                                onClick={() => handleApiDemo('health')}
                                className="rounded border border-purple-500/40 bg-purple-500/20 px-4 py-2 text-sm font-semibold text-purple-100 hover:bg-purple-500/30 transition-colors"
                            >
                                Health Check
                            </button>
                        </div>
                        <div className="rounded-lg border border-slate-800 bg-black/70 p-6 font-mono text-xs text-slate-200 overflow-x-auto max-h-96">
                            <pre className="whitespace-pre-wrap">{apiOutput}</pre>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default MarketplaceComponent;

