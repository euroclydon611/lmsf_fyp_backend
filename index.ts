require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import ErrorHandlerMiddleware from "./middleware/error";
import ErrorHandler from "./utils/ErrorHandler";
import { exec } from "child_process";
import { corsOptions } from "./config/corsOptions";
import { refreshAccessTokenMiddleware } from "./services/refresh.service";

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(cors(corsOptions));

//routers
import userRoutes from "./routes/user.routes";
import bookRoutes from "./routes/books.routes";

//testing api
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res
    .status(200)
    .json({ success: true, message: "library management system api working" });
});

//refresh user access token
app.use(refreshAccessTokenMiddleware);

app.use("/api/v1", userRoutes, bookRoutes);

//route to backup the database
app.get("/backup", (req: Request, res: Response, next: NextFunction) => {
  exec(
    `mongodump --db LIBRARY_MGT_DB --out "C:\\Users\\GEORGE MENSAH SENIOR\\Desktop"`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return res
          .status(500)
          .json({ success: false, message: "Backup failed error" });
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return res
          .status(500)
          .json({ success: false, message: "Backup failed stderr" });
      }
      console.log(`stdout: ${stdout}`);
      return res
        .status(200)
        .json({ success: true, message: "Backup completed" });
    }
  );
});

//unknown routes
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new ErrorHandler(`Route ${req.originalUrl} not found`, 400);
  next(err);
});

app.use(ErrorHandlerMiddleware);
