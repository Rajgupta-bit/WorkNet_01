import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },

    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
      default: "10:00",
    },

    location: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "IN_PROGRESS",
        "WORK_COMPLETED",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "PENDING",
    },

    completionRequested: {
      type: Boolean,
      default: false,
    },

    completionConfirmed: {
      type: Boolean,
      default: false,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },

    paymentMethod: {
      type: String,
      enum: ["CASH", "ONLINE"],
      default: "CASH",
    },

    razorpayOrderId: {
      type: String,
      default: null,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
    },

    razorpaySignature: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Booking",
  bookingSchema
);