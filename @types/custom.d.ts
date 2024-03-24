import { IUser } from "./../models/user.model";
import { Request } from "express";
IUser;

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
