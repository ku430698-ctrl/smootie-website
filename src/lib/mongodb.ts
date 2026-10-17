import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/kamalverma_db";
const dbName = process.env.MONGODB_DB || "kamalverma_db";

interface GlobalWithMongo {
  _mongoClientPromise?: Promise<MongoClient>;
}

declare const global: GlobalWithMongo;

let indexesInitialized = false;

/**
 * Initializes required collection indexes in MongoDB.
 * Ensures slug uniqueness, email uniqueness, and fast timestamp ordering.
 */
export async function ensureIndexes(db: Db): Promise<void> {
  if (indexesInitialized) return;
  try {
    await Promise.all([
      db.collection("inquiries").createIndex({ createdAt: -1 }),
      db.collection("inquiries").createIndex({ status: 1 }),
      db.collection("subscribers").createIndex({ email: 1 }, { unique: true }),
      db.collection("insights").createIndex({ slug: 1 }, { unique: true }),
      db.collection("insights").createIndex({ category: 1 }),
      db.collection("insights").createIndex({ date: -1 }),
      db.collection("services").createIndex({ slug: 1 }, { unique: true }),
      db.collection("services").createIndex({ order: 1 }),
      db.collection("portfolio").createIndex({ slug: 1 }, { unique: true }),
      db.collection("portfolio").createIndex({ order: 1 }),
      db.collection("portfolio").createIndex({ category: 1 }),
    ]);
    indexesInitialized = true;
  } catch (err) {
    // Indexes might already exist or driver is building them in background
    console.warn("MongoDB Index initialization warning:", (err as Error).message);
  }
}

/**
 * Reuses the MongoDB client connection efficiently across requests.
 * Automatically clears rejected promises on network failure so subsequent calls can retry.
 */
export async function getMongoClient(): Promise<MongoClient | null> {
  if (!uri) {
    return null;
  }

  try {
    if (process.env.NODE_ENV === "development") {
      if (!global._mongoClientPromise) {
        const client = new MongoClient(uri, {
          serverSelectionTimeoutMS: 2000,
          connectTimeoutMS: 2000,
        });
        global._mongoClientPromise = client.connect().catch((err) => {
          // Clear global cached promise on failure so next attempt retries fresh
          global._mongoClientPromise = undefined;
          throw err;
        });
      }
      return await global._mongoClientPromise;
    } else {
      const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      });
      return await client.connect();
    }
  } catch (error) {
    global._mongoClientPromise = undefined;
    return null;
  }
}

/**
 * Retrieves the MongoDB database instance and initializes indexes.
 */
export async function getMongoDb(): Promise<Db | null> {
  try {
    const client = await getMongoClient();
    if (!client) return null;
    const db = client.db(dbName);
    // Initialize indexes in the background once connected
    ensureIndexes(db).catch(() => {});
    return db;
  } catch {
    return null;
  }
}

/**
 * Actively checks whether MongoDB is connected and responsive to commands.
 */
export async function isMongoConnected(): Promise<boolean> {
  try {
    const db = await getMongoDb();
    if (!db) return false;
    await db.command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}
