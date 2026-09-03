import { Router } from "express";

import {
  mine,
  markRead,
  markAllRead,
} from "../controllers/notifications.js";

import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/", mine);

router.patch(
  "/:id/read",
  markRead
);

router.patch(
  "/read-all",
  markAllRead
);

export default router;