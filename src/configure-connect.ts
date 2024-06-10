import fetch from 'node-fetch';

const configUrl = 'http://127.0.0.1:8083/connectors/mongo-connector/config';
const config = {
  'change.stream.full.document.before.change': 'whenAvailable',
  'change.stream.full.document': 'updateLookup',
  'connector.class': 'com.mongodb.kafka.connect.MongoSourceConnector',
  'topic.prefix': 'mongo',
  'connection.uri': 'mongodb://host.docker.internal:27017/?replicaSet=rs0',
};

async function main() {
  while (true) {
    try {
      const res = await fetch('http://127.0.0.1:8083/connectors');
      if (res.ok) {
        break;
      } else {
        throw new Error(res.statusText);
      }
    } catch (e : any) {
      console.log('Waiting for kafka-connect rest endpoint to be up. ', e.message);
      await new Promise<void>((r) => setTimeout(r, 5000));
    }
  }
  const res = await fetch(configUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (res.ok) {
    console.log("Succesfully configured kafka-connect");
  } else {
    console.log("Error configuring kafka-connect", res.status, res.statusText);
  }
  // console.log(res.status);
}

main();
