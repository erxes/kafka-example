import Kafka from 'node-rdkafka';
import { Transform } from 'stream';

const consumer = new Kafka.KafkaConsumer(
  {
    //'debug': 'all',
    'metadata.broker.list': '127.0.0.1:9092',
    'group.id': 'message-consumer',
    'enable.auto.commit': false,
    'metadata.max.age.ms': 30_000,
    'topic.metadata.refresh.interval.ms': 10_000,
  },
  {
    'auto.offset.reset': 'earliest',
  },
);

//logging debug messages, if debug is enabled
consumer.on('event.log', function (log) {
  console.log("Log: ", log);
});

//logging all errors
consumer.on('event.error', function (err) {
  console.error('Error from consumer');
  console.error(err);
});

consumer.on('ready', function (arg) {
  console.log('consumer ready.' + JSON.stringify(arg));

  consumer.subscribe([/^msg\..*?/i]);
  //start consuming messages
  consumer.consume();
});

consumer.on('data', function (m) {
  console.log(m.topic);

  if (m.value) {
    const value = JSON.parse(m.value.toString());
    console.log(value);

  }

  consumer.commitMessage(m);
});

consumer.on('disconnected', function (arg) {
  console.log('consumer disconnected. ' + JSON.stringify(arg));
});

//starting the consumer
consumer.connect();

['SIGINT', 'SIGTERM'].forEach((sig) => {
  process.on(sig, function () {
    consumer.removeAllListeners();
    consumer.disconnect(() => {
      process.exit(0);
    });
  });
});
