import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Log from "@/models/Log";
import { sendSMS } from "@/lib/sms";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    

    const existingLog = await Log.findById(id);
    if (!existingLog) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    const log = await Log.findByIdAndUpdate(id, { status: body.status }, { new: true });
    
  
    if (body.status === "THREAT" && existingLog.status !== "THREAT") {
      const adminPhone = process.env.SUPER_ADMIN_PHONE || "+919991437839";
      const message = `🚨 SECURITY ALERT: Intruder Confirmed! 
Location: ${log.location}
Time: ${new Date(log.timestamp).toLocaleString()}`;
      
      sendSMS(adminPhone, message).catch(err => console.error("Background SMS failure:", err));
    }

    return NextResponse.json({ success: true, data: log });
  } catch (error) {
    console.error("PUT Log Error:", error);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}
