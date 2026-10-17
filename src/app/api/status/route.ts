import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getMongoDb();
    if (db) {
      await db.command({ ping: 1 });
      return NextResponse.json({
        status: "online",
        database: "connected",
        dbName: db.databaseName,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json({
        status: "online",
        database: "fallback_memory_mode",
        message: "MongoDB URI not reachable. App running seamlessly in resilient fallback mode.",
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    return NextResponse.json({
      status: "online",
      database: "fallback_memory_mode",
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    });
  }
}
