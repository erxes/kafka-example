import Kafka from 'node-rdkafka';
import { Transform } from 'stream';

const producer = new Kafka.Producer({
  'client.id': 'kafka',
  'metadata.broker.list': 'localhost:9092',
  // 'compression.codec': 'gzip',
  'retry.backoff.ms': 1000,
  'message.send.max.retries': 10,
  'socket.keepalive.enable': true,
  'queue.buffering.max.messages': 100000,
  'queue.buffering.max.ms': 1000,
  'batch.num.messages': 1000000,
  dr_cb: true
});

producer.connect();

producer.on('ready', async () => {
  try {
    while (true) {
      producer.produce(
        // Topic to send the message to
        'msg.customerstuff0004',
        // optionally we can manually specify a partition for the message
        // this defaults to -1 - which will use librdkafka's default partitioner (consistent random for keyed messages, random for unkeyed messages)
        null,
        // Message to send. Must be a buffer
        Buffer.from(
          JSON.stringify({
            something: 'happened' + Date.now(),
          }),
        ),
        // for keyed messages, we also specify the key - note that this field is optional
        'Stormwind',
        // you can send a timestamp here. If your broker version supports it,
        // it will get added. Otherwise, we default to 0
        Date.now(),
        // you can send an opaque token here, which gets passed along
        // to your delivery reports
      );

      await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    }
  } catch (err) {
    console.error('A problem occurred when sending our message');
    console.error(err);
  }
});
// Any errors we encounter, including connection errors
producer.on('event.error', (err) => {
  console.error('Error from producer');
  console.error(err);
});

producer.on('delivery-report', (err, report) => {
  // Report of delivery statistics here:
  //
  console.log("DR: ", report);
});