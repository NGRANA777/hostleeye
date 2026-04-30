import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Attendance from "@/models/Attendance";
import { formatDateKey } from "@/utils/attendanceUtils";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const today = formatDateKey(new Date());
    const now = new Date();

    // Find attendance for today
    let attendance = await Attendance.findOne({ userId, date: today });

    if (attendance) {
      // Check if last timestamp was within 30 minutes
      const lastTimestamp = attendance.timestamps[attendance.timestamps.length - 1];
      const diffMinutes = (now.getTime() - new Date(lastTimestamp).getTime()) / (1000 * 60);

      if (diffMinutes < 30) {
        return NextResponse.json({ 
          success: true, 
          message: "Attendance already marked recently. Next check-in available in " + Math.ceil(30 - diffMinutes) + " minutes.",
          alreadyMarked: true 
        });
      }

      // Add new timestamp
      attendance.timestamps.push(now);
      await attendance.save();
    } else {
      // Create new attendance record for today
      attendance = await Attendance.create({
        userId,
        date: today,
        timestamps: [now],
        status: "Present"
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Attendance marked successfully", 
      data: attendance 
    });

  } catch (error: any) {
    console.error("Attendance Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
