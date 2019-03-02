import { Collection, MongoClient } from "mongodb";

let mongoClient: MongoClient;
export default function connect(): Promise<Collection> {
  return new Promise((resolve, reject) => {
    console.log("connecting to mongodb");
    MongoClient.connect(
      "mongodb://localhost:27017",
      (err, client) => {
        if (err) {
          reject(err);
        } else {
          mongoClient = client;
          console.log("connected to mongodb");
          const db = client.db("keyboard");
          const collection = db.collection("count");
          collection.createIndex("row");
          collection.createIndex("col");
          resolve(collection);
        }
      }
    );
  });
}

export function closeDb(): void {
  if (mongoClient) {
    mongoClient.close();
  }
}
