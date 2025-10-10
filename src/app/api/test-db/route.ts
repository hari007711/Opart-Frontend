import { NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "DATABASE_URL not set" },
        { status: 500 }
      );
    }

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    });

    const client = await pool.connect();
    const result = await client.query("SELECT NOW() as current_time");
    client.release();
    await pool.end();

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      time: result.rows[0].current_time,
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      {
        error: "Database connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
