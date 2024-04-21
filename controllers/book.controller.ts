import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import BookModel, { IBook } from "../models/books.model";
import UserModel from "../models/user.model";
import { PipelineStage } from "mongoose";

export const createBook = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(req.body);

      const patronId = req.body.patronId;
      if (!patronId) {
        return next(new ErrorHandler("Patron Id is invalid!", 400));
      }

      const patron = await UserModel.findById(patronId);

      if (patron?.role !== "PATRON") {
        return next(new ErrorHandler("Only librarians can add books", 400));
      }
      if (!patron) {
        return next(new ErrorHandler("Patron Id is invalid!", 400));
      } else {
        const files: any = req.files;
        const imageUrls =
          files && files?.map((file: any) => `${file.filename}`);

        const bookData = req.body;
        bookData.images = imageUrls;
        bookData.patron = patron;
        bookData.availableStock = req.body.totalStock;

        const product = await BookModel.create(bookData);

        res.status(201).json({
          success: true,
          message: "Book created",
          product,
        });
      }
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
interface QueryParams {
  page?: string;
  limit?: string;
}

export const getAllBooks = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit }: QueryParams = req.query;

      console.log(req.query);

      const parsedPage = parseInt(page || "1", 10);
      const parsedLimit = parseInt(limit || "25", 10);

      const sortField = req.query.sortField;
      const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;
      const searchQuery = req.query.search || "";
      const searchFilters = {
        $or: [
          { title: { $regex: searchQuery, $options: "i" } },
          { description: { $regex: searchQuery, $options: "i" } },
          { category: { $regex: searchQuery, $options: "i" } },
          { authors: { $regex: searchQuery, $options: "i" } },
        ],
      };
      const totalCount = await BookModel.countDocuments(searchFilters);
      const totalPages = Math.ceil(totalCount / parsedLimit);

      const validPage = Math.max(1, Math.min(parsedPage, totalPages));

      const startIndex = (validPage - 1) * parsedLimit;

      const pipeline: PipelineStage[] = [
        { $match: searchFilters },
        { $sort: { [sortField as string]: sortOrder } },
        { $skip: startIndex },
        { $limit: parsedLimit },
      ];

      const books = await BookModel.aggregate(pipeline);

      const response = {
        page: parsedPage,
        limit: parsedLimit,
        totalPages,
        totalCount,
        books,
      };

      res.status(200).json({ message: "Retrieved all books", response });
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const updateBook = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const book = req.body as IBook;
      const { id: book_id } = req.params;

      if (!book_id) {
        return next(new ErrorHandler("Book not found", 400));
      }

      const updated_book = await BookModel.findByIdAndUpdate(book_id, book, {
        new: true,
      });

      res.status(200).json({ message: "Retrieved all books", updated_book });
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const deleteBook = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: book_id } = req.params;

      if (!book_id) {
        return next(new ErrorHandler("Book not found", 400));
      }

      const deleted_book = await BookModel.findByIdAndDelete(book_id);

      res.status(200).json({ message: "Retrieved all books", deleted_book });
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
