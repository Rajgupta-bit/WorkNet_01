import Razorpay from "razorpay";
import crypto from "crypto";

import Booking from "../models/Booking.js";
import Notification from "../models/Notification.js";
import Provider from "../models/Provider.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

function isCustomer(booking, userId) {
  const customerId =
    booking.customerId?._id?.toString() ||
    booking.customerId?.toString();

  return customerId === userId.toString();
}

/* =========================================================
   CREATE RAZORPAY ORDER
========================================================= */

export async function createOrder(req, res) {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        message: "Booking ID is required",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (!isCustomer(booking, req.user._id)) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    if (booking.paymentStatus === "PAID") {
      return res.status(400).json({
        message: "This booking has already been paid.",
      });
    }

    const amount = Number(booking.amount || 0);

    if (amount <= 0) {
      return res.status(400).json({
        message: "Invalid booking amount",
      });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `booking_${booking._id}`,
      notes: {
        bookingId: booking._id.toString(),
        customerId: req.user._id.toString(),
      },
    });

    booking.razorpayOrderId = order.id;

    await booking.save();

    return res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);

    return res.status(500).json({
      message: "Unable to create payment order",
    });
  }
}

/* =========================================================
   VERIFY RAZORPAY PAYMENT
========================================================= */

export async function verifyPayment(req, res) {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !bookingId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Payment information is incomplete",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (!isCustomer(booking, req.user._id)) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    if (
      booking.razorpayOrderId &&
      booking.razorpayOrderId !== razorpay_order_id
    ) {
      return res.status(400).json({
        message: "Payment order does not match this booking",
      });
    }

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    booking.paymentStatus = "PAID";
    booking.paymentMethod = "ONLINE";
    booking.razorpayOrderId = razorpay_order_id;
    booking.razorpayPaymentId = razorpay_payment_id;

    await booking.save();

    // Customer notification
    await Notification.create({
      userId: booking.customerId,
      bookingId: booking._id,
      type: "PAYMENT_SUCCESS",
      title: "Payment successful",
      message: `Your online payment of ₹${booking.amount} was successful.`,
      read: false,
    });

    // Provider notification
    const provider = await Provider.findById(
      booking.providerId
    );

    if (provider?.userId) {
      await Notification.create({
        userId: provider.userId,
        bookingId: booking._id,
        type: "PAYMENT_RECEIVED",
        title: "Payment received",
        message: `Customer has paid ₹${booking.amount} online.`,
        read: false,
      });
    }

    return res.json({
      success: true,
      message: "Payment verified successfully",
      booking,
    });
  } catch (error) {
    console.error("Verify payment error:", error);

    return res.status(500).json({
      message: "Unable to verify payment",
    });
  }
}

/* =========================================================
   CASH PAYMENT
========================================================= */

export async function markCashPayment(req, res) {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        message: "Booking ID is required",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (!isCustomer(booking, req.user._id)) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    if (booking.paymentStatus === "PAID") {
      return res.status(400).json({
        message: "This booking has already been paid.",
      });
    }

    booking.paymentMethod = "CASH";
    booking.paymentStatus = "PAID";

    await booking.save();

    await Notification.create({
      userId: booking.customerId,
      bookingId: booking._id,
      type: "PAYMENT_CASH_SELECTED",
      title: "Cash payment selected",
      message: `Cash payment of ₹${booking.amount} has been recorded successfully.`,
      read: false,
    });

    const provider = await Provider.findById(
      booking.providerId
    );

    if (provider?.userId) {
      await Notification.create({
        userId: provider.userId,
        bookingId: booking._id,
        type: "PAYMENT_CASH_SELECTED",
        title: "Cash payment selected",
        message: `Customer selected cash payment of ₹${booking.amount}.`,
        read: false,
      });
    }

    return res.json({
      success: true,
      message: "Cash payment recorded successfully",
      booking,
    });
  } catch (error) {
    console.error("Cash payment error:", error);

    return res.status(500).json({
      message: "Unable to record cash payment",
    });
  }
}