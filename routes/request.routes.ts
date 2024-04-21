import express from "express";
const router = express.Router();

import {
  makeRequest,
  getAllRequests,
  approveRequest,
  checkoutRequest,
  approveAndCheckoutRequest,
  checkInRequest,
  getRequestByUser,
  getRequestByPatron,
  getRequestByStatus,
  getStudentsRequestAsHistory,
  exportRequests,
} from "../controllers/request.controller";

import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import multerMiddleware from "../middleware/multerMiddleware";

router.post("/make-request", isAuthenticated, makeRequest);
router.get("/get-all-requests/:userId", isAuthenticated, getAllRequests);
router.post("/approve-request", isAuthenticated, approveRequest);
router.post("/checkout-request", isAuthenticated, checkoutRequest);
router.post("/approve-checkout", isAuthenticated, approveAndCheckoutRequest);
router.post("/checkin", isAuthenticated, checkInRequest);
router.patch("/request-user", isAuthenticated, getRequestByUser);
router.patch("/request-patron", isAuthenticated, getRequestByPatron);
router.get(
  "/request-status/:status/:userId",
  isAuthenticated,
  getRequestByStatus
);

router.get("/fetch-student-request/:userId", getStudentsRequestAsHistory);

router.get("/export-request", exportRequests);

export default router;
