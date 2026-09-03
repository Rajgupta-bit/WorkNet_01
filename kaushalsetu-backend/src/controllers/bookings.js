import Booking from "../models/Booking.js";
import Notification from "../models/Notification.js";
import Provider from "../models/Provider.js";

/* =====================================================
   CREATE BOOKING
===================================================== */

export async function create(req, res) {
  try {
    const {
      providerId,
      serviceId,
      date,
      time,
      location,
      amount,
      paymentStatus,
      paymentMethod,
      orderId,
      paymentId,
      signature,
    } = req.body;

    if (
      !providerId ||
      !serviceId ||
      !date ||
      !location
    ) {
      return res.status(400).json({
        message:
          "Provider, service, date and location are required",
      });
    }

    const provider = await Provider.findById(
      providerId
    );

    if (!provider) {
      return res.status(404).json({
        message: "Provider not found",
      });
    }

    const booking = await Booking.create({
      customerId: req.user._id,

      providerId,

      serviceId,

      date,

      time: time || "10:00",

      location,

      amount: Number(amount || 0),

      status: "PENDING",

      paymentStatus:
        paymentStatus || "PENDING",

      paymentMethod:
        paymentMethod || "CASH",

      razorpayOrderId:
        orderId || null,

      razorpayPaymentId:
        paymentId || null,

      razorpaySignature:
        signature || null,

      completionRequested: false,

      completionConfirmed: false,
    });

    /* PROVIDER NOTIFICATION */

    if (provider.userId) {
      await Notification.create({
        userId: provider.userId,

        bookingId: booking._id,

        type: "BOOKING_CREATED",

        title: "New booking request",

        message:
          "You have received a new service booking request.",

        read: false,
      });
    }

    const populatedBooking =
      await Booking.findById(
        booking._id
      )
        .populate("serviceId")
        .populate({
          path: "providerId",
          populate: {
            path: "userId",
            select: "name email",
          },
        });

    return res.status(201).json(
      populatedBooking
    );
  } catch (error) {
    console.error(
      "Create booking error:",
      error
    );

    return res.status(500).json({
      message: "Unable to create booking",
    });
  }
}

/* =====================================================
   MY BOOKINGS
===================================================== */

export async function mine(req, res) {
  try {
    const providerIds =
      await Provider.find({
        userId: req.user._id,
      }).distinct("_id");

    const bookings =
      await Booking.find({
        $or: [
          {
            customerId: req.user._id,
          },
          {
            providerId: {
              $in: providerIds,
            },
          },
        ],
      })
        .populate({
          path: "providerId",
          populate: {
            path: "userId",
            select: "name email",
          },
        })
        .populate("serviceId")
        .populate("customerId")
        .sort({
          createdAt: -1,
        });

    return res.json(bookings);
  } catch (error) {
    console.error(
      "Mine bookings error:",
      error
    );

    return res.status(500).json({
      message: "Unable to load bookings",
    });
  }
}

/* =====================================================
   PROVIDER BOOKINGS
===================================================== */

export async function providerBookings(
  req,
  res
) {
  try {
    const provider =
      await Provider.findOne({
        userId: req.user._id,
      });

    if (!provider) {
      return res.status(404).json({
        message:
          "Provider profile not found",
      });
    }

    const bookings =
      await Booking.find({
        providerId: provider._id,
      })
        .populate("serviceId")
        .populate({
          path: "customerId",
          select: "name email phone",
        })
        .populate({
          path: "providerId",
          populate: {
            path: "userId",
            select: "name email",
          },
        })
        .sort({
          createdAt: -1,
        });

    return res.json(bookings);
  } catch (error) {
    console.error(
      "Provider bookings error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load provider bookings",
    });
  }
}

/* =====================================================
   CANCEL BOOKING
===================================================== */

export async function cancel(
  req,
  res
) {
  try {
    const booking =
      await Booking.findById(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (
      booking.customerId.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to cancel this booking",
      });
    }

    if (
      [
        "COMPLETED",
        "WORK_COMPLETED",
      ].includes(booking.status)
    ) {
      return res.status(400).json({
        message:
          "This booking cannot be cancelled",
      });
    }

    booking.status = "CANCELLED";

    await booking.save();

    const provider =
      await Provider.findById(
        booking.providerId
      );

    if (provider?.userId) {
      await Notification.create({
        userId: provider.userId,

        bookingId: booking._id,

        type: "BOOKING_CANCELLED",

        title: "Booking cancelled",

        message:
          "A customer has cancelled the booking.",

        read: false,
      });
    }

    return res.json(booking);
  } catch (error) {
    console.error(
      "Cancel error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to cancel booking",
    });
  }
}

/* =====================================================
   PROVIDER STATUS
===================================================== */

