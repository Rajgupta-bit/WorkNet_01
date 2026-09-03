import { Router } from "express";

import {
  createOrder,
  verifyPayment,
  markCashPayment,
} from "../controllers/payments.js";

import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

// Razorpay
router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);

// Cash
router.post("/cash", markCashPayment);

export default router;