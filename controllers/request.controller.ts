import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import RequestModel, { IRequest } from "../models/request.model";
import BookModel from "../models/books.model";
import UserModel from "../models/user.model";
import NotificationModel from "../models/notification.model";

export const makeRequest = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, bookId } = req.body;
      if (!userId || !bookId) {
        return next(new ErrorHandler("Invalid entries", 400));
      }
      const user = await UserModel.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }
      const book = await BookModel.findById(bookId);
      if (!book) {
        return next(new ErrorHandler("Book not found", 404));
      }

      // Check if there is already a pending request for the same user and book
      const existingRequest = await RequestModel.findOne({
        userId,
        bookId,
        status: "Pending",
      });
      if (existingRequest) {
        return next(
          new ErrorHandler(
            "You have already requested to borrow this book. Your request is pending approval.",
            400
          )
        );
      }

      if (book.availableStock <= 0) {
        return next(new ErrorHandler("Book not available", 400));
      }
      const requestData = {
        userId,
        bookId,
        requestDate: new Date(),
        approveDate: null,
        inDate: null,
        outDate: null,
        approvedBy: null,
        inPrevDate: null,
        status: "Pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as IRequest;
      const request = await RequestModel.create(requestData);
      await NotificationModel.create({
        userId: book.patronId,
        message: `${user.index_no}-${user.surname} ${user.first_name} has requested to borrow ${book.title}`,
        status: "Pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      res.status(201).json({
        message:
          "Your request to borrow this book has been successfully submitted and is pending approval.",
        request,
      });
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getAllRequests = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return next(new ErrorHandler("Invalid entries", 400));
      }
      const user = await UserModel.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }
      if (user.role !== "PATRON" && user.role !== "admin") {
        return next(new ErrorHandler("Don't do this", 400));
      }
      const requests = await RequestModel.find();
      res.status(200).json({ message: "Retrieved all requests", requests });
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const approveRequest = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { requestId, patronId } = req.body;
      if (!requestId) {
        return next(new ErrorHandler("Invalid entries", 400));
      }
      const patron = await UserModel.findById(patronId);
      if (!patron) {
        return next(new ErrorHandler("Patron not found", 404));
      }
      if (patron.role !== "PATRON") {
        return next(
          new ErrorHandler("Only librarians can approve requests", 400)
        );
      }
      const request = await RequestModel.findByIdAndUpdate(
        requestId,
        {
          approveDate: new Date(),
          status: "Approved",
          approvedBy: patronId,
          updatedAt: new Date(),
        },
        { new: true }
      );
      const book = await BookModel.find({ _id: request?.bookId });
      await NotificationModel.create({
        userId: request?.userId,
        message: `Your request for ${book[0]?.title} has been approved`,
        status: "Pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      res
        .status(200)
        .json({ message: "Request approved successfully", request });
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const checkoutRequest = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { requestId, patronId, inPrevDate } = req.body;
      if (!requestId) {
        return next(new ErrorHandler("Invalid entries", 400));
      }
      const patron = await UserModel.findById(patronId);
      if (!patron) {
        return next(new ErrorHandler("Patron not found", 404));
      }
      if (patron.role !== "PATRON") {
        return next(
          new ErrorHandler("Only librarians can approve checkout", 400)
        );
      }
      const request = await RequestModel.findByIdAndUpdate(
        requestId,
        {
          outDate: new Date(),
          inPrevDate: inPrevDate,
          status: "Out",
          updatedAt: new Date(),
          approvedBy: patronId,
        },
        { new: true }
      );
      const book = await BookModel.findById(request?.bookId);
      if (!book) {
        return next(new ErrorHandler("Book not found", 404));
      }
      const bookUpdated = await BookModel.findByIdAndUpdate(
        book?._id,
        {
          availableStock: book!.availableStock! - 1,
          updatedAt: new Date(),
        },
        { new: true }
      );
      res
        .status(200)
        .json({ message: "Request checked out successfully", request });
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const approveAndCheckoutRequest = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { studentId, patronId, inPrevDate, bookId } = req.body;
      if (!studentId || !patronId || !inPrevDate || !bookId) {
        return next(new ErrorHandler("Invalid entries", 400));
      }
      const patron = await UserModel.findById(patronId);
      if (!patron) {
        return next(new ErrorHandler("Patron not found", 404));
      }
      if (patron.role !== "PATRON") {
        return next(
          new ErrorHandler("Only librarians can approve checkout", 400)
        );
      }
      const student = await UserModel.findById(studentId);
      if (!student) {
        return next(new ErrorHandler("Student not found", 404));
      }
      const book = await BookModel.findById(bookId);
      if (!book) {
        return next(new ErrorHandler("Book not found", 404));
      }

      const request = {
        userId: studentId,
        bookId: bookId,
        requestDate: new Date(),
        approveDate: new Date(),
        inDate: null,
        outDate: new Date(),
        approvedBy: patronId,
        inPrevDate: inPrevDate,
        status: "Approved",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await RequestModel.create(request);

      await BookModel.findByIdAndUpdate(
        book?._id,
        {
          availableStock: book!.availableStock! - 1,
          updatedAt: new Date(),
        },
        { new: true }
      );
      res.status(200).json({
        message: "Request approved and checked out successfully",
        request,
      });
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const checkInRequest = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { requestId, patronId } = req.body;
      if (!requestId) {
        return next(new ErrorHandler("Invalid entries", 400));
      }
      const patron = await UserModel.findById(patronId);
      if (!patron) {
        return next(new ErrorHandler("Patron not found", 404));
      }
      if (patron.role !== "PATRON") {
        return next(
          new ErrorHandler("Only librarians can approve checkout", 400)
        );
      }
      const request = await RequestModel.findByIdAndUpdate(
        requestId,
        {
          inDate: new Date(),
          status: "In",
          updatedAt: new Date(),
        },
        { new: true }
      );
      const book = await BookModel.findById(request?.bookId);
      if (!book) {
        return next(new ErrorHandler("Book not found", 404));
      }
      const bookUpdated = await BookModel.findByIdAndUpdate(
        book?._id,
        {
          availableStock: book!.availableStock! + 1,
          updatedAt: new Date(),
        },
        { new: true }
      );
      res
        .status(200)
        .json({ message: "Request checked in successfully", request });
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getRequestByUser = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return next(new ErrorHandler("Invalid entries", 400));
      }
      const requests = await RequestModel.find({ userId });
      res.status(200).json({ message: "Retrieved all requests", requests });
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getRequestByPatron = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { patronId } = req.body;
      if (!patronId) {
        return next(new ErrorHandler("Invalid entries", 400));
      }
      const requests = await RequestModel.find({ patronId });
      res.status(200).json({ message: "Retrieved all requests", requests });
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getRequestByStatus = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, userId } = req.params;
      if (!status) {
        return next(new ErrorHandler("Invalid entries", 400));
      }
      const user = await UserModel.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }
      if (user.role !== "PATRON" && user.role !== "ADMIN") {
        return next(new ErrorHandler("Don't do this", 400));
      }
      const requests = await RequestModel.find({ status })
        .populate("userId")
        .populate("bookId");
      res.status(200).json({ message: "Retrieved all requests", requests });
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//get all users requests and show as history
import mongoose from "mongoose";

