import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Attendance from "@/models/Attendance";
import User from "@/models/User";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    await dbConnect();
    const { userId } = await context.params;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const records = await Attendance.find({ userId }).sort({ date: -1 }).lean();

    return NextResponse.json({
      success: true,
      data: {
        user: {
          name: user.name,
          role: user.role,
          email: user.email
        },
        records
      }
    });

  } catch (error: any) {
    console.error("Fetch User Attendance Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
