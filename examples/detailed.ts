import { TelemetryClient, CHAIN_GENESIS } from '../src';

function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
}

async function main() {
  const client = new TelemetryClient();
  
  await client.connect();
  
  client.subscribe(CHAIN_GENESIS.KUSAMA);
  
  client.onUpdate((nodes) => {
    if (nodes.length > 0) {
      console.log(`\n=== Connected nodes: ${nodes.length} ===\n`);
      const node = nodes[0];
      
      console.log('=== Node Details ===');
      console.log(`ID: ${node.id}`);
      console.log(`Name: ${node.name}`);
      console.log(`Implementation: ${node.implementation}`);
      console.log(`Version: ${node.version}`);
      if (node.validator) {
        console.log(`Validator: ${node.validator}`);
      }
      
      console.log('\n=== Network Info ===');
      console.log(`Peer Count: ${node.networkInfo.peerCount}`);
      if (node.networkInfo.peerId) {
        console.log(`Peer ID: ${node.networkInfo.peerId}`);
      }
      if (node.networkInfo.ip) {
        console.log(`IP: ${node.networkInfo.ip}`);
      }
      
      console.log('\n=== System Info ===');
      console.log(`CPU: ${node.systemInfo.cpu}`);
      console.log(`Memory: ${formatBytes(node.systemInfo.memory)}`);
      console.log(`Cores: ${node.systemInfo.coreCount}`);
      console.log(`Virtual Machine: ${node.systemInfo.isVirtualMachine ? 'Yes' : 'No'}`);
      if (node.systemInfo.kernel) {
        console.log(`Kernel: ${node.systemInfo.kernel}`);
      }
      if (node.systemInfo.distribution) {
        console.log(`Distribution: ${node.systemInfo.distribution}`);
      }
      console.log(`Target OS: ${node.systemInfo.targetOS}`);
      console.log(`Target Arch: ${node.systemInfo.targetArch}`);
      console.log(`Target Env: ${node.systemInfo.targetEnv}`);

      if (node.systemInfo.benchmarks) {
        console.log('\n=== Benchmarks ===');
        const b = node.systemInfo.benchmarks;
        if (b.cpuHashrateScore) {
          console.log(`CPU Hashrate: ${b.cpuHashrateScore[0]}${b.cpuHashrateScore[1] ? '/' + b.cpuHashrateScore[1] : ''}`);
        }
        if (b.memoryMemcpyScore) {
          console.log(`Memory Memcpy: ${b.memoryMemcpyScore[0]}${b.memoryMemcpyScore[1] ? '/' + b.memoryMemcpyScore[1] : ''}`);
        }
        if (b.diskSequentialWriteScore) {
          console.log(`Disk Sequential Write: ${b.diskSequentialWriteScore[0]}${b.diskSequentialWriteScore[1] ? '/' + b.diskSequentialWriteScore[1] : ''}`);
        }
        if (b.diskRandomWriteScore) {
          console.log(`Disk Random Write: ${b.diskRandomWriteScore[0]}${b.diskRandomWriteScore[1] ? '/' + b.diskRandomWriteScore[1] : ''}`);
        }
        if (b.cpuVendor) {
          console.log(`CPU Vendor: ${b.cpuVendor}`);
        }
      }

      if (node.location) {
        console.log('\n=== Location ===');
        console.log(`City: ${node.location.city}`);
        console.log(`Coordinates: ${node.location.latitude}, ${node.location.longitude}`);
      }

      if (node.block) {
        console.log('\n=== Block Info ===');
        console.log(`Height: ${node.block.height}`);
        console.log(`Hash: ${node.block.hash}`);
        if (node.block.propagationTime !== undefined) {
          console.log(`Propagation Time: ${node.block.propagationTime}ms`);
        }
      }

      if (node.hardware) {
        console.log('\n=== Hardware Stats ===');
        if (node.hardware.upload.length > 0) {
          console.log(`Latest Upload: ${formatBytes(node.hardware.upload[node.hardware.upload.length - 1])}/s`);
        }
        if (node.hardware.download.length > 0) {
          console.log(`Latest Download: ${formatBytes(node.hardware.download[node.hardware.download.length - 1])}/s`);
        }
      }

      if (node.io?.stateCacheSize.length) {
        console.log('\n=== IO Stats ===');
        console.log(`Latest State Cache Size: ${formatBytes(node.io.stateCacheSize[node.io.stateCacheSize.length - 1])}`);
      }

      console.log('\n=== Status ===');
      console.log(`Stale: ${node.stale ? 'Yes' : 'No'}`);
      if (node.transactionCount !== undefined) {
        console.log(`Transaction Count: ${node.transactionCount}`);
      }
      if (node.startupTime) {
        const uptime = Math.floor((Date.now() - node.startupTime) / 1000);
        console.log(`Uptime: ${uptime} seconds`);
      }

      client.disconnect();
      process.exit();
    }
  });
}

main();
