require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import ErrorHandlerMiddleware from "./middleware/error";
import ErrorHandler from "./utils/ErrorHandler";
import { corsOptions } from "./config/corsOptions";
import { refreshAccessTokenMiddleware } from "./services/refresh.service";
import path from "path";
import cron from "node-cron";

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use("/", express.static(path.join(__dirname, "./uploads")));

//routers
import userRoutes from "./routes/user.routes";
import bookRoutes from "./routes/books.routes";
import notificationRoutes from "./routes/notification.routes";
import requestRoutes from "./routes/request.routes";
import RequestModel from "./models/request.model";

//testing api
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res
    .status(200)
    .json({ success: true, message: "library management system api working" });
});

//refresh user access token
app.use(refreshAccessTokenMiddleware);

app.use("/api/v1", userRoutes, bookRoutes, notificationRoutes, requestRoutes);

// Function to calculate fines and update requests
const calculateFinesAndUpdate = async () => {
  // Get all requests where inPrevDate has passed and status is "Out"
  const requests = await RequestModel.find({
    inPrevDate: { $lt: new Date() },
    status: { $eq: "Out" },
  });

  // Calculate fines for each request
  requests.forEach(async (request: any) => {
    // Calculate days overdue
    const daysOverdue: number = Math.ceil(
      (new Date().getTime() - new Date(request.inPrevDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Calculate fine amount (assuming 10 cedis per day)
    const fineAmount: number = daysOverdue * 10;

    // Update the request with the fine amount and status
    await RequestModel.findByIdAndUpdate(request._id, {
      fine: `${fineAmount} cedis`,
      status: "Overdue",
    });
  });
};

// Define the cron job to run daily at midnight
// cron.schedule("0 0 * * *", () => {
//   console.log("Running fine calculation and update job...");
//   calculateFinesAndUpdate();
// });

// Define the cron job to run every 2 minutes
cron.schedule("*/2 * * * *", () => {
  console.log("Running fine calculation and update job...");
  calculateFinesAndUpdate();
});

//unknown routes
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new ErrorHandler(`Route ${req.originalUrl} not found`, 400);
  next(err);
});

app.use(ErrorHandlerMiddleware);
