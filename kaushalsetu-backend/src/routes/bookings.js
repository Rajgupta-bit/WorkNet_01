import { Router } from "express";

import {
  create,
  mine,
  providerBookings,
  cancel,
  updateProviderStatus,
  completion,
} from "../controllers/bookings.js";

import { protect } from "../middleware/auth.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

router.use(protect);

/*
|--------------------------------------------------------------------------
| Customer routes
|--------------------------------------------------------------------------
*/

// Create booking
router.post("/", create);

// Get customer's bookings
// Also returns bookings where the logged-in user is the provider
router.get("/mine", mine);

// Cancel booking
router.patch("/:id/cancel", cancel);

// Customer confirms/rejects provider completion
router.patch("/:id/completion", completion);

/*
|--------------------------------------------------------------------------
| Provider routes
|--------------------------------------------------------------------------
*/

// Get bookings assigned to logged-in provider
router.get("/provider", providerBookings);

// Provider changes booking status
//
// Example:
// PATCH /api/bookings/provider/BOOKING_ID/status
//
// Body:
// {
//   "status": "CONFIRMED"
// }
//
// or
//
// {
//   "status": "IN_PROGRESS"
// }
//
// or
//
// {
//   "status": "WORK_COMPLETED"
// }
router.patch(
  "/provider/:id/status",
  updateProviderStatus
);

export default router;