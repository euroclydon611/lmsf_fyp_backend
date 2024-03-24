import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import catchAsyncErrors from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import UserModel from "../models/user.model";

// authenticated user middleware
const isAuthenticated = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { access_token } = req.cookies;

    if (!access_token) {
      return next(
        new ErrorHandler("Session Timeout. Please login to continue", 400)
      );
    }

    const decoded = jwt.verify(
      access_token,
      process.env.ACCESS_TOKEN as string
    ) as { id: string } | JwtPayload;

    if (!decoded) {
      return next(new ErrorHandler("Access token is not valid", 400));
    }

    // You might fetch user data from your database here
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return next(new ErrorHandler("User not found", 400));
    }

    // Assign the user to the request object
    req.user = user;
    next();
  }
);

//validate user role
const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(
        new ErrorHandler(
          `You do not have permission to access this resource.`,
          403
        )
      );
    }
    next();
  };
};

export { isAuthenticated, authorizeRoles };
