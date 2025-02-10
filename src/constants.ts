// TODO: Implement multi-chain support. The following actions (AddedChain, RemovedChain,
// SubscribedTo, UnsubscribedFrom) will be needed to track and switch between multiple 
// chains. This will require extending the client to handle chain subscription and state.

export const ACTIONS = {
  FeedVersion: 0x00,
  BestBlock: 0x01,      // Not needed: chain-wide block info, we track per-node state
  BestFinalized: 0x02,  // Not needed: chain-wide finalized info, we track per-node state
  AddedNode: 0x03,
  RemovedNode: 0x04,
  LocatedNode: 0x05,
  ImportedBlock: 0x06,
  FinalizedBlock: 0x07,
  NodeStatsUpdate: 0x08,
  Hardware: 0x09,
  TimeSync: 0x0a,
  AddedChain: 0x0b,        // TODO: multi-chain support
  RemovedChain: 0x0c,      // TODO: multi-chain support
  SubscribedTo: 0x0d,      // TODO: multi-chain support
  UnsubscribedFrom: 0x0e,  // TODO: multi-chain support
  Pong: 0x0f,
  StaleNode: 0x14,        // 20
  NodeIOUpdate: 0x15,     // 21
  ChainStatsUpdate: 0x16  // 22
} as const;

export const CHAIN_GENESIS = {
  KUSAMA: '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
  POLKADOT: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
} as const;

export const FEED_VERSION = 32;
export const DEFAULT_WS_URL = 'wss://feed.telemetry.polkadot.io/feed/';
