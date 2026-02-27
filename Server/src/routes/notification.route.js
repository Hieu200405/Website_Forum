const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, notificationController.getNotifications);
router.put("/:id/read", authMiddleware, notificationController.markAsRead);

module.exports = router;
