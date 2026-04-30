import mongoose, { Schema, Document, models } from "mongoose";

export interface IStudent extends Document {
  studentId: string;
  name: string;
  roomNumber: string;
  embeddings: number[][]; 
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema = new Schema(
  {
    studentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    roomNumber: { type: String, required: true },
    embeddings: { type: [[Number]], default: [] },
  },
  { timestamps: true }
);

export default models.Student || mongoose.model<IStudent>("Student", StudentSchema);
