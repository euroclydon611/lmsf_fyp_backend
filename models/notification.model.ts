import mongoose, { Schema, Model } from "mongoose";

export interface INotification {
    userId: string;
    message: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
    userId: { type: String },
    message: { type: String },
    status: { type: String },
    createdAt: { type: Date },
    updatedAt: { type: Date },
});

const NotificationModel: Model<INotification> = mongoose.model("notification", notificationSchema);

export default NotificationModel;