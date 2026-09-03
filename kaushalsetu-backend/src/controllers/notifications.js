import Notification from "../models/Notification.js";

export async function mine(req, res) {
  try {
    const notifications = await Notification.find({
      userId: req.user._id,
    })
      .populate({
        path: "bookingId",
        populate: {
          path: "providerId",
          select: "name phone city userId",
          populate: {
            path: "userId",
            select: "name phone",
          },
        },
      })
      .sort({
        createdAt: -1,
      });
    
//       console.log(
//   JSON.stringify(notifications, null, 2)
// );

    return res.json(notifications);
  } catch (error) {
    console.error("Notifications error:", error);

    return res.status(500).json({
      message: "Unable to load notifications",
    });
  }
}

export async function markRead(
  req,
  res
) {
  try {
    const notification =
      await Notification.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

    if (!notification) {
      return res.status(404).json({
        message:
          "Notification not found",
      });
    }

    notification.read = true;

    await notification.save();

    return res.json(notification);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Unable to update notification",
    });
  }
}

export async function markAllRead(
  req,
  res
) {
  try {
    await Notification.updateMany(
      {
        userId: req.user._id,
        read: false,
      },
      {
        $set: {
          read: true,
        },
      }
    );

    return res.json({
      message:
        "All notifications marked as read",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Unable to update notifications",
    });
  }
}