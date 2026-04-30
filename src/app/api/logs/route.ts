import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Log from "@/models/Log";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query = type ? { type } : {};
    
    const logs = await Log.find(query).sort({ timestamp: -1 }).limit(limit);

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}
