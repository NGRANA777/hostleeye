import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Log from "@/models/Log";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    const log = await Log.create(body);

    if (log.type === "UNAUTHORIZED") {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        await fetch(`${baseUrl}/api/emit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'new-alert', data: log }),
          cache: 'no-store'
        });
      } catch (e) {
        console.error("Failed to emit socket event:", e);
      }
    }

    return NextResponse.json({ success: true, data: log }, { status: 201 });
  } catch (error) {
    console.error("Detect API Error:", error);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}
