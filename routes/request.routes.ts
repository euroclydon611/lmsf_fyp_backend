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
router.post("/approve-checkout", isAuthenticated, approveAndCheckoutRequest);
router.post("/checkin", isAuthenticated, checkInRequest);
router.patch("/request-user", isAuthenticated, getRequestByUser);
router.patch("/request-patron", isAuthenticated, getRequestByPatron);
router.patch("/request-status", isAuthenticated, getRequestByStatus);

export default router;