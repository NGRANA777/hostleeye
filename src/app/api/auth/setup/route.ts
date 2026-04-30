import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    
    const usersCount = await User.countDocuments();
    if (usersCount > 0) {
      return NextResponse.json({ message: "Setup already completed" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash("admin123", 10);
    const adminUser = await User.create({
      name: "Admin",
      username: "admin",
      passwordHash,
      role: "admin"
    });

    return NextResponse.json({ success: true, message: "Default admin user 'admin' created with password 'admin123'" });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
