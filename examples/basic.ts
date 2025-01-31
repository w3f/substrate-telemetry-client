import { TelemetryClient, CHAIN_GENESIS } from '../src';

async function main() {
  const client = new TelemetryClient();
  await client.connect();
  client.subscribe(CHAIN_GENESIS.KUSAMA);

  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const nodeNames = ['kusama'];
  const nodes = client.getNodesFiltered(node => nodeNames.includes(node.name))
  if (nodes.length > 0) {
    const node = nodes[0];
    console.log('Node details:', JSON.stringify(node, null, 2));
  } else {
    console.log('Not found.')
    console.log('Node names:', client.getNodes().map(node => node.name).sort().join('\n'));
  }

  client.disconnect();
  process.exit();
}

main();