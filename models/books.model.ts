import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBook {
  cover: string;
  title: string;
  authors: string[];
  description: string;
  publicationDate: Date;
  publisher: string;
  pages: number;
  category: string;
}

const bookSchema = new Schema<IBook>({
  cover: { type: String },
  title: { type: String },
  authors: { type: [String] },
  description: { type: String },
  publicationDate: { type: Date },
  publisher: { type: String },
  pages: { type: Number },
  category: { type: String },
});

const BookModel: Model<IBook> = mongoose.model("book", bookSchema);

export default BookModel;
