require("dotenv").config();
import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export interface IUser extends Document {
  index_no: string;
  surname: string;
  first_name: string;
  other_name: string;
  password: string;
  date_of_birth: Date;
  role: string;
  status: boolean;
  lastSeen: Date;
  comparePassword: (password: string) => Promise<boolean>;
  SignAccessToken: () => string;
}

const userSchema = new Schema<IUser>(
  {
    index_no: {
      type: String,
      required: [true, "Please enter your staff id"],
      trim: true,
    },
    surname: {
      type: String,
      required: [true, "Please enter your surname name"],
      trim: true,
    },
    first_name: {
      type: String,
      required: [true, "Please enter your first name"],
      trim: true,
    },

    other_name: {
      type: String,
      trim: true,
    },

    date_of_birth: {
      type: Date,
      required: [true, "Please enter date of birth"],
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Please enter your password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    role: {
      type: String,
      default: "STUDENT",
    },
    status: {
      type: Boolean,
      default: false,
    },
    lastSeen: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        // Exclude createdAt and updatedAt from the response
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.__v;

        return ret;
      },
    },
  }
);

//pre-save middleware to hash the password
userSchema.pre(
  "save",
  async function hashPasswordMiddleware(next: (error?: Error) => void) {
    if (!this.isModified("password")) {
      return next();
    }

    try {
      const hashedPassword = await bcrypt.hash(this.password, 10);
      this.password = hashedPassword;
      return next();
    } catch (error: any) {
      return next(error);
    }
  }
);

// sign access token
userSchema.methods.SignAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      staffID: this.staffID,
      fullName: this.fullName,
      organization: this.organization,
      userType: this.userType,
      fromOrg: this.fromOrg,
      toOrg: this.toOrg,
    },
    process.env.ACCESS_TOKEN || "",
    {
      expiresIn: "5h",
    }
  );
};

// compare password
userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const UserModel: Model<IUser> = mongoose.model("User", userSchema);

export default UserModel;
