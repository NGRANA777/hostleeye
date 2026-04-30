import mongoose, { Schema, Document, models } from "mongoose";

export interface IAttendance extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  timestamps: Date[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    timestamps: { type: [Date], default: [] },
    status: { type: String, default: "Present" },
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness of userId and date
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

export default models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);
