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
  // If we have a live connection, reuse it
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If connection dropped (readyState 0=disconnected, 3=disconnecting), reset cache
  if (cached.conn && mongoose.connection.readyState !== 1) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    console.log("[MongoDB] Connecting to database...");
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: true,          // queue commands while connecting instead of failing immediately
        maxPoolSize: 10,               // reuse up to 10 sockets
        serverSelectionTimeoutMS: 5000,  // fail fast — don't burn the full Vercel budget on Atlas selection
        socketTimeoutMS: 45000,        // disconnect slow sockets after 45s
        connectTimeoutMS: 5000,        // fail fast on initial connection
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