export const getStudentsRequestAsHistory = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      // Convert userId to MongoDB ObjectId
      const userIdObjectId = new mongoose.Types.ObjectId(userId);

      // Find requests for the given user and sort them by createdAt
      const requests = await RequestModel.find({ userId: userIdObjectId })
        .populate("bookId")
        .sort("-createdAt");

      res.status(200).json({ message: "Retrieved requests", requests });
    } catch (error: any) {
      console.error(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

import * as xlsx from "xlsx";

export const exportRequests = async (req: Request, res: Response) => {
  const { status } = req.query;

  try {
    // Fetch requests based on status
    const requests = await RequestModel.find({ status })
      .populate("userId", "index_no first_name last_name")
      .populate("bookId", "title");

    // Prepare data for Excel
    const data = requests.map((request: IRequest) => ({
      "User Index No": request.userId.index_no,
      "User First Name": request.userId.first_name,
      "User Last Name": request.userId.last_name,
      "Book Title": request.bookId.title,
      "Request Date": request.requestDate,
      "Approve Date": request.approveDate,
      "In Date": request.inDate,
      "Out Date": request.outDate,
      "In Previous Date": request.inPrevDate,
      Fine: request.fine,
      Status: request.status,
      "Created At": request.createdAt,
      "Updated At": request.updatedAt,
    }));

    // Create a new workbook
    const workbook = xlsx.utils.book_new();

    // Convert data to worksheet
    const worksheet = xlsx.utils.json_to_sheet(data);

    // Add worksheet to workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, "Requests");

    // Generate Excel file
    const excelBuffer = xlsx.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=requests.xlsx");

    // Send the Excel file as response
    res.send(excelBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