export async function updateProviderStatus(
  req,
  res
) {
  try {
    const { status } = req.body;

    const allowed = [
      "PENDING",
      "CONFIRMED",
      "IN_PROGRESS",
      "WORK_COMPLETED",
      "CANCELLED",
    ];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: "Invalid booking status",
      });
    }

    const provider =
      await Provider.findOne({
        userId: req.user._id,
      });

    if (!provider) {
      return res.status(403).json({
        message:
          "Provider profile not found",
      });
    }

    const booking =
      await Booking.findOne({
        _id: req.params.id,
        providerId: provider._id,
      });

    if (!booking) {
      return res.status(404).json({
        message:
          "Booking not found or not assigned to you",
      });
    }

    booking.status = status;

    if (status === "WORK_COMPLETED") {
      booking.completionRequested = true;

      booking.completionConfirmed = false;

      /* Remove old pending completion notifications */

      await Notification.deleteMany({
        userId: booking.customerId,
        bookingId: booking._id,
        type: "WORK_COMPLETED",
        completionResponded: false,
      });

      /* Create NEW notification */

      await Notification.create({
        userId: booking.customerId,

        bookingId: booking._id,

        type: "WORK_COMPLETED",

        title: "Work completed",

        message:
          "The provider has marked your work as completed. Please confirm whether the work was completed.",

        read: false,

        completionResponded: false,

        completionConfirmed: false,
      });
    }

    await booking.save();

    /* NORMAL STATUS NOTIFICATIONS */

    if (status === "CONFIRMED") {
      await Notification.create({
        userId: booking.customerId,

        bookingId: booking._id,

        type: "BOOKING_CONFIRMED",

        title: "Booking confirmed",

        message:
          "Your provider has confirmed the booking.",

        read: false,
      });
    }

    if (status === "IN_PROGRESS") {
      await Notification.create({
        userId: booking.customerId,

        bookingId: booking._id,

        type: "WORK_STARTED",

        title: "Work started",

        message:
          "Your provider has started working on your booking.",

        read: false,
      });
    }

    const updated =
      await Booking.findById(
        booking._id
      )
        .populate("serviceId")
        .populate({
          path: "customerId",
          select: "name email phone",
        })
        .populate({
          path: "providerId",
          populate: {
            path: "userId",
            select: "name email",
          },
        });

    return res.json(updated);
  } catch (error) {
    console.error(
      "Provider status error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to update booking status",
    });
  }
}

/* =====================================================
   MARK COMPLETED
===================================================== */

export async function markCompleted(
  req,
  res
) {
  req.body.status =
    "WORK_COMPLETED";

  return updateProviderStatus(
    req,
    res
  );
}

/* =====================================================
   CUSTOMER CONFIRMS COMPLETION
===================================================== */

export async function completion(
  req,
  res
) {
  try {
    const completed =
      req.body.completed === true;

    const booking =
      await Booking.findById(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (
      booking.customerId.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "Only the customer can confirm completion",
      });
    }

    if (
      booking.status !==
        "WORK_COMPLETED" ||
      booking.completionRequested !==
        true
    ) {
      return res.status(400).json({
        message:
          "Provider has not marked this work as completed",
      });
    }

    if (completed) {
      booking.status = "COMPLETED";

      booking.completionConfirmed =
        true;

      booking.completionRequested =
        false;
    } else {
      booking.status = "IN_PROGRESS";

      booking.completionConfirmed =
        false;

      booking.completionRequested =
        false;
    }

    await booking.save();

    /* CUSTOMER NOTIFICATION = RESPONDED */

    await Notification.updateMany(
      {
        userId: req.user._id,

        bookingId: booking._id,

        type: "WORK_COMPLETED",

        completionResponded: false,
      },
      {
        $set: {
          read: true,

          completionResponded: true,

          completionConfirmed:
            completed,
        },
      }
    );

    /* PROVIDER NOTIFICATION */

    const provider =
      await Provider.findById(
        booking.providerId
      );

    if (provider?.userId) {
      await Notification.create({
        userId: provider.userId,

        bookingId: booking._id,

        type: completed
          ? "COMPLETION_CONFIRMED"
          : "COMPLETION_REJECTED",

        title: completed
          ? "Work completion confirmed"
          : "Work completion rejected",

        message: completed
          ? "The customer confirmed that the work was completed."
          : "The customer reported that the work was not completed.",

        read: false,
      });
    }

    const updated =
      await Booking.findById(
        booking._id
      )
        .populate("serviceId")
        .populate({
          path: "customerId",
          select: "name email phone",
        })
        .populate({
          path: "providerId",
          populate: {
            path: "userId",
            select: "name email",
          },
        });

    return res.json(updated);
  } catch (error) {
    console.error(
      "Completion error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to confirm completion",
    });
  }
}

export async function confirm(
  req,
  res
) {
  return completion(req, res);
}

export async function confirmCompletion(
  req,
  res
) {
  return completion(req, res);
}