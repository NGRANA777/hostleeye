import mongoose, { Schema, Document, models } from "mongoose";

export interface ILog extends Document {
  type: "AUTHORIZED" | "UNAUTHORIZED";
  timestamp: Date;
  location: string;
  snapshotData?: string; 
  studentId?: string; 
  status: "PENDING" | "SAFE" | "THREAT";
}

const LogSchema: Schema = new Schema({
  type: { type: String, required: true, enum: ["AUTHORIZED", "UNAUTHORIZED"] },
  timestamp: { type: Date, default: Date.now },
  location: { type: String, required: true },
  snapshotData: { type: String },
  studentId: { type: String },
  status: { type: String, default: "PENDING", enum: ["PENDING", "SAFE", "THREAT"] },
});

export default models.Log || mongoose.model<ILog>("Log", LogSchema);
