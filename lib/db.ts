import mongoose from "mongoose";

const MONGODB_URI =
  process.env.DATABASE_URL ||
  "mongodb+srv://peraboinaudaykiran:peraboinaudaykiran@db.v35kmt6.mongodb.net/urhabit?retryWrites=true&w=majority";

if (!MONGODB_URI) {
  throw new Error("Please define DATABASE_URL environment variable");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalForMongoose = globalThis as unknown as {
  mongoose: MongooseCache;
};

const cached: MongooseCache = globalForMongoose.mongoose || {
  conn: null,
  promise: null,
};

if (!globalForMongoose.mongoose) {
  globalForMongoose.mongoose = cached;
}

export async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("[MongoDB] Connecting to database...");
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then((m) => {
        console.log("[MongoDB] Connected successfully");
        return m;
      })
      .catch((err) => {
        console.error("[MongoDB] Connection error:", err);
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
