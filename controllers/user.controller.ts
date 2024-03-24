require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import UserModel from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import sendToken from "../utils/jwt";
import { PipelineStage, isObjectIdOrHexString } from "mongoose";

interface IRegistrationBody {
  index_no: string;
  surname: string;
  first_name: string;
  other_name: string;
  date_of_birth: any;
  password: string;
  role: string;
}

//user account creation
export const UserRegistration = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { index_no, surname, first_name, other_name, date_of_birth, role } =
        req.body as IRegistrationBody;

      const password = date_of_birth;

      const isStaffExist = await UserModel.findOne({ index_no });
      if (isStaffExist) {
        return next(new ErrorHandler("Student already exists", 400));
      }

      const user = {
        index_no,
        surname,
        first_name,
        other_name,
        date_of_birth,
        password,
        role,
      };

      console.log(user);

      await UserModel.create(user);
      res
        .status(201)
        .json({ success: true, message: "User created successfully" });
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//login user
interface ILoginRequest {
  index_no: string;
  password: string;
}

export const UserLogin = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { index_no, password } = req.body as ILoginRequest;
      if (!index_no || !password) {
        return next(
          new ErrorHandler("Index Number and Password Required", 400)
        );
      }

      const user = await UserModel.findOne({ index_no }).select("+password");
      if (!user) {
        return next(
          new ErrorHandler("Incorrect index number or password", 400)
        );
      }

      const isPasswordMatch = await user.comparePassword(password);

      if (!isPasswordMatch) {
        return next(new ErrorHandler("Incorrect email or password", 400));
      }

      // Check if the password is the default "secret"
      const isDefaultPassword = await user.comparePassword("secret");

      if (isDefaultPassword) {
        // The user logged in with the default password
        return sendToken(user, 200, res, { requiresPasswordChange: true });
      }

      user.status = true;
      await user.save();

      // The user logged in with a password other than the default, send the token
      sendToken(user, 200, res);
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//load user
export const LoadUser = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await UserModel.findById(req.user?._id);
      console.log(user);
      if (!user) {
        return next(
          new ErrorHandler(
            "Your session has timed out. Log in again to continue",
            400
          )
        );
      }

      res.status(200).json({ success: true, user });
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//logout user
export const UserLogout = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await UserModel.findById(req.user?._id);

      if (user) {
        const lastSeen = new Date();
        user.lastSeen = lastSeen;
        user.status = false;
        await user.save();
      }

      res.cookie("access_token", "", { maxAge: 1 });
      console.log(req.user);

      res.status(200).json({
        success: true,
        message: "Logout successful!",
      });
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//update user password
interface IUpdatePassword {
  oldPassword: string;
  newPassword: string;
}

export const updatePassword = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } = req.body as IUpdatePassword;

      if (!oldPassword || !newPassword) {
        return next(new ErrorHandler("Please enter old and new password", 400));
      }

      const user = await UserModel.findById(req.user?._id).select("+password");

      if (user?.password == undefined) {
        return next(new ErrorHandler("Invalid user", 400));
      }
      const isPasswordMatch = await user?.comparePassword(oldPassword);

      if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid old Password", 400));
      }
      user.password = newPassword;
      await user.save();
      res.status(200).json({ success: true, user });
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//get all users
interface QueryParams {
  page?: string;
  limit?: string;
}

export const AllUsers = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit }: QueryParams = req.query;

      const parsedPage = parseInt(page || "1", 10);
      const parsedLimit = parseInt(limit || "25", 10);

      const sortField = req.query.sortField;
      const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

      const searchQuery = req.query.search || "";
      const searchFilters = {
        $or: [
          { staffID: { $regex: searchQuery, $options: "i" } },
          { fullName: { $regex: searchQuery, $options: "i" } },
          { organization: { $regex: searchQuery, $options: "i" } },
          { userType: { $regex: searchQuery, $options: "i" } },
          { toOrg: { $regex: searchQuery, $options: "i" } },
          { fromOrg: { $regex: searchQuery, $options: "i" } },
        ],
      };

      const totalCount = await UserModel.countDocuments(searchFilters);
      const totalPages = Math.ceil(totalCount / parsedLimit);

      const validPage = Math.max(1, Math.min(parsedPage, totalPages));

      const startIndex = (validPage - 1) * parsedLimit;

      const pipeline: PipelineStage[] = [
        { $match: searchFilters },
        { $sort: { [sortField as string]: sortOrder } },
        { $skip: startIndex },
        { $limit: parsedLimit },
      ];

      const users = await UserModel.aggregate(pipeline);

      const response = {
        page: parsedPage,
        limit: parsedLimit,
        totalPages,
        totalCount,
        users,
      };

      res.status(200).json({ success: true, response });
    } catch (error: any) {
      console.error(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// delete user
export const deleteUser = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: userId } = req.params;

      console.log(userId, isObjectIdOrHexString(userId));
      const user = await UserModel.findById(userId);

      if (!user) {
        return next(new ErrorHandler("User does not exist", 400));
      }

      const deletedUser = await UserModel.findByIdAndDelete(userId);

      res.status(200).json({
        success: true,
        message: `User Deleted`,
        data: deleteUser,
      });
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
