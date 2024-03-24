import { allowedOrigins } from "./allowedOrigins";

export const corsOptions = {
  origin: (origin: any, callback: any) => {
    //check if the origin is specified in the allowedOrigins
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
