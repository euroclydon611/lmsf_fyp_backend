import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import BookModel, { IBook } from "../models/books.model";
import UserModel from "../models/user.model";

export const createBook = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cover, title, authors, description, publicationDate, publisher, pages, category, totalStock, patronId } = req.body as IBook;
    

      if (!cover || !title || !authors || !description || !publicationDate || !publisher || !pages || !category || !totalStock || !patronId) {
        return next(new ErrorHandler("book data is empty", 400));
      }

      const patron = await UserModel.findById(patronId);

      if (!patron) {
        return next(new ErrorHandler("Patron not found", 404));
      }

      if (patron.role !== "patron") {
        return next(new ErrorHandler("Only librarians can create books", 400));
      }

      const created_book = await BookModel.create({
        cover,
        title,
        authors,
        description,
        publicationDate,
        publisher,
        pages,
        category,
        totalStock,
        availableStock: totalStock,
        patronId,
      });

      console.log("reached", created_book);

      res
        .status(201)
        .json({ message: "Book created successfully", book: created_book });
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getAllBooks = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const books = await BookModel.find();

      if (!books) {
        return next(new ErrorHandler("No book(s) found", 400));
      }

      res
        .status(200)
        .json({ message: "Retrieved all books", count: books.length, books });
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
