import express from "express";
const router = express.Router();

import {
    getNotificationByUser,
    updateNotification
} from "../controllers/notification.controller";
import { isAuthenticated } from "../middleware/auth";

router.get("/notifications/:id", isAuthenticated, getNotificationByUser);
router.patch("/notifications", isAuthenticated, updateNotification);

export default router;