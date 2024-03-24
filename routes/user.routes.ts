import express from "express";
const router = express.Router();

import {
  UserRegistration,
  UserLogin,
  UserLogout,
  updatePassword,
  LoadUser,
  AllUsers,
  deleteUser,
} from "../controllers/user.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import multerMiddleware from "../middleware/multerMiddleware";

//user user
router.post(
  "/registration",
  multerMiddleware().single("file"),
  UserRegistration
);

//login user
router.post("/login", UserLogin);

//load user to check if token not expired
router.get("/load-user", isAuthenticated, LoadUser);

//logout user
router.get("/logout", isAuthenticated, UserLogout);

//update user password
router.put("/update-user-password", isAuthenticated, updatePassword);

//get all users
router.get("/all-users", AllUsers);

router.delete("/delete-user/:id", isAuthenticated, deleteUser);

export default router;
