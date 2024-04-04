import express from "express";
const router = express.Router();

import {
  createBook,
  getAllBooks,
  updateBook,
  deleteBook,
} from "../controllers/book.controller";
import { isAuthenticated } from "../middleware/auth";
import multerMiddleware from "../middleware/multerMiddleware";

router.post("/create-book", multerMiddleware().array("files"), createBook);

router.get("/get-all-books", getAllBooks);

router.put("/update-book", isAuthenticated, updateBook);

router.delete("/delete-book/:id", isAuthenticated, deleteBook);

export default router;
