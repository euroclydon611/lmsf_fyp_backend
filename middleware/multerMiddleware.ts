import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";

interface MulterMiddlewareOptions {
  dest?: string;
  fileFilter?: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => void;
}

const multerMiddleware = (options: MulterMiddlewareOptions = {}) => {
  const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: any) => {
      cb(null, options.dest || "uploads");
    },
    filename: (req: Request, file: Express.Multer.File, cb: any) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const filename = path.parse(file.originalname).name;
      const ext = file.originalname.split(".").pop();
      cb(null, filename + "-" + "[" + uniqueSuffix + "]" + `.${ext}`);
    },
  });

  const upload = multer({
    storage,
    fileFilter: options.fileFilter,
  });

  return upload;
};

export default multerMiddleware;
