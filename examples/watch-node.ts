import { TelemetryClient, CHAIN_GENESIS, NodeInfo } from '../src';

async function main() {
  const nodeName = 'blockseeker_io';
  console.log(`Watching updates for node: ${nodeName}`);
  console.log('Press Ctrl+C to exit');

  const client = new TelemetryClient();
  let previousState: NodeInfo | null = null;

  await client.connect();
  client.subscribe(CHAIN_GENESIS.KUSAMA);

  client.onUpdate((nodes) => {
    const node = nodes.find(n => n.name === nodeName);
    if (node) {
      if (!previousState) {
        console.log('Initial state:', JSON.stringify(node, null, 2));
      } else if (JSON.stringify(node) !== JSON.stringify(previousState)) {
        console.log('Update:', JSON.stringify(node, null, 2));
      }
      previousState = { ...node };
    }
  });

  process.on('SIGINT', () => {
    console.log('\nDisconnecting...');
    client.disconnect();
    process.exit();
  });
}

main().catch(console.error);
