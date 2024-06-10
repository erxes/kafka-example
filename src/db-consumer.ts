import Kafka from 'node-rdkafka';

const consumer = new Kafka.KafkaConsumer(
  {
    //'debug': 'all',
    'metadata.broker.list': '127.0.0.1:9092',
    'group.id': 'node-rdkafka-consumer-flow-example',
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
  console.log(log);
});

//logging all errors
consumer.on('event.error', function (err) {
  console.error('Error from consumer');
  console.error(err);
});

consumer.on('ready', function (arg) {
  console.log('consumer ready.' + JSON.stringify(arg));

  consumer.subscribe([/^mongo\.erxes_?/]);
  //start consuming messages
  consumer.consume();
});

class NotErxesDb extends Error {
  constructor(m?: string) {
    super(m);
    this.name = 'NotErxesDb';
  }
}

class NoDbName extends Error {
  constructor(m?: string) {
    super(m);
    this.name = 'NoDbName';
  }
}

/**
 * @throws {NotErxesDb}
 * @throws {NoDbName}
 */
function getOrgIdFromDbName(dbName?: string | null): string {
  if (!dbName || !/\S+?/.test(dbName)) {
    throw new NoDbName(`DB name is "${dbName}"`);
  }

  const i = dbName.indexOf('_');

  if (i === -1) {
    if (dbName === 'erxes') {
      return 'localhost';
    } else {
      throw new NotErxesDb();
    }
  }

  const part1 = dbName.substring(0, i);
  const orgId = dbName.substring(i + 1);

  if (part1 !== 'erxes') {
    throw new NotErxesDb();
  }

  return orgId;
}

consumer.on('data', function (m) {

  console.log(m.topic);

  if (m.value) {
    const value = JSON.parse(m.value.toString());

    if (value?.payload) {
      const payload = JSON.parse(value.payload);

      try {
        const orgId = getOrgIdFromDbName(payload.ns.db);
        const collectionName = payload.ns.coll;
        console.log({
          orgId,
          collectionName,
          payload,
        });
      } catch (e) {
        if (e instanceof NotErxesDb) {
        } else if (e instanceof NoDbName) {
          // this is a serious error, handle it
        }
      }
    }
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
      console.log('consumer disconnected. \n\n');
      process.exit(0);
    });
  });
});

const updatePayload = {
  _id: {
    _data:
      '826646CC19000000012B022C0100296E5A1004A6F923B1938640D882FE14B9323425DC46645F696400646646CC139CBE64213BBB339B0004',
  },
  operationType: 'update',
  clusterTime: { $timestamp: { t: 1715915801, i: 1 } },
  wallTime: { $date: 1715915801933 },
  fullDocument: {
    _id: { $oid: '6646cc139cbe64213bbb339b' },
    asdf: '1715915801931uuuu',
  },
  ns: { db: 'erxes_00001', coll: 'bbb' },
  documentKey: { _id: { $oid: '6646cc139cbe64213bbb339b' } },
  updateDescription: {
    updatedFields: { asdf: '1715915801931uuuu' },
    removedFields: [],
    truncatedArrays: [],
  },
  fullDocumentBeforeChange: {
    _id: { $oid: '6646cc139cbe64213bbb339b' },
    asdf: '1715915800881uuuu',
  },
};

const insertPayload = {
  _id: {
    _data:
      '826646CCD9000000012B022C0100296E5A100431E8655914CF4582903475D32546081946645F696400646646CCD9948504CC553A3F480004',
  },
  operationType: 'insert',
  clusterTime: { $timestamp: { t: 1715915993, i: 1 } },
  wallTime: { $date: 1715915993251 },
  fullDocument: {
    _id: { $oid: '6646ccd9948504cc553a3f48' },
    asdf: 1715915993248,
  },
  ns: { db: 'erxes_00002', coll: 'bbb' },
  documentKey: { _id: { $oid: '6646ccd9948504cc553a3f48' } },
};

const deletePayload = {
  _id: {
    _data:
      '826646CD01000000012B022C0100296E5A100431E8655914CF4582903475D32546081946645F696400646646CCD6948504CC553A3F450004',
  },
  operationType: 'delete',
  clusterTime: { $timestamp: { t: 1715916033, i: 1 } },
  wallTime: { $date: 1715916033546 },
  ns: { db: 'erxes_00002', coll: 'bbb' },
  documentKey: { _id: { $oid: '6646ccd6948504cc553a3f45' } },
  fullDocumentBeforeChange: {
    _id: { $oid: '6646ccd6948504cc553a3f45' },
    asdf: 1715915990175,
  },
};

const topic = 'mongo.erxes_00002.bbb';
