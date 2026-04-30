import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Attendance from "@/models/Attendance";
import { calculateAttendancePercentage } from "@/utils/attendanceUtils";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get all students
    const students = await User.find({ role: "student" }).lean();
    
    // Get all attendance records
    const allAttendance = await Attendance.find({}).lean();
    
    // Calculate unique days in the system (total possible days)
    const uniqueDates = Array.from(new Set(allAttendance.map(a => a.date)));
    const totalPossibleDays = uniqueDates.length || 1; // Default to 1 to avoid div by zero

    const studentsAttendance = students.map((student: any) => {
      const studentRecords = allAttendance.filter(a => a.userId.toString() === student._id.toString());
      const daysPresent = studentRecords.length;
      
      // Get last seen timestamp
      let lastSeen = null;
      if (studentRecords.length > 0) {
        // Sort by date descending
        const sorted = studentRecords.sort((a, b) => b.date.localeCompare(a.date));
        const lastDay = sorted[0];
        lastSeen = lastDay.timestamps[lastDay.timestamps.length - 1];
      }

      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        daysPresent,
        totalDays: totalPossibleDays,
        percentage: parseFloat(calculateAttendancePercentage(daysPresent, totalPossibleDays)),
        lastSeen
      };
    });

    // Sort by lowest attendance first as requested
    studentsAttendance.sort((a, b) => a.percentage - b.percentage);

    return NextResponse.json({ 
      success: true, 
      data: studentsAttendance,
      totalPossibleDays
    });

  } catch (error: any) {
    console.error("Fetch Attendance Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
