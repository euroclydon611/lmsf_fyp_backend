import mongoose, { Schema, Model } from "mongoose";

export interface IRequest {
  userId: any;
  bookId: any;
  approvedBy: string | null;
  requestDate: Date;
  approveDate: Date | null;
  inDate: Date | null;
  outDate: Date | null;
  inPrevDate: Date | null;
  status: string;
  fine: string;
  createdAt: Date;
  updatedAt: Date;
}

const requestSchema = new Schema<IRequest>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  bookId: { type: Schema.Types.ObjectId, ref: "book" },
  approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  requestDate: { type: Date },
  approveDate: { type: Date },
  inDate: { type: Date },
  outDate: { type: Date },
  inPrevDate: { type: Date },
  fine: { type: String },
  status: { type: String },
  createdAt: { type: Date },
  updatedAt: { type: Date },
});

const RequestModel: Model<IRequest> = mongoose.model("request", requestSchema);

export default RequestModel;
