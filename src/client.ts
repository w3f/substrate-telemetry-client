import WebSocket from 'ws';
import type { Data } from 'ws';
import { ACTIONS, DEFAULT_WS_URL, FEED_VERSION } from './constants';
import { NodeInfo, GenesisHash, ChainStats, TelemetryConfig, NodeLocation } from './types';

type MessageHandler = (nodes: NodeInfo[]) => void;

/**
 * Client for connecting to Substrate Telemetry service.
 * Provides real-time node information and statistics for Substrate-based chains.
 */
export class TelemetryClient {
  private socket?: WebSocket;
  private nodes = new Map<number, NodeInfo>();
  private messageHandlers = new Set<MessageHandler>();
  private reconnectAttempt = 0;
  private subscribedChain: GenesisHash | null = null;
  private chainStats?: ChainStats;
  private readonly url: string;
  private readonly autoReconnect: boolean;
  private readonly maxReconnectAttempts: number;
  /**
   * Creates a new TelemetryClient instance
   * @param config - Configuration options for the client
   * @param config.url - WebSocket URL for telemetry service
   * @param config.autoReconnect - Whether to automatically reconnect on disconnect
   * @param config.maxReconnectAttempts - Maximum number of reconnection attempts
   */
  constructor(private readonly config: TelemetryConfig = {}) {
    this.url = config.url ?? DEFAULT_WS_URL;
    this.autoReconnect = config.autoReconnect ?? true;
    this.maxReconnectAttempts = config.maxReconnectAttempts ?? 5;
  }

