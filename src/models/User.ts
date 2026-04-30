import mongoose, { Schema, Document, models } from "mongoose";

export interface IUser extends Document {
  name: string;
  studentId?: string;
  roomNumber?: string;
  email?: string;
  username?: string;
  passwordHash?: string;
  faceEncoding?: number[][];
  role: "admin" | "warden" | "student";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    studentId: { type: String, sparse: true, unique: true },
    roomNumber: { type: String },
    email: { type: String, sparse: true },
    username: { type: String, sparse: true, unique: true },
    passwordHash: { type: String },
    faceEncoding: { type: [[Number]], default: [] },
    role: { type: String, default: "student", enum: ["admin", "warden", "student"] },
  },
  { timestamps: true }
);

export default models.User || mongoose.model<IUser>("User", UserSchema);
