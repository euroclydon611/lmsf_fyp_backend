import express from "express";
const router = express.Router();

import {
    getNotificationByUser,
    updateNotification
} from "../controllers/notification.controller";
import { isAuthenticated } from "../middleware/auth";

router.get("/get-notification-user", isAuthenticated, getNotificationByUser);
router.patch("/update-notification", isAuthenticated, updateNotification);

export default router;