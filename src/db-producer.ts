import { MongoClient } from 'mongodb';
import { nanoid } from 'nanoid';
// Connection URL
const url = 'mongodb://127.0.0.1:27017/test?replicaSet=rs0';
const client = new MongoClient(url);

// Database Name
const dbName = 'erxes_00002';

async function main() {
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db(dbName);

  const collection = db.collection('bbb');
  collection.deleteMany();
  console.log(await collection.insertOne({ asdf: Date.now() }));

  await db.command({
    collMod: 'bbb',
    changeStreamPreAndPostImages: { enabled: true },
  });

  while (true) {
    console.log(await collection.insertOne({ asdf: Date.now() }));

    const item = await collection.findOne({});
    console.log(
      item,
      await collection.updateOne(
        { _id: item?._id },
        { $set: { asdf: Date.now() + 'uuuu' } },
      ),
    );
    await new Promise<void>((r) => setTimeout(r, 1000));
  }

  return 'done.';
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());
