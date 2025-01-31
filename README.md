# Substrate Telemetry Client

A TypeScript client library for connecting to Substrate Telemetry backend service. Get real-time information about nodes in Substrate-based networks like Polkadot and Kusama.

## Installation

```bash
yarn install
```

## Basic Usage

```typescript
import { TelemetryClient, CHAIN_GENESIS } from 'substrate-telemetry-client';

const client = new TelemetryClient();
await client.connect();
client.subscribe(CHAIN_GENESIS.POLKADOT);

// Event-based updates example:
client.onUpdate((nodes) => {
  console.log('Total nodes:', nodes.length);
});

// Polling-based updates examples:

// 1. Get all nodes
const nodes = client.getNodes();
console.log('Current nodes:', nodes.length);

// 2. Get nodes filtered by node names
const nodeNames = ['Alice', 'Bob', 'Charlie'];
const specificNodes = client.getNodesFiltered(node => nodeNames.includes(node.name));
```

## API Reference

### TelemetryClient

#### Constructor Options
```typescript
interface TelemetryConfig {
  url?: string;                    // Telemetry WebSocket URL
  autoReconnect?: boolean;         // Auto reconnect on disconnect
  maxReconnectAttempts?: number;   // Max reconnection attempts
}
```

#### Methods

- `connect(): Promise<void>` - Connect to telemetry service
- `disconnect(): void` - Disconnect from service
- `subscribe(chain: GenesisHash): void` - Subscribe to chain updates
- `onUpdate(handler: (nodes: NodeInfo[]) => void): () => void` - Register update handler
- `getNodes(): NodeInfo[]` - Get all nodes
- `getNode(id: number): NodeInfo | undefined` - Get specific node
- `getNodesFiltered(predicate: (node: NodeInfo) => boolean): NodeInfo[]` - Filter nodes
- `getNodesSorted(compareFn: (a: NodeInfo, b: NodeInfo) => number): NodeInfo[]` - Sort nodes
- `getChainStats(): ChainStats | undefined` - Get chain statistics

## Supported Networks

- Polkadot (`CHAIN_GENESIS.POLKADOT`)
- Kusama (`CHAIN_GENESIS.KUSAMA`)
- Other Substrate-based networks (use their genesis hash)

## Development

```bash
# Install dependencies
yarn install

# Build
yarn build

# Run examples
yarn basic
yarn detailed
```

You can find example code in:
- `examples/basic.ts` - Simple connection and node information display
- `examples/detailed.ts` - Detailed output with node information

## Issues

If you find a bug or have a feature request, please create an issue in our GitHub repository.

## License

MIT License
