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
        message: `${user.surname} ${user.first_name} has requested to borrow ${book.title}`,
        status: "Pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      res
        .status(201)
        .json({ message: "Request created successfully", request });
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getAllRequests = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return next(new ErrorHandler("Invalid entries", 400));
      }
      const user = await UserModel.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }
      if (user.role !== "patron" && user.role !== "admin") {
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
      if (patron.role !== "Patron") {
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
        status: "Approved",
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
      if (patron.role !== "Patron") {
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
      if (patron.role !== "patron") {
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
      }
      
      const bookUpdated = await BookModel.findByIdAndUpdate(
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
      if (patron.role !== "patron") {
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
      const { status, userId } = req.body;
      if (!status) {
        return next(new ErrorHandler("Invalid entries", 400));
      }
      const user = await UserModel.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }
      if (user.role !== "patron" && user.role !== "admin") {
        return next(new ErrorHandler("Don't do this", 400));
      }
      const requests = await RequestModel.find({ status });
      res.status(200).json({ message: "Retrieved all requests", requests });
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
