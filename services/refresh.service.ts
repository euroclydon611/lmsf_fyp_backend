import express, { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import { IUser } from "../models/user.model";

export const refreshAccessTokenMiddleware = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { access_token } = req.cookies;

      if (access_token) {
        const decoded = jwt.verify(
          access_token,
          process.env.ACCESS_TOKEN as string
        ) as IUser;

        req.user = decoded;

        console.log(req.user);
      }
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
    next();
  }
);
