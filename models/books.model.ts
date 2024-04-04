import { timeStamp } from "console";
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBook {
  images: string[];
  title: string;
  authors: string[];
  description: string;
  publicationDate: number;
  publisher: string;
  pages: number;
  category: string;
  totalStock: number;
  availableStock: number;
  patronId: string;
  patron: Object;
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<IBook>(
  {
    images: [
      {
        type: String,
      },
    ],
    title: { type: String },
    authors: { type: [String] },
    description: { type: String },
    publicationDate: { type: Number },
    publisher: { type: String },
    pages: { type: Number },
    category: { type: String },
    totalStock: { type: Number },
    availableStock: { type: Number },
    patronId: { type: String },
    patron: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
);

const BookModel: Model<IBook> = mongoose.model("book", bookSchema);

export default BookModel;
