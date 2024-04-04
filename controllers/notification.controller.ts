import { NextFunction } from "express";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import NotificationModel from "../models/notification.model";
import ErrorHandler from "../utils/ErrorHandler";

export const getNotificationByUser = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return next(new ErrorHandler("Invalid entries", 400));
      }
      const notifications = await NotificationModel.find({ userId });
      res
        .status(200)
        .json({ message: "Retrieved all notifications", notifications });
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const updateNotification = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { notificationId } = req.body;
      if (!notificationId) {
        return next(new ErrorHandler("Invalid entries", 400));
      }
      const notification = await NotificationModel.findByIdAndUpdate(
        notificationId,
        {
          status: "read",
        },
        { new: true }
      );
      res.status(200).json({ message: "Updated notification", notification });
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
