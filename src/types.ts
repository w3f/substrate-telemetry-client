export type GenesisHash = string;
export type NodeId = number;
export type NodeName = string;
export type NodeImplementation = string;
export type NodeVersion = string;
export type BlockNumber = number;
export type BlockHash = string;
export type Timestamp = number;
export type PropagationTime = number;
export type NetworkId = string;

// Benchmark scores are represented as [value, max?]
export interface NodeBenchmarks {
  cpuHashrateScore?: [number, number | null];
  memoryMemcpyScore?: [number, number | null];
  diskSequentialWriteScore?: [number, number | null];
  diskRandomWriteScore?: [number, number | null];
  cpuVendor?: string;
}

export interface TelemetryConfig {
  url?: string;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
}

export interface NodeSystemInfo {
  cpu: string;
  memory: number;  // in bytes
  coreCount: number;
  isVirtualMachine: boolean;
  kernel?: string;      // Linux kernel version
  distribution?: string; // Linux distribution
  benchmarks?: NodeBenchmarks;
  targetOS?: string;    // Operating system target
  targetArch?: string;  // CPU architecture target
  targetEnv?: string;   // Environment target
}

export interface NodeNetworkInfo {
  ipv4?: string;
  ipv6?: string;
  peerId?: string;     // libp2p peer id
  peerCount: number;
  ip?: string;         // Raw IP from backend if exposed
}

export interface NodeLocation {
  latitude?: number;
  longitude?: number;
  city?: string;
}

export interface NodeBlock {
  height: number;
  hash: string;
  propagationTime?: number;
}

// Rankings for chain statistics
export interface Ranking<T> {
  list: Array<[T, number]>;  // [value, count] pairs
  other: number;
  unknown: number;
}

export interface ChainStats {
  version?: Ranking<string>;
  targetOS?: Ranking<string>;
  targetArch?: Ranking<string>;
  cpu?: Ranking<string>;
  memory?: Ranking<[number, number | null]>;  // [value, max?]
  coreCount?: Ranking<number>;
  linuxKernel?: Ranking<string>;
  linuxDistro?: Ranking<string>;
  isVirtualMachine?: Ranking<boolean>;
  cpuHashrateScore?: Ranking<[number, number | null]>;
  memoryMemcpyScore?: Ranking<[number, number | null]>;
  diskSequentialWriteScore?: Ranking<[number, number | null]>;
  diskRandomWriteScore?: Ranking<[number, number | null]>;
  cpuVendor?: Ranking<string>;
}

export interface NodeInfo {
  id: NodeId;
  name: NodeName;
  implementation: NodeImplementation;
  version: NodeVersion;
  validator?: string;
  networkInfo: NodeNetworkInfo;
  systemInfo: NodeSystemInfo;
  location?: NodeLocation;
  block?: NodeBlock;
  transactionCount?: number;
  startupTime?: Timestamp;
  io?: NodeIO;
  hardware?: NodeHardware;
  stale?: boolean;
}

// Message types for parsing incoming data
export type NodeDetails = [
  NodeName,             // 0: name
  NodeImplementation,   // 1: implementation
  NodeVersion,          // 2: version
  string | null,        // 3: validator address
  NetworkId | null,     // 4: network id
  string,               // 5: target os
  string,               // 6: target arch
  string,               // 7: target env
  string | null,        // 8: ip address
  {                     // 9: system info
    cpu: string;
    memory: number;
    core_count: number;
    linux_kernel?: string;
    linux_distro?: string;
    is_virtual_machine: boolean;
  },
  {                    // 10: hardware benchmarks
    cpu_hashrate_score?: [number, number | null];
    memory_memcpy_score?: [number, number | null];
    disk_sequential_write_score?: [number, number | null];
    disk_random_write_score?: [number, number | null];
    cpu_vendor?: string;
  } | null
];

export type NodeStats = [number, number]; // [peerCount, transactionCount]
export interface NodeIO {
  stateCacheSize: number[];
}

export interface NodeHardware {
  upload: number[];      // upload rates history
  download: number[];    // download rates history
  timestamps: number[];  // timestamps for the measurements
}

export type BlockDetails = [
  BlockNumber,
  BlockHash,
  number,              // block time
  Timestamp,
  PropagationTime | null
];

export interface FeedMessage {
  action: number;
  payload: any;
}
