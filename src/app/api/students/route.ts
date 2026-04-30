import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    const students = await User.find({ role: "student" }).sort({ createdAt: -1 });
    
    // Map faceEncoding to embeddings for compatibility with face-api utility
    const mappedStudents = students.map(s => ({
      ...s.toObject(),
      embeddings: s.faceEncoding
    }));

    return NextResponse.json({ success: true, data: mappedStudents });
  } catch (error) {
    console.error("GET Students Error:", error);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    const userData = {
      ...body,
      role: "student",
      faceEncoding: body.embeddings || body.faceEncoding || []
    };

    const user = await User.create(userData);
    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "Identifier already exists" }, { status: 400 });
    }
    console.error("POST Student Error:", error);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}
