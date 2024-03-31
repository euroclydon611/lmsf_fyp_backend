import mongoose, { Schema, Model } from "mongoose";

export interface IRequest {
    userId: string;
    bookId: string;
    approvedBy: string | null;
    requestDate: Date;
    approveDate: Date | null;
    inDate: Date | null;
    outDate: Date | null;
    inPrevDate: Date | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

const requestSchema = new Schema<IRequest>({
    userId: { type: String },
    bookId: { type: String },
    approvedBy: { type: String },
    requestDate: { type: Date },
    approveDate: { type: Date },
    inDate: { type: Date },
    outDate: { type: Date },
    inPrevDate: { type: Date },
    status: { type: String },
    createdAt: { type: Date },
    updatedAt: { type: Date },
});

const RequestModel: Model<IRequest> = mongoose.model("request", requestSchema);

export default RequestModel;