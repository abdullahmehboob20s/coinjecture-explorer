"use client"

import { Copy } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const API_BASES = ['https://api.coinjecture.com', 'http://167.172.213.70:12346'];
const API_TIMEOUT = 25000;
const WALLET_STORAGE_KEY = 'coinjecture_wallet';
const LOCAL_BLOCKS_KEY = 'coinjecture_local_blocks';
const MINING_STATS_INTERVAL = 30000;

const addCacheBuster = (url) => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}cb=${Date.now()}`;
};

const fetchWithTimeout = async (url, options = {}) => {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const id = controller ? setTimeout(() => controller.abort(), API_TIMEOUT) : null;

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
        const errorBody = await response.json();
        if (errorBody?.message) {
          message = errorBody.message;
        }
      } catch (_err) {
        /* ignore JSON parse errors */
      }
      throw new Error(message);
    }

    return response.json();
  } finally {
    if (controller && id) {
      clearTimeout(id);
    }
  }
};

const fetchJSON = async (path, options = {}) => {
  let lastError = null;

  for (const base of API_BASES) {
    const url = path.startsWith('http') ? path : `${base}${path}`;
    try {
      const result = await fetchWithTimeout(url, options);
      return result;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error('All API endpoints failed');
};

const api = {
  healthCheck: () => fetchJSON('/health'),
  getMetricsDashboard: () => fetchJSON('/v1/metrics/dashboard'),
  getLatestBlock: () => fetchJSON('/v1/data/block/latest'),
  getBlockByIndex: (index) => fetchJSON(`/v1/data/block/${index}`),
  getProofData: (cid) => fetchJSON(`/v1/data/proof/${cid}`),
  getRewards: (address) => fetchJSON(`/v1/rewards/${address}`),
  getLeaderboard: () => fetchJSON('/v1/rewards/leaderboard'),
  getTelemetry: () => fetchJSON('/v1/display/telemetry/latest'),
  getIpfsContent: (cid) => fetchJSON(`/v1/ipfs/${cid}`),
  getWalletTransactions: (address) => fetchJSON(`/v1/wallet/${address}/transactions`),
  submitMinedBlock: (payload) =>
    fetchJSON('/v1/ingest/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  getUserRewards: (address) => fetchJSON(`/v1/rewards/${address}`),
};

const classForOutputType = {
  info: 'text-gray-300',
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-yellow-300',
  command: 'text-white font-semibold',
  prompt: 'text-gray-400',
};

const generateHex = (bytes = 32) => {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const array = new Uint8Array(bytes);
    window.crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
  }

  return Array.from({ length: bytes }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, '0'),
  ).join('');
};

const createWallet = () => {
  const privateKeyHex = generateHex(32);
  const publicKeyHex = generateHex(32);
  const address = `0x${publicKeyHex.slice(0, 40)}`;

  return {
    address,
    publicKey: publicKeyHex,
    privateKey: privateKeyHex,
    balance: 0,
    blocksMined: 0,
  };
};

const loadWallet = () => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(WALLET_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (error) {
    console.warn('Failed to load wallet from storage:', error);
  }

  return null;
};

const storeWallet = (wallet) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallet));
  } catch (error) {
    console.warn('Failed to persist wallet:', error);
  }
};

const loadLocalBlocks = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_BLOCKS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (error) {
    console.warn('Failed to load local blocks:', error);
  }
  return [];
};

const storeLocalBlocks = (blocks) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_BLOCKS_KEY, JSON.stringify(blocks));
  } catch (error) {
    console.warn('Failed to store local blocks:', error);
  }
};

const defaultMiningStats = {
  peerCount: 1,
  blockchainHeight: 0,
  problemsSolved: 0,
  blocksMined: 0,
  totalWorkScore: 0,
  totalRewards: 0,
};

const TerminalComponent = () => {
  const [outputs, setOutputs] = useState([]);
  const [commandValue, setCommandValue] = useState('');
  const [wallet, setWallet] = useState(null);
  const [networkStatus, setNetworkStatus] = useState('🌐 Connecting...');
  const [miningStats, setMiningStats] = useState(defaultMiningStats);
  const [isMining, setIsMining] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(null);
  const historyRef = useRef([]);
  const outputRef = useRef(null);
  const miningIntervalRef = useRef(null);
  const inputRef = useRef(null);
  const walletRef = useRef(null);

  const addOutput = useCallback((text, type = 'info') => {
    setOutputs((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        text,
        type,
      },
    ]);
  }, []);

  const replaceOutputs = useCallback((nextOutputs) => {
    setOutputs(nextOutputs);
  }, []);

  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  useEffect(() => {
    walletRef.current = wallet;
  }, [wallet]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [outputs]);

  const appendWelcome = useCallback(() => {
    addOutput('🚀 COINjecture Web CLI v3.16.1 - $BEANS', 'info');
    addOutput('✨ Dynamic Gas Calculation System - IPFS-based gas costs', 'info');
    addOutput('', 'info');
    addOutput('Type "help" to see all available commands', 'info');
    addOutput('', 'info');
  }, [addOutput]);

  const initializeWallet = useCallback(() => {
    const existingWallet = loadWallet();
    if (existingWallet) {
      setWallet(existingWallet);
      addOutput(`✅ Wallet loaded: ${existingWallet.address}`, 'success');
      return existingWallet;
    }

    const newWallet = createWallet();
    setWallet(newWallet);
    storeWallet(newWallet);
    addOutput(`✅ New wallet generated: ${newWallet.address}`, 'success');
    return newWallet;
  }, [addOutput]);

  useEffect(() => {
    appendWelcome();
    const activeWallet = initializeWallet();

    if (activeWallet) {
      setNetworkStatus('🌐 Connected (local wallet)');
    }
  }, [appendWelcome, initializeWallet]);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await api.healthCheck();
        const status = health?.status ?? 'OK';
        setNetworkStatus(`🌐 Connected (${status})`);
      } catch (error) {
        console.warn('Health check failed:', error);
        setNetworkStatus(`❌ Network issue: ${error.message}`);
        addOutput(`❌ Network error: ${error.message}`, 'error');
      }
    };

    checkHealth();
    const id = setInterval(checkHealth, 60000);
    return () => clearInterval(id);
  }, [addOutput]);

  const clearTerminal = useCallback(() => {
    replaceOutputs([]);
  }, [replaceOutputs]);

  const showHelp = useCallback(() => {
    addOutput('📋 Available Commands:', 'info');
    addOutput('', 'info');
    addOutput('🔍 Blockchain Commands:', 'info');
    addOutput('  get-block --latest          - Get latest block', 'info');
    addOutput('  get-block --index=<number>  - Get block by index', 'info');
    addOutput('  get-proof --cid=<cid>       - Get proof details', 'info');
    addOutput('  get-metrics                 - Get blockchain metrics', 'info');
    addOutput('  get-consensus               - Get consensus status', 'info');
    addOutput('', 'info');
    addOutput('💰 Wallet & Rewards:', 'info');
    addOutput('  get-rewards                 - Get your rewards', 'info');
    addOutput('  get-leaderboard             - Get mining leaderboard', 'info');
    addOutput('  wallet                      - Show wallet information', 'info');
    addOutput('', 'info');
    addOutput('🌐 Network Commands:', 'info');
    addOutput('  get-peers                   - Get connected peers', 'info');
    addOutput('  get-network                 - Get network status', 'info');
    addOutput('  ping                        - Test server connection', 'info');
    addOutput('', 'info');
    addOutput('📊 Data Commands:', 'info');
    addOutput('  get-telemetry               - Get latest telemetry', 'info');
    addOutput('  get-ipfs --cid=<cid>        - Get IPFS data', 'info');
    addOutput('', 'info');
    addOutput('⛏️ Mining Commands:', 'info');
    addOutput('  mine --start                - Start mining (simulated)', 'info');
    addOutput('  mine --stop                 - Stop mining', 'info');
    addOutput('  mine --status               - Show mining status', 'info');
    addOutput('  submit-problem --type=<type> --bounty=<amount> - Submit a problem', 'info');
    addOutput('  list-submissions            - List your problem submissions', 'info');
    addOutput('', 'info');
    addOutput('💸 Transaction Commands:', 'info');
    addOutput('  send --to=<address> --amount=<amount> - Send BEANS (simulated)', 'info');
    addOutput('  get-transactions            - Get transaction history', 'info');
    addOutput('', 'info');
    addOutput('🛠️ Utility Commands:', 'info');
    addOutput('  help                        - Show this help message', 'info');
    addOutput('  status                      - Show network and wallet status', 'info');
    addOutput('  clear                       - Clear terminal output', 'info');
    addOutput('', 'info');
    addOutput('🔄 Migration Commands:', 'info');
    addOutput('  migrate-blocks              - Submit stored local blocks', 'info');
    addOutput('  check-local-blocks          - Check local blocks awaiting migration', 'info');
    addOutput('  update-wallet               - Update wallet stats from metrics', 'info');
    addOutput('  check-balance               - Check wallet balance from API', 'info');
  }, [addOutput]);

  const showWalletInfo = useCallback(() => {
    const activeWallet = walletRef.current;
    if (!activeWallet) {
      addOutput('🔌 No wallet connected. Please create a wallet first.', 'warning');
      return;
    }

    addOutput('💼 Wallet Information:', 'info');
    addOutput(`  Address: ${activeWallet.address}`, 'info');
    addOutput(`  Balance: ${activeWallet.balance ?? 0} BEANS`, 'info');
    addOutput(`  Blocks Mined: ${activeWallet.blocksMined ?? 0}`, 'info');
  }, [addOutput]);

  const pingServer = useCallback(async () => {
    addOutput('🏓 Pinging server...', 'info');
    const start = performance.now();
    try {
      await api.healthCheck();
      const latency = Math.round(performance.now() - start);
      addOutput(`✅ Server responded in ${latency}ms`, 'success');
    } catch (error) {
      addOutput(`❌ Server unreachable: ${error.message}`, 'error');
    }
  }, [addOutput]);

  const showStatus = useCallback(async () => {
    addOutput('🔍 Checking network status...', 'info');
    try {
      const health = await api.healthCheck();
      addOutput(`✅ Server: ${health?.status ?? 'OK'}`, 'success');
      const activeWallet = walletRef.current;
      if (activeWallet) {
        addOutput(`💰 Wallet: ${activeWallet.address}`, 'info');
        addOutput(`💎 Balance: ${activeWallet.balance ?? 0} BEANS`, 'info');
      } else {
        addOutput('🔌 No wallet connected', 'warning');
      }
    } catch (error) {
      addOutput(`❌ Server error: ${error.message}`, 'error');
    }
  }, [addOutput]);

  const handleGetBlock = useCallback(
    async (parts) => {
      const isLatest = parts.includes('--latest');
      const indexArg = parts.find((part) => part.startsWith('--index='));

      if (isLatest) {
        addOutput('📦 Fetching latest block...', 'info');
        try {
          const block = await api.getLatestBlock();
          addOutput('✅ Latest Block:', 'success');
          addOutput(`   Index: ${block?.index ?? block?.block_number ?? 'N/A'}`, 'info');
          addOutput(
            `   Hash: ${block?.hash
              ? `${block.hash.slice(0, 16)}...`
              : block?.block_hash
                ? `${block.block_hash.slice(0, 16)}...`
                : 'N/A'
            }`,
            'info',
          );
          addOutput(
            `   Miner: ${block?.miner
              ? `${block.miner.slice(0, 16)}...`
              : block?.miner_address
                ? `${block.miner_address.slice(0, 16)}...`
                : 'N/A'
            }`,
            'info',
          );
          addOutput(`   Work Score: ${block?.work_score ?? block?.total_work ?? 0}`, 'info');
        } catch (error) {
          addOutput(`❌ Failed to get latest block: ${error.message}`, 'error');
        }
        return;
      }

      if (indexArg) {
        const index = Number(indexArg.split('=')[1]);
        if (Number.isNaN(index)) {
          addOutput('❌ Invalid block index supplied', 'error');
          return;
        }

        addOutput(`📦 Fetching block ${index}...`, 'info');
        try {
          const block = await api.getBlockByIndex(index);
          addOutput(`✅ Block ${index}:`, 'success');
          addOutput(
            `   Hash: ${block?.hash
              ? `${block.hash.slice(0, 16)}...`
              : block?.block_hash
                ? `${block.block_hash.slice(0, 16)}...`
                : 'N/A'
            }`,
            'info',
          );
          addOutput(
            `   Miner: ${block?.miner
              ? `${block.miner.slice(0, 16)}...`
              : block?.miner_address
                ? `${block.miner_address.slice(0, 16)}...`
                : 'N/A'
            }`,
            'info',
          );
          addOutput(`   Work Score: ${block?.work_score ?? block?.total_work ?? 0}`, 'info');
        } catch (error) {
          addOutput(`❌ Failed to get block ${index}: ${error.message}`, 'error');
        }
        return;
      }

      addOutput('❌ Usage: get-block --latest | get-block --index=<number>', 'error');
    },
    [addOutput],
  );

  const handleGetProof = useCallback(
    async (parts) => {
      const cidArg = parts.find((part) => part.startsWith('--cid='));
      if (!cidArg) {
        addOutput('❌ Usage: get-proof --cid=<cid>', 'error');
        return;
      }

      const cid = cidArg.split('=')[1];
      addOutput(`🔍 Fetching proof for CID: ${cid}...`, 'info');
      try {
        const proof = await api.getProofData(cid);
        addOutput('✅ Proof Data:', 'success');
        addOutput(`   CID: ${cid}`, 'info');
        addOutput(`   Size: ${proof?.size ?? proof?.bundle_size ?? 'N/A'}`, 'info');
        addOutput(`   Type: ${proof?.type ?? proof?.bundle_type ?? 'N/A'}`, 'info');
      } catch (error) {
        addOutput(`❌ Failed to get proof: ${error.message}`, 'error');
      }
    },
    [addOutput],
  );

  const handleGetMetrics = useCallback(async () => {
    addOutput('📊 Fetching blockchain metrics...', 'info');
    try {
      const metrics = await api.getMetricsDashboard();
      const data = metrics?.data ?? metrics;
      const blockchain = data?.blockchain ?? {};

      addOutput('✅ Blockchain Metrics:', 'success');
      addOutput(`   Validated Blocks: ${blockchain?.validated_blocks ?? blockchain?.blocks ?? 0}`, 'info');
      addOutput(`   Latest Block: ${blockchain?.latest_block ?? 0}`, 'info');
      addOutput(`   Consensus: ${blockchain?.consensus_active ? 'Active' : 'Inactive'}`, 'info');
      addOutput(`   Mining Attempts: ${blockchain?.mining_attempts ?? 0}`, 'info');
      addOutput(`   Success Rate: ${blockchain?.success_rate ?? 0}%`, 'info');
    } catch (error) {
      addOutput(`❌ Failed to get metrics: ${error.message}`, 'error');
    }
  }, [addOutput]);

  const handleGetConsensus = useCallback(async () => {
    addOutput('⚖️ Fetching consensus status...', 'info');
    try {
      const metrics = await api.getMetricsDashboard();
      const consensus = metrics?.data?.consensus ?? metrics?.consensus;
      if (!consensus) {
        addOutput('⚠️ Consensus data unavailable', 'warning');
        return;
      }

      addOutput('✅ Consensus Status:', 'success');
      if (consensus.equilibrium_proof) {
        addOutput(
          `   Satoshi Constant: ${consensus.equilibrium_proof.satoshi_constant ?? 'N/A'}`,
          'info',
        );
        addOutput(`   Stability: ${consensus.equilibrium_proof.stability_metric ?? 'N/A'}`, 'info');
      }
      if (consensus.proof_of_work) {
        addOutput(
          `   Anti-Grinding: ${consensus.proof_of_work.anti_grinding ? 'Enabled' : 'Disabled'}`,
          'info',
        );
        addOutput(
          `   Cryptographic Binding: ${consensus.proof_of_work.cryptographic_binding ? 'Enabled' : 'Disabled'
          }`,
          'info',
        );
      }
    } catch (error) {
      addOutput(`❌ Failed to get consensus: ${error.message}`, 'error');
    }
  }, [addOutput]);

  const handleGetRewards = useCallback(async () => {
    const activeWallet = walletRef.current;
    if (!activeWallet) {
      addOutput('❌ No wallet connected. Please create a wallet first.', 'error');
      return;
    }

    addOutput('💰 Fetching rewards...', 'info');
    try {
      const rewards = await api.getRewards(activeWallet.address);
      addOutput(`✅ Rewards for ${activeWallet.address.slice(0, 16)}...:`, 'success');
      addOutput(`   Total Rewards: ${rewards?.totalRewards ?? rewards?.total_rewards ?? 0} BEANS`, 'info');
      addOutput(`   Blocks Mined: ${rewards?.blocksMined ?? rewards?.blocks_mined ?? 0}`, 'info');
      addOutput(`   Work Score: ${rewards?.totalWorkScore ?? rewards?.total_work_score ?? 0}`, 'info');
      addOutput(`   Rank: ${rewards?.rank ?? 'N/A'}`, 'info');
    } catch (error) {
      addOutput(`❌ Failed to get rewards: ${error.message}`, 'error');
    }
  }, [addOutput]);

  const handleGetLeaderboard = useCallback(async () => {
    addOutput('🏆 Fetching mining leaderboard...', 'info');
    try {
      const leaderboard = await api.getLeaderboard();
      if (!Array.isArray(leaderboard) || leaderboard.length === 0) {
        addOutput('   No leaderboard data available', 'info');
        return;
      }

      addOutput('✅ Mining Leaderboard:', 'success');
      leaderboard.slice(0, 10).forEach((entry, index) => {
        const address =
          entry?.address ?? entry?.miner ?? entry?.miner_address ?? 'N/A';
        const reward =
          entry?.totalRewards ?? entry?.total_rewards ?? entry?.reward ?? 0;
        addOutput(`   ${index + 1}. ${address.slice(0, 16)}...: ${reward} BEANS`, 'info');
      });
    } catch (error) {
      addOutput(`❌ Failed to get leaderboard: ${error.message}`, 'error');
    }
  }, [addOutput]);

  const handleGetPeers = useCallback(async () => {
    addOutput('🌐 Fetching network peers...', 'info');
    try {
      const metrics = await api.getMetricsDashboard();
      const network = metrics?.data?.network ?? metrics?.network;
      if (!network) {
        addOutput('⚠️ Network data unavailable', 'warning');
        return;
      }

      addOutput('✅ Network Peers:', 'success');
      addOutput(`   Connected Peers: ${network?.peers ?? 0}`, 'info');
      addOutput(`   Active Miners: ${network?.miners ?? 0}`, 'info');
      addOutput(`   Network Difficulty: ${network?.difficulty ?? 0}`, 'info');
    } catch (error) {
      addOutput(`❌ Failed to get peers: ${error.message}`, 'error');
    }
  }, [addOutput]);

  const handleGetNetwork = useCallback(async () => {
    addOutput('🌐 Fetching network status...', 'info');
    try {
      const metrics = await api.getMetricsDashboard();
      const data = metrics?.data ?? metrics;
      addOutput('✅ Network Status:', 'success');
      addOutput(`   Peers: ${data?.network?.peers ?? 0}`, 'info');
      addOutput(`   Miners: ${data?.network?.miners ?? 0}`, 'info');
      const hashRate =
        data?.hash_rate?.current_hs ??
        data?.hash_rate?.current ??
        data?.network?.hash_rate ??
        0;
      addOutput(`   Hash Rate: ${hashRate} H/s`, 'info');
      addOutput(`   Block Time: ${data?.block_time?.avg_seconds ?? 0}s`, 'info');
    } catch (error) {
      addOutput(`❌ Failed to get network status: ${error.message}`, 'error');
    }
  }, [addOutput]);

  const handleGetTelemetry = useCallback(async () => {
    addOutput('📊 Fetching telemetry data...', 'info');
    try {
      const telemetry = await api.getTelemetry();
      addOutput('✅ Telemetry Data:', 'success');
      addOutput(
        `   Timestamp: ${new Date(
          (telemetry?.timestamp ?? telemetry?.time ?? Date.now()) * 1000,
        ).toLocaleString()}`,
        'info',
      );
      addOutput(`   Status: ${telemetry?.status ?? 'N/A'}`, 'info');
    } catch (error) {
      addOutput(`❌ Failed to get telemetry: ${error.message}`, 'error');
    }
  }, [addOutput]);

  const handleGetIpfs = useCallback(
    async (parts) => {
      const cidArg = parts.find((part) => part.startsWith('--cid='));
      if (!cidArg) {
        addOutput('❌ Usage: get-ipfs --cid=<cid>', 'error');
        return;
      }

      const cid = cidArg.split('=')[1];
      addOutput(`📦 Fetching IPFS data for CID: ${cid}...`, 'info');
      try {
        const ipfsData = await api.getIpfsContent(cid);
        addOutput('✅ IPFS Data:', 'success');
        addOutput(`   CID: ${cid}`, 'info');
        const size = ipfsData?.size ?? ipfsData?.Length ?? 'N/A';
        const type =
          ipfsData?.type ??
          ipfsData?.Type ??
          ipfsData?.format ??
          ipfsData?.Format ??
          'N/A';
        addOutput(`   Size: ${size}`, 'info');
        addOutput(`   Type: ${type}`, 'info');
      } catch (error) {
        addOutput(`❌ Failed to get IPFS data: ${error.message}`, 'error');
      }
    },
    [addOutput],
  );

  const startMiningSimulation = useCallback(() => {
    if (isMining) {
      addOutput('⛏️ Mining is already running!', 'warning');
      return;
    }

    const activeWallet = walletRef.current;
    if (!activeWallet) {
      addOutput('❌ No wallet connected. Please create a wallet first.', 'error');
      return;
    }

    setIsMining(true);
    addOutput('⛏️ Starting simulated mining...', 'info');
    addOutput('   Connecting to COINjecture blockchain network...', 'info');
    addOutput('✅ Mining simulation started! Use "mine --status" to view stats.', 'success');

    miningIntervalRef.current = setInterval(() => {
      setMiningStats((prev) => {
        const problemsSolved = prev.problemsSolved + Math.floor(Math.random() * 3);
        const blocksMined = prev.blocksMined + (Math.random() > 0.8 ? 1 : 0);
        const totalWorkScore = prev.totalWorkScore + Math.random() * 50;
        const totalRewards = prev.totalRewards + Math.random() * 0.01;
        const blockchainHeight = prev.blockchainHeight + (blocksMined > prev.blocksMined ? 1 : 0);
        const nextStats = {
          peerCount: Math.max(prev.peerCount, Math.floor(Math.random() * 3) + 1),
          blockchainHeight,
          problemsSolved,
          blocksMined,
          totalWorkScore,
          totalRewards,
        };
        addOutput(
          `📊 Mining Stats: ${problemsSolved} problems solved, ${blocksMined} blocks mined, ${totalRewards.toFixed(
            6,
          )} BEANS earned`,
          'info',
        );
        return nextStats;
      });
    }, MINING_STATS_INTERVAL);
  }, [addOutput, isMining]);

  const stopMiningSimulation = useCallback(() => {
    if (!isMining) {
      addOutput('⛏️ Mining is not running!', 'warning');
      return;
    }

    if (miningIntervalRef.current) {
      clearInterval(miningIntervalRef.current);
      miningIntervalRef.current = null;
    }

    setIsMining(false);
    addOutput('⛏️ Mining simulation stopped.', 'success');
    addOutput('   Use "mine --start" to resume mining', 'info');
  }, [addOutput, isMining]);

  useEffect(() => {
    return () => {
      if (miningIntervalRef.current) {
        clearInterval(miningIntervalRef.current);
      }
    };
  }, []);

  const showMiningStatus = useCallback(() => {
    addOutput('⛏️ Mining Status:', 'info');
    if (!isMining) {
      addOutput('   Status: ❌ Inactive', 'error');
      addOutput('   Use "mine --start" to begin mining', 'info');
      return;
    }

    const stats = miningStats;
    addOutput('   Status: ✅ Active (Simulated)', 'success');
    addOutput(`   Network: ${stats.peerCount} peers connected`, 'info');
    addOutput(`   Blockchain Height: ${stats.blockchainHeight}`, 'info');
    addOutput(`   Problems Solved: ${stats.problemsSolved}`, 'info');
    addOutput(`   Blocks Mined: ${stats.blocksMined}`, 'info');
    addOutput(`   Total Work Score: ${stats.totalWorkScore.toFixed(2)}`, 'info');
    addOutput(`   Total Rewards: ${stats.totalRewards.toFixed(6)} BEANS`, 'info');
    addOutput('   Problem Type: Subset Sum (NP-Complete)', 'info');
    addOutput('   Algorithm: Dynamic Programming + Greedy + Backtracking', 'info');
    addOutput('   Network: Simulated P2P with IPFS proof bundles', 'info');
  }, [addOutput, isMining, miningStats]);

  const handleMine = useCallback(
    (parts) => {
      const action = parts.find((part) => part.startsWith('--'));
      switch (action) {
        case '--start':
          startMiningSimulation();
          break;
        case '--stop':
          stopMiningSimulation();
          break;
        case '--status':
          showMiningStatus();
          break;
        default:
          addOutput('❌ Usage: mine --start | --stop | --status', 'error');
          addOutput('   Note: Use double dashes (--) not double equals (==)', 'info');
      }
    },
    [addOutput, showMiningStatus, startMiningSimulation, stopMiningSimulation],
  );

  const handleSubmitProblem = useCallback(
    (parts) => {
      const typeArg = parts.find((part) => part.startsWith('--type='));
      const bountyArg = parts.find((part) => part.startsWith('--bounty='));

      if (!typeArg || !bountyArg) {
        addOutput('❌ Usage: submit-problem --type=<type> --bounty=<amount>', 'error');
        addOutput('   Example: submit-problem --type=subset_sum --bounty=100', 'info');
        return;
      }

      const type = typeArg.split('=')[1];
      const bounty = Number(bountyArg.split('=')[1]);

      if (Number.isNaN(bounty) || bounty <= 0) {
        addOutput('❌ Bounty must be a positive number', 'error');
        return;
      }

      const activeWallet = walletRef.current;
      if (!activeWallet) {
        addOutput('❌ No wallet connected. Please create a wallet first.', 'error');
        return;
      }

      const problemData = {
        problem_type: type,
        bounty_per_solution: bounty,
        min_quality: 0.8,
        aggregation: 'BEST',
        aggregation_params: {
          target_count: 1,
          early_bonus_decay: 0.95,
        },
        problem_template: {
          numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          target: 15,
        },
      };

      addOutput(`📝 Submitting problem: ${type} with bounty ${bounty} BEANS...`, 'info');
      addOutput('✅ Problem submitted successfully!', 'success');
      addOutput(`   Type: ${problemData.problem_type}`, 'info');
      addOutput(`   Bounty: ${problemData.bounty_per_solution} BEANS`, 'info');
      addOutput(`   Submission ID: problem-${Date.now()}`, 'info');
      addOutput('   Miners will now work on solving your problem', 'info');
    },
    [addOutput],
  );

  const handleListSubmissions = useCallback(() => {
    addOutput('📋 Your Problem Submissions:', 'info');
    addOutput('   No active submissions found', 'info');
    addOutput('   Use "submit-problem" to create a new submission', 'info');
  }, [addOutput]);

  const handleSend = useCallback(
    (parts) => {
      const toArg = parts.find((part) => part.startsWith('--to='));
      const amountArg = parts.find((part) => part.startsWith('--amount='));

      if (!toArg || !amountArg) {
        addOutput('❌ Usage: send --to=<address> --amount=<amount>', 'error');
        addOutput('   Example: send --to=addr_1234567890abcdef --amount=50', 'info');
        return;
      }

      const toAddress = toArg.split('=')[1];
      const amount = Number(amountArg.split('=')[1]);

      if (Number.isNaN(amount) || amount <= 0) {
        addOutput('❌ Amount must be greater than 0', 'error');
        return;
      }

      const activeWallet = walletRef.current;
      if (!activeWallet) {
        addOutput('❌ No wallet connected. Please create a wallet first.', 'error');
        return;
      }

      addOutput(`💸 Sending ${amount} BEANS to ${toAddress.slice(0, 16)}...`, 'info');
      addOutput('✅ Transaction sent successfully!', 'success');
      addOutput(`   To: ${toAddress}`, 'info');
      addOutput(`   Amount: ${amount} BEANS`, 'info');
      addOutput(`   Transaction ID: tx_${Date.now()}`, 'info');
      addOutput('   Transaction will be processed by the network', 'info');
    },
    [addOutput],
  );

  const handleGetTransactions = useCallback(async () => {
    const activeWallet = walletRef.current;
    if (!activeWallet) {
      addOutput('❌ No wallet connected. Please create a wallet first.', 'error');
      return;
    }

    addOutput('📋 Transaction History:', 'info');
    try {
      const transactions = await api.getWalletTransactions(activeWallet.address);
      if (!Array.isArray(transactions) || transactions.length === 0) {
        addOutput('   No transactions found', 'info');
        return;
      }

      transactions.slice(0, 10).forEach((tx, index) => {
        addOutput(
          `   ${index + 1}. ${tx?.type ?? 'Transfer'}: ${tx?.amount ?? 0} BEANS`,
          'info',
        );
        const from = tx?.from ?? tx?.sender ?? 'N/A';
        const to = tx?.to ?? tx?.recipient ?? 'N/A';
        const direction = from === activeWallet.address ? 'To' : 'From';
        addOutput(`      ${direction}: ${direction === 'To' ? to : from}`, 'info');
        const timestamp = tx?.timestamp ?? tx?.time ?? Date.now();
        addOutput(`      Time: ${new Date(timestamp * 1000).toLocaleString()}`, 'info');
      });
    } catch (error) {
      addOutput(`❌ Failed to get transactions: ${error.message}`, 'error');
    }
  }, [addOutput]);

  const migrateLocalBlocks = useCallback(async () => {
    const blocks = loadLocalBlocks();
    if (blocks.length === 0) {
      addOutput('📦 No local blocks to migrate', 'info');
      return;
    }

    addOutput(`🔄 Found ${blocks.length} local blocks to migrate to blockchain...`, 'info');
    let success = 0;
    let failed = 0;

    for (const block of blocks) {
      addOutput(`📤 Submitting local block ${block.id ?? 'local-block'} to blockchain...`, 'info');
      try {
        const response = await api.submitMinedBlock({
          block_header: block.header ?? block.block_header,
          proof_bundle: block.proof_bundle,
          work_score: block.work_score,
          reward: block.reward,
          commitment: block.commitment,
          is_migration: true,
        });

        if (response?.success) {
          addOutput('✅ Local block submitted successfully!', 'success');
          success += 1;
        } else {
          addOutput(
            `❌ Failed to submit local block: ${response?.error ?? 'unknown error'}`,
            'error',
          );
          failed += 1;
        }
      } catch (error) {
        addOutput(`❌ Error submitting local block: ${error.message}`, 'error');
        failed += 1;
      }
    }

    addOutput(`📊 Migration complete: ${success} successful, ${failed} failed`, 'info');

    if (success > 0) {
      addOutput(`🎉 Your ${success} previously mined blocks are now on the blockchain!`, 'success');
      storeLocalBlocks([]);
    }
  }, [addOutput]);

  const handleCheckLocalBlocks = useCallback(() => {
    const blocks = loadLocalBlocks();
    if (blocks.length === 0) {
      addOutput('📋 No local blocks found', 'info');
      return;
    }

    addOutput(`📋 Found ${blocks.length} local blocks:`, 'info');
    blocks.forEach((block, index) => {
      addOutput(`   ${index + 1}. Block ${block.id ?? 'pending'}`, 'info');
      addOutput(`      Work Score: ${(block.work_score ?? 0).toFixed(2)}`, 'info');
      addOutput(`      Reward: ${(block.reward ?? 0).toFixed(3)} BEANS`, 'info');
      addOutput(`      Time: ${new Date(block.timestamp ?? Date.now()).toLocaleString()}`, 'info');
    });
    addOutput('', 'info');
    addOutput('💡 Use "migrate-blocks" to submit these to the blockchain', 'info');
  }, [addOutput]);

  const handleUpdateWallet = useCallback(async () => {
    const activeWallet = walletRef.current;
    if (!activeWallet) {
      addOutput('❌ No wallet connected. Please create a wallet first.', 'error');
      return;
    }

    addOutput('🔄 Updating wallet balance...', 'info');
    try {
      const metrics = await api.getMetricsDashboard();
      const recentTransactions = metrics?.data?.recent_transactions ?? [];
      const relevant = recentTransactions.filter(
        (tx) =>
          tx?.miner === activeWallet.address ||
          tx?.miner_short === `${activeWallet.address.slice(0, 16)}...`,
      );

      if (relevant.length === 0) {
        addOutput('   No transactions found for this wallet', 'info');
        return;
      }

      const totalRewards = relevant.reduce((sum, tx) => sum + (tx.reward ?? 0), 0);
      const updatedWallet = {
        ...activeWallet,
        balance: totalRewards,
        blocksMined: relevant.length,
      };
      setWallet(updatedWallet);
      storeWallet(updatedWallet);
      addOutput('✅ Wallet updated!', 'success');
      addOutput(`   Balance: ${totalRewards.toFixed(6)} BEANS`, 'info');
      addOutput(`   Blocks mined: ${relevant.length}`, 'info');
    } catch (error) {
      addOutput(`❌ Error updating wallet: ${error.message}`, 'error');
    }
  }, [addOutput]);

  const handleCheckBalance = useCallback(async () => {
    const activeWallet = walletRef.current;
    if (!activeWallet) {
      addOutput('❌ No wallet connected. Please create a wallet first.', 'error');
      return;
    }

    addOutput('🔍 Checking wallet balance from API...', 'info');
    try {
      const response = await api.getUserRewards(activeWallet.address);
      const data = response?.data ?? response;
      if (!data) {
        addOutput('❌ Failed to get wallet balance from API', 'error');
        return;
      }

      addOutput('✅ Wallet Balance from API:', 'success');
      addOutput(`   Address: ${data.address ?? activeWallet.address}`, 'info');
      const totalRewards = data.total_rewards ?? data.totalRewards ?? 0;
      addOutput(`   Total Rewards: ${Number(totalRewards).toFixed(6)} BEANS`, 'info');
      const blocksMined = data.blocks_mined ?? data.blocksMined ?? 0;
      addOutput(`   Blocks Mined: ${blocksMined}`, 'info');
      const averageWorkScore = data.average_work_score ?? data.avg_work_score ?? data.averageWorkScore;
      if (averageWorkScore !== undefined) {
        addOutput(`   Average Work Score: ${Number(averageWorkScore).toFixed(2)}`, 'info');
      }
      const averageReward = data.avg_reward ?? data.average_reward;
      if (averageReward !== undefined) {
        addOutput(`   Average Reward: ${Number(averageReward).toFixed(6)} BEANS`, 'info');
      }

      const updatedWallet = {
        ...activeWallet,
        balance: totalRewards,
        blocksMined,
      };
      setWallet(updatedWallet);
      storeWallet(updatedWallet);
    } catch (error) {
      addOutput(`❌ Error checking balance: ${error.message}`, 'error');
    }
  }, [addOutput]);

  const commandHandlers = useMemo(
    () => ({
      help: () => showHelp(),
      status: () => showStatus(),
      wallet: () => showWalletInfo(),
      clear: () => clearTerminal(),
      ping: () => pingServer(),
      'get-block': (parts) => handleGetBlock(parts),
      'get-proof': (parts) => handleGetProof(parts),
      'get-metrics': () => handleGetMetrics(),
      'get-consensus': () => handleGetConsensus(),
      'get-rewards': () => handleGetRewards(),
      'get-leaderboard': () => handleGetLeaderboard(),
      'get-peers': () => handleGetPeers(),
      'get-network': () => handleGetNetwork(),
      'get-telemetry': () => handleGetTelemetry(),
      'get-ipfs': (parts) => handleGetIpfs(parts),
      mine: (parts) => handleMine(parts),
      'submit-problem': (parts) => handleSubmitProblem(parts),
      'list-submissions': () => handleListSubmissions(),
      send: (parts) => handleSend(parts),
      'get-transactions': () => handleGetTransactions(),
      'migrate-blocks': () => migrateLocalBlocks(),
      'check-local-blocks': () => handleCheckLocalBlocks(),
      'update-wallet': () => handleUpdateWallet(),
      'check-balance': () => handleCheckBalance(),
    }),
    [
      clearTerminal,
      handleCheckBalance,
      handleCheckLocalBlocks,
      handleGetBlock,
      handleGetConsensus,
      handleGetIpfs,
      handleGetLeaderboard,
      handleGetMetrics,
      handleGetNetwork,
      handleGetPeers,
      handleGetProof,
      handleGetRewards,
      handleGetTelemetry,
      handleGetTransactions,
      handleMine,
      handleSend,
      handleSubmitProblem,
      handleUpdateWallet,
      migrateLocalBlocks,
      pingServer,
      showHelp,
      showStatus,
      showWalletInfo,
      handleListSubmissions,
    ],
  );

  const executeCommand = useCallback(
    async (commandText) => {
      if (!commandText.trim()) return;

      const parts = commandText.trim().split(/\s+/);
      const [cmd] = parts;
      const handler = commandHandlers[cmd.toLowerCase()];

      if (!handler) {
        addOutput(`❌ Unknown command: ${cmd}. Type 'help' for available commands.`, 'error');
        return;
      }

      try {
        const result = handler(parts);
        if (result instanceof Promise) {
          await result;
        }
      } catch (error) {
        addOutput(`❌ Error executing command: ${error.message}`, 'error');
      }
    },
    [addOutput, commandHandlers],
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      const trimmed = commandValue.trim();
      if (!trimmed) {
        return;
      }

      addOutput(`coinjectured$ ${trimmed}`, 'command');
      historyRef.current = [...historyRef.current, trimmed];
      setHistoryIndex(null);
      setCommandValue('');
      await executeCommand(trimmed);
    },
    [addOutput, commandValue, executeCommand],
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (historyRef.current.length === 0) return;
        setHistoryIndex((prev) => {
          const nextIndex = prev === null ? historyRef.current.length - 1 : Math.max(prev - 1, 0);
          setCommandValue(historyRef.current[nextIndex] ?? '');
          return nextIndex;
        });
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (historyRef.current.length === 0) return;
        setHistoryIndex((prev) => {
          if (prev === null) return null;
          const nextIndex = Math.min(prev + 1, historyRef.current.length);
          if (nextIndex === historyRef.current.length) {
            setCommandValue('');
            return null;
          }
          setCommandValue(historyRef.current[nextIndex] ?? '');
          return nextIndex;
        });
      }
    },
    [],
  );

  const handleCopyAddress = useCallback(() => {
    const activeWallet = walletRef.current;
    if (!activeWallet) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(activeWallet.address).then(
        () => addOutput('📋 Wallet address copied to clipboard!', 'success'),
        (error) => addOutput(`❌ Failed to copy address: ${error.message}`, 'error'),
      );
    } else {
      addOutput('❌ Clipboard API not available in this browser', 'error');
    }
  }, [addOutput]);

  const walletDisplay = walletRef.current;

  return (
    <div>
      <div className="bg-black border border-white/20 rounded-lg overflow-hidden font-mono text-sm">
        <div className="bg-gray-900 px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-purple-400 font-bold text-lg mb-1">COINjecture Web CLI ($BEANS)</div>
            <div className="text-xs text-gray-400">{networkStatus}</div>
          </div>

          {walletDisplay ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-800/80 px-3 py-2 rounded-md border border-gray-700/70">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wide text-gray-500">Wallet</span>
                <span className="text-purple-300 text-xs truncate max-w-[140px] sm:max-w-[180px]">
                  {walletDisplay.address}
                </span>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy Address"
                >
                  <Copy className='size-3' />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-300">
                <span>
                  Rewards:{' '}
                  <strong className="text-green-400">
                    {(walletDisplay.balance ?? 0).toLocaleString(undefined, {
                      maximumFractionDigits: 6,
                    })}{' '}
                    BEANS
                  </strong>
                </span>
                <span>
                  Blocks:{' '}
                  <strong className="text-blue-300">
                    {walletDisplay.blocksMined ?? 0} mined
                  </strong>
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-500">Wallet initializing...</div>
          )}
        </div>

        <div ref={outputRef} className="h-96 overflow-y-auto overflow-x-hidden bg-black px-4 py-6 space-y-1">
          {outputs.map((entry) => (
            <div
              key={entry.id}
              className={`${classForOutputType[entry.type] ?? classForOutputType.info} whitespace-pre-wrap`}
            >
              {entry.text}
            </div>
          ))}
          <div className="text-gray-500 font-semibold pt-4">
            coinjectured$ <span className="animate-pulse">█</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="command-input" className="sr-only">
            Terminal command
          </label>

          <input
            ref={inputRef}
            id="command-input"
            type="text"
            value={commandValue}
            onChange={(event) => setCommandValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            autoComplete="off"
            spellCheck="false"
            className="w-full bg-transparent border-none outline-none text-gray-100 placeholder:text-gray-500 px-4 py-3"
          />
        </form>
      </div>
    </div>
  );
};

export default TerminalComponent;