  /**
   * Establishes connection to the telemetry service
   * @returns Promise that resolves when connection is established
   * @throws Error if connection fails
   */
  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.url);
        this.socket!.on('open', () => {
          console.log('Connected to telemetry');
          this.reconnectAttempt = 0;
          if (this.subscribedChain) {
            this.subscribe(this.subscribedChain);
          }
          resolve();
        });

        this.socket!.on('message', this.handleMessage);
        this.socket!.on('close', this.handleDisconnect);
        this.socket!.on('error', (err) => {
          console.error('WebSocket error:', err);
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Subscribes to updates for a specific chain
   * @param chain - Genesis hash of the chain to subscribe to
   */
  public subscribe(chain: GenesisHash): void {
    this.subscribedChain = chain;
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(`subscribe:${chain}`);
    }
  }

  /**
   * Registers a handler for node updates
   * @param handler - Function to be called when node updates are received
   * @returns Function to unregister the handler
   */
  public onUpdate(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Returns all currently known nodes
   * @returns Array of node information
   */
  public getNodes(): NodeInfo[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Returns information for a specific node
   * @param id - ID of the node
   * @returns Node information or undefined if not found
   */
  public getNode(id: number): NodeInfo | undefined {
    return this.nodes.get(id);
  }

  /**
   * Returns nodes filtered by a predicate
   * @param predicate - Filter function
   * @returns Array of filtered node information
   */
  public getNodesFiltered(predicate: (node: NodeInfo) => boolean): NodeInfo[] {
    return Array.from(this.nodes.values()).filter(predicate);
  }

  /**
   * Returns nodes sorted by a compare function
   * @param compareFn - Sort compare function
   * @returns Array of sorted node information
   */
  public getNodesSorted(compareFn: (a: NodeInfo, b: NodeInfo) => number): NodeInfo[] {
    return Array.from(this.nodes.values()).sort(compareFn);
  }

  /**
   * Returns current chain statistics
   * @returns Chain statistics or undefined if not available
   */
  public getChainStats(): ChainStats | undefined {
    return this.chainStats;
  }

  /**
   * Disconnects from the telemetry service
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
    }
  }

  private handleMessage = async (data: Data) => {
    const message = data.toString();
    const parsed = JSON.parse(message) as [number, any];
    const [action, payload] = parsed;
    
    switch (action) {
      case ACTIONS.FeedVersion: {
        console.log('Received FeedVersion:', payload);
        if (payload !== FEED_VERSION) {
          this.disconnect();
          throw new Error(
            `Version mismatch: expected ${FEED_VERSION}, got ${payload}. ` +
            `The client might be outdated.`
          );
        }
        break;
      }

      case ACTIONS.AddedNode: {
        const [
          id,
          [
            name,
            implementation,
            version,
            validator,
            networkId,
            targetOS,
            targetArch,
            targetEnv,
            ip,
            sysInfo,
            hwbench
          ],
          nodeStats,
          nodeIO,
          nodeHardware,
          blockDetails,
          location,
          startupTime
        ] = payload;

        const node: NodeInfo = {
          id,
          name,
          implementation,
          version,
          validator: validator || undefined,
          networkInfo: {
            peerCount: nodeStats[0],
            peerId: networkId || undefined,
            ip: ip || undefined
          },
          systemInfo: {
            cpu: sysInfo.cpu,
            memory: sysInfo.memory,
            coreCount: sysInfo.core_count,
            isVirtualMachine: sysInfo.is_virtual_machine,
            kernel: sysInfo.linux_kernel,
            distribution: sysInfo.linux_distro,
            targetOS,
            targetArch,
            targetEnv,
            benchmarks: hwbench ? {
              cpuHashrateScore: hwbench.cpu_hashrate_score,
              memoryMemcpyScore: hwbench.memory_memcpy_score,
              diskSequentialWriteScore: hwbench.disk_sequential_write_score,
              diskRandomWriteScore: hwbench.disk_random_write_score,
              cpuVendor: hwbench.cpu_vendor
            } : undefined
          },
          transactionCount: nodeStats[1],
          io: nodeIO ? {
            stateCacheSize: nodeIO[0]
          } : undefined,
          hardware: nodeHardware ? {
            upload: nodeHardware[0],
            download: nodeHardware[1],
            timestamps: nodeHardware[2]
          } : undefined,
          block: blockDetails ? {
            height: blockDetails[0],
            hash: blockDetails[1],
            propagationTime: blockDetails[4] || undefined
          } : undefined,
          location: location ? {
            latitude: location[0],
            longitude: location[1],
            city: location[2]
          } : undefined,
          startupTime
        };
        
        this.nodes.set(id, node);

        break;
      }

      case ACTIONS.RemovedNode: {
        const id = payload as number;
        this.nodes.delete(id);
        break;
      }
      
      case ACTIONS.NodeStatsUpdate: {
        const [id, [peers, txs]] = payload as [number, [number, number]];
        const node = this.nodes.get(id);
        if (node) {
          node.networkInfo.peerCount = peers;
          node.transactionCount = txs;
        }
        break;
      }
      
      case ACTIONS.Hardware: {
        const [id, [upload, download, timestamps]] = payload as [number, [number[], number[], number[]]];
        const node = this.nodes.get(id);
        if (node) {
          node.hardware = {
            ...node.hardware,
            upload,
            download,
            timestamps
          };
        }
        break;
      }
      
      case ACTIONS.ImportedBlock: {
        const [id, [height, hash, , , propagationTime]] = payload as [
          number,
          [number, string, number, number, number | null]
        ];
        const node = this.nodes.get(id);
        if (node) {
          node.block = {
            ...node.block,
            height,
            hash,
            propagationTime: propagationTime || undefined
          };
        }
        break;
      }
      
      case ACTIONS.LocatedNode: {
        const [id, lat, lon, city] = payload as [number, number, number, string];
        const node = this.nodes.get(id);
        if (node) {
          node.location = {
            ...node.location,
            latitude: lat,
            longitude: lon,
            city
          };
        }
        break;
      }
      
      case ACTIONS.NodeIOUpdate: {
        const [id, [stateCacheSize]] = payload as [number, [number[]]];
        const node = this.nodes.get(id);
        if (node) {
          node.io = {
            ...node.io,
            stateCacheSize
          };
        }
        break;
      }
      
      case ACTIONS.StaleNode: {
        const id = payload as number;
        const node = this.nodes.get(id);
        if (node) {
          node.stale = true;
        }
        break;
      }
      
      case ACTIONS.ChainStatsUpdate: {
        this.chainStats = payload;
        break;
      }
    }

    const nodes = Array.from(this.nodes.values());
    this.messageHandlers.forEach(handler => handler(nodes));
  };

  private handleDisconnect = async () => {
    console.log('Disconnected from telemetry');
    
    if (this.autoReconnect) {
      if (this.reconnectAttempt >= this.maxReconnectAttempts) {
        throw new Error(
          `Failed to connect after ${this.maxReconnectAttempts} attempts. ` +
          `Last attempt to connect to ${this.url} failed.`
        );
      }

      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempt), 10000);
      this.reconnectAttempt++;
      
      console.log(
        `Reconnecting in ${delay}ms... Attempt ${this.reconnectAttempt} of ${this.maxReconnectAttempts}`
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      try {
        await this.connect();
      } catch (error: unknown) {
        if (this.reconnectAttempt >= this.maxReconnectAttempts) {
          throw new Error(
            `Failed to connect after ${this.maxReconnectAttempts} attempts. ` +
            `Last error: ${error instanceof Error ? error.message : String(error)}`
          );
        }
        console.error('Reconnection attempt failed:', error);
      }
    }
  };
}
