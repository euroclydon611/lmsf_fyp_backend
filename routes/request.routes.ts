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
    getRequestByStatus
} from "../controllers/request.controller";

import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import multerMiddleware from "../middleware/multerMiddleware";

router.post("/make-request", isAuthenticated, makeRequest);
router.patch("/get-all-requests", isAuthenticated, getAllRequests);
router.post("/approve-request", isAuthenticated, approveRequest);
router.post("/checkout-request", isAuthenticated, checkoutRequest);
router.post("/approve-and-checkout-request", isAuthenticated, approveAndCheckoutRequest);
router.post("/check-in-request", isAuthenticated, checkInRequest);
router.patch("/get-request-user", isAuthenticated, getRequestByUser);
router.patch("/get-request-patron", isAuthenticated, getRequestByPatron);
router.patch("/get-request-status", isAuthenticated, getRequestByStatus);

export default router;